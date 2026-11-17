#!/usr/bin/env node
/* 밤의 목장 — 정적 점검 (설치할 것 없음, Node만 있으면 됨)
   실행:  node tools/check.mjs          오류가 있으면 종료 코드 1
          node tools/check.mjs --deps   파일 간 의존 관계까지 출력
   앱에 실리는 코드가 아니라 개발용 도구입니다. 수정 후 커밋 전에 한 번 돌립니다. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const errors = [], warns = [], infos = [];
const err = m => errors.push(m), warn = m => warns.push(m), info = m => infos.push(m);

/* ── 주석 제거 (문자열·템플릿은 남김: 그 안의 onclick="fn()"도 사용처로 세야 하므로) ── */
function stripComments(src) {
    let out = '', i = 0, n = src.length, prev = '';
    while (i < n) {
        const c = src[i], d = src[i + 1];
        if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') { out += ' '; i++; } continue; }
        if (c === '/' && d === '*') {
            while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { out += src[i] === '\n' ? '\n' : ' '; i++; }
            out += '  '; i += 2; continue;
        }
        if (c === '"' || c === "'" || c === '`') {
            const q = c; out += c; i++;
            while (i < n && src[i] !== q) {
                if (src[i] === '\\') { out += src[i] + (src[i + 1] ?? ''); i += 2; continue; }
                if (q !== '`' && src[i] === '\n') break;
                out += src[i]; i++;
            }
            out += src[i] ?? ''; i++; prev = q; continue;
        }
        if (c === '/' && (prev === '' || '(,=:[!&|?{};\n'.includes(prev))) { // 정규식 리터럴
            out += c; i++;
            let inClass = false;
            while (i < n && src[i] !== '\n') {
                if (src[i] === '\\') { out += src[i] + src[i + 1]; i += 2; continue; }
                if (src[i] === '[') inClass = true; else if (src[i] === ']') inClass = false;
                else if (src[i] === '/' && !inClass) break;
                out += src[i]; i++;
            }
            out += src[i] ?? ''; i++; prev = '/'; continue;
        }
        out += c; if (!/\s/.test(c) || c === '\n') prev = c; i++;
    }
    return out;
}

/* ── 1. index.html: 스크립트 순서·id·class·인라인 핸들러 ── */
const html = read('index.html');
const scripts = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)"/g)].map(m => m[1]);
const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
{
    const seen = new Set();
    for (const m of html.matchAll(/\sid="([^"]+)"/g)) { if (seen.has(m[1])) err(`index.html: id="${m[1]}" 가 두 번 나옴`); seen.add(m[1]); }
}
const handlerCalls = new Set();
for (const m of html.matchAll(/\son[a-z]+="([^"]+)"/g))
    for (const f of m[1].matchAll(/(?<![\w.$])([A-Za-z_$][\w$]*)\s*\(/g)) handlerCalls.add(f[1]);

/* ── 2. 파일 목록 일치: index.html ↔ 디스크 ↔ sw.js ── */
const diskJs = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f);
for (const f of diskJs) if (!scripts.includes(f)) err(`${f}: index.html의 <script> 목록에 없음`);
for (const f of scripts) if (!diskJs.includes(f)) err(`index.html이 부르는 ${f} 파일이 없음`);
const sw = read('sw.js');
const swAssets = [...(sw.match(/const ASSETS = \[([\s\S]*?)\];/)?.[1] ?? '').matchAll(/'\.\/([^']*)'/g)].map(m => m[1]);
for (const f of [...scripts, ...cssFiles]) if (!swAssets.includes(f)) err(`sw.js ASSETS에 ${f} 가 없음 (오프라인에서 화면이 깨짐)`);
for (const f of swAssets) if (f && !fs.existsSync(path.join(ROOT, f))) err(`sw.js ASSETS의 ${f} 파일이 없음 (Service Worker 설치가 통째로 실패함)`);

/* ── 3. 문법 검사 ── */
for (const f of [...scripts, 'sw.js']) {
    try { execFileSync(process.execPath, ['--check', path.join(ROOT, f)], { stdio: 'pipe' }); }
    catch (e) { err(`${f}: 문법 오류\n${String(e.stderr).split('\n').slice(0, 6).join('\n')}`); }
}

/* ── 4. 최상위 선언 수집, 파일 간 이름 충돌 ── */
const src = {}, code = {};
for (const f of scripts) { src[f] = read(f); code[f] = stripComments(src[f]); }
function splitTop(s) { // 깊이 0의 쉼표로 나눔
    const parts = []; let depth = 0, cur = '', q = null;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (q) { cur += c; if (c === '\\') { cur += s[++i] ?? ''; } else if (c === q) q = null; continue; }
        if (c === '"' || c === "'" || c === '`') { q = c; cur += c; continue; }
        if ('([{'.includes(c)) depth++; else if (')]}'.includes(c)) depth--;
        if (c === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += c;
    }
    parts.push(cur); return parts;
}
const decl = new Map(); // 이름 → {file, line, kind}
for (const f of scripts) {
    code[f].split('\n').forEach((line, i) => {
        let m, names = [], kind = '';
        if ((m = line.match(/^(?:async\s+)?function\s+([\w$]+)/))) { names = [m[1]]; kind = 'function'; }
        else if ((m = line.match(/^(const|let|var)\s+(.*)$/))) {
            kind = m[1];
            const body = m[2];
            const parts = /;\s*$/.test(body) ? splitTop(body.replace(/;\s*$/, '')) : [body];
            names = parts.map(p => p.trim().match(/^([\w$]+)/)?.[1]).filter(Boolean);
        }
        for (const name of names) {
            if (decl.has(name)) err(`'${name}' 이(가) ${decl.get(name).file} 와 ${f}:${i + 1} 에 중복 선언됨 (뒤 파일 전체가 실행되지 않음)`);
            else decl.set(name, { file: f, line: i + 1, kind });
        }
    });
}

/* ── 5. 쓰이지 않는 최상위 이름 (죽은 코드 후보) / HTML이 부르는데 없는 함수 ── */
const allCode = scripts.map(f => code[f]).join('\n');
const handlerText = [...html.matchAll(/\son[a-z]+="([^"]+)"/g)].map(m => m[1]).join('\n');
const inlineScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
const count = (text, name) => (text.match(new RegExp(`(?<![\\w$])${name.replace(/\$/g, '\\$')}(?![\\w$])`, 'g')) || []).length;
for (const [name, d] of decl) {
    const n = count(allCode, name) + count(handlerText, name) + count(inlineScript, name);
    if (n <= 1) warn(`죽은 코드 후보: ${d.kind} ${name} (${d.file}:${d.line}) — 어디서도 쓰이지 않음`);
}
const BUILTIN = new Set(['if', 'function', 'event', 'document', 'this']);
for (const fn of handlerCalls)
    if (!decl.has(fn) && !BUILTIN.has(fn) && !/^(getElementById|add|remove|toggle|contains|preventDefault|stopPropagation)$/.test(fn))
        err(`index.html의 on…="${fn}()" — 그런 함수가 js/에 없음`);

/* ── 6. JS가 찾는 id가 실제로 있는가 ── */
const dynIds = new Set([...allCode.matchAll(/\bid\s*=\s*\\?["']([\w-]+)["']/g)].map(m => m[1]));
for (const m of allCode.matchAll(/\.id\s*=\s*'([\w-]+)'/g)) dynIds.add(m[1]);
for (const f of scripts)
    for (const m of code[f].matchAll(/getElementById\(\s*'([^']+)'\s*\)/g))
        if (!htmlIds.has(m[1]) && !dynIds.has(m[1])) warn(`${f}: getElementById('${m[1]}') — index.html에 그런 id가 없음`);
/* s('id', …) 처럼 id를 문자열로 넘기는 헬퍼 호출도 확인 */
for (const f of scripts)
    for (const m of code[f].matchAll(/\b(?:s|sh)\(\s*'([\w-]+)'\s*,/g))
        if (!htmlIds.has(m[1]) && !dynIds.has(m[1])) warn(`${f}: '${m[1]}' — index.html에 그런 id가 없음 (없는 요소에 문구를 넣으려 함)`);

/* ── 7. 금지 패턴 ── */
for (const f of scripts) {
    code[f].split('\n').forEach((line, i) => {
        if (line.includes('🌙')) err(`${f}:${i + 1}: 달 이모지 사용 금지 (CLAUDE.md v2.7 — 달은 .moon-shape 로만)`);
        if (f !== 'js/core.js' && /toISOString\(\)\s*\.slice\(0,\s*(10|7)\)/.test(line))
            err(`${f}:${i + 1}: toISOString().slice() 로 날짜를 만들면 UTC 기준이라 한국 자정~오전 9시에 하루가 밀림 → ymd() / todayStr() 사용`);
        if (/service_role|sb_secret_|test_sk_|live_sk_|sk-or-/.test(line)) err(`${f}:${i + 1}: 서버 전용 키가 브라우저 코드에 있음`);
        if (/\bsk-or-|\btest_sk_|\blive_sk_/.test(line)) err(`${f}:${i + 1}: 비밀 키(OpenRouter/토스 시크릿)가 브라우저 코드에 있음`);
    });
}

/* ── 8. 데이터를 실제로 불러 값 검증 (브라우저 없이, 가짜 DOM으로) ── */
const stub = new Proxy(function () {}, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'then' ? undefined : stub),
    apply: () => stub, construct: () => stub, set: () => true,
});
const ctx = vm.createContext({
    document: stub, window: stub, navigator: stub, location: stub, localStorage: stub, sessionStorage: stub,
    matchMedia: stub, requestAnimationFrame: () => 0, setTimeout: () => 0, setInterval: () => 0, clearTimeout() {}, clearInterval() {},
    performance: { now: () => 0 }, innerWidth: 390, innerHeight: 800, console: { log() {}, warn() {}, error() {} },
    Audio: stub, URL, Intl,
});
for (const f of scripts) {
    try { vm.runInContext(src[f], ctx, { filename: f }); }
    catch (e) { err(`${f}: 불러오는 중 오류 — ${e.message} (앞 파일에 없는 것을 불러오자마자 쓰고 있을 수 있음)`); }
}
const get = name => { try { return vm.runInContext(name, ctx); } catch { return undefined; } };

/* 앱 주소: js/core.js의 SHARE_URL과 index.html og:url, sitemap.xml이 같아야 한다 (도메인을 바꿀 때 빠뜨리지 않게) */
{
    const share = (fs.readFileSync(path.join(ROOT, 'js/core.js'), 'utf8').match(/const SHARE_URL = '([^']+)'/) || [])[1];
    const og = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/property="og:url" content="([^"]+)"/) || [])[1];
    const sm = fs.existsSync(path.join(ROOT, 'sitemap.xml')) ? (fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').match(/<loc>([^<]+)<\/loc>/) || [])[1] : share;
    if (!share) err('js/core.js에서 SHARE_URL을 찾지 못함');
    else {
        if (og !== share) err(`index.html og:url(${og}) 이 SHARE_URL(${share}) 과 다름`);
        if (sm !== share) err(`sitemap.xml 주소(${sm}) 가 SHARE_URL(${share}) 과 다름`);
    }
}

const LANG = get('LANG_DATA');
if (!LANG) err('LANG_DATA를 읽지 못함');
else {
    const ko = Object.keys(LANG.ko);
    for (const lang of ['en', 'ja']) {
        const keys = new Set(Object.keys(LANG[lang] || {}));
        for (const k of ko) if (!keys.has(k)) err(`LANG_DATA.${lang}.${k} 없음 (화면에 undefined가 보임)`);
        for (const k of keys) if (!LANG.ko[k]) err(`LANG_DATA.${lang}.${k} 는 있는데 ko에는 없음`);
        for (const k of ko) {
            const a = LANG.ko[k], b = LANG[lang][k];
            if (Array.isArray(a) && Array.isArray(b) && ['emo', 'topic', 'need', 'day_names', 'month_names'].includes(k) && a.length !== b.length)
                err(`LANG_DATA.${lang}.${k} 개수(${b.length})가 ko(${a.length})와 다름`);
        }
    }
    const used = new Set();
    for (const m of allCode.matchAll(/\bL\w?\.([A-Za-z_]\w*)/g)) used.add(m[1]);
    for (const m of allCode.matchAll(/\bLANG_DATA(?:\.\w+|\[\w+\])\)?\.([A-Za-z_]\w*)/g)) used.add(m[1]);
    const prefixes = [...allCode.matchAll(/\bL\w?\[\s*'([\w]+)'\s*\+/g)].map(m => m[1]);
    const quoted = new Set([...allCode.matchAll(/'([a-z][a-z0-9_]+)'/g)].map(m => m[1]));
    for (const m of allCode.matchAll(/(?<![\w$])L\w?\.([A-Za-z_]\w*)/g))
        if (!(m[1] in LANG.ko)) err(`코드가 L.${m[1]} 를 쓰는데 LANG_DATA에 그런 문구가 없음`);
    const dead = ko.filter(k => !used.has(k) && !quoted.has(k) && !prefixes.some(p => k.startsWith(p)));
    if (dead.length) warn(`쓰이지 않는 문구 키 ${dead.length}개 (ko/en/ja 각각): ${dead.join(', ')}`);
}

const EMO = ['감사', '평안', '걱정', '지침', '아픔', '기도'], TOPIC = ['일', '가족', '공부', '사람', '모름'], NEED = ['위로', '힘', '지혜', '쉼'];
function checkPool(name, keysA, keysB, { minLen = 1 } = {}) {
    const pool = get(name);
    if (!pool) { err(`${name} 을(를) 읽지 못함`); return; }
    const want = new Set(keysA.flatMap(a => keysB.map(b => `${a}_${b}`)));
    for (const k of want) {
        const v = pool[k];
        const len = Array.isArray(v) ? v.length : (v ? 1 : 0);
        if (len < minLen) { err(`${name}['${k}'] 비어 있음 (그 조합을 고르면 빈 카드가 나옴)`); continue; }
        if (Array.isArray(v)) v.forEach((x, i) => {
            if (name.startsWith('VERSE') && (!x || !x.v || !x.r)) err(`${name}['${k}'][${i}] 본문(v) 또는 출처(r) 없음`);
            if (!name.startsWith('VERSE') && (typeof x !== 'string' || !x.trim())) err(`${name}['${k}'][${i}] 빈 글`);
        });
    }
    for (const k of Object.keys(pool)) if (!want.has(k)) warn(`${name}['${k}'] — 쓰이지 않는 조합 키`);
}
checkPool('VERSE_POOL', EMO, NEED);
checkPool('VERSE_POOL_EN', EMO, NEED);
checkPool('REFLECTIONS', EMO, TOPIC);
checkPool('REFLECTIONS_EN', EMO, TOPIC);
checkPool('ENCS', EMO, NEED);
checkPool('ENCS_EN', EMO, NEED);

/* ── 9. CSS: 어디서도 쓰이지 않는 class / id ── */
const cssText = cssFiles.map(read).join('\n').replace(/\/\*[\s\S]*?\*\//g, ' ');
const selectorText = cssText.replace(/\{[^{}]*\}/g, '{}');
const useText = html + '\n' + scripts.map(f => src[f]).join('\n');
const dynPrefixes = [...useText.matchAll(/['"`]\s*([\w-]*[a-z]-)['"`]\s*\+/g)].map(m => m[1])
    .concat([...useText.matchAll(/([a-z][\w-]*-)\$\{/g)].map(m => m[1]));
const cssClasses = new Set([...selectorText.matchAll(/\.(-?[_a-zA-Zㄱ-힝][\wㄱ-힝-]*)/g)].map(m => m[1]));
const deadCss = [];
for (const c of cssClasses) {
    if (dynPrefixes.some(p => c.startsWith(p))) continue;
    const re = new RegExp(`(?<![\\wㄱ-힝-])${c.replace(/[-$]/g, '\\$&')}(?![\\wㄱ-힝-])`);
    if (!re.test(useText)) deadCss.push('.' + c);
}
const cssIds = new Set([...selectorText.matchAll(/#(-?[_a-zA-Z][\w-]*)/g)].map(m => m[1]));
for (const id of cssIds) if (!htmlIds.has(id) && !dynIds.has(id) && !new RegExp(`['"\`]${id}['"\`]`).test(useText)) deadCss.push('#' + id);
if (deadCss.length) warn(`쓰이지 않는 CSS 선택자 ${deadCss.length}개: ${deadCss.join(' ')}`);
/* 12px 미만 글씨 금지 (CLAUDE.md). 글이 아닌 장식 기호는 같은 줄에 "장식 기호" 주석을 달아 예외로 둔다 */
for (const f of [...cssFiles, 'index.html'])
    read(f).split('\n').forEach((line, i) => {
        for (const m of line.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g))
            if (+m[1] < 12 && !line.includes('장식 기호')) warn(`${f}:${i + 1}: font-size:${m[1]}px — 12px 미만 금지`);
    });

/* ── 10. 버전 표기 일치 ── */
const ver = get('APP_VERSION');
const cl = read('CHANGELOG.md').match(/^## \[v([\d.]+)\]/m)?.[1];
if (ver && cl && !cl.startsWith(ver)) warn(`APP_VERSION(${ver}) 과 CHANGELOG 최신 항목(v${cl}) 이 다름`);
info(`Service Worker 캐시: ${sw.match(/const CACHE = '([^']+)'/)?.[1]} · APP_VERSION ${ver} · CHANGELOG v${cl}`);

/* ── 11. 의존 관계 (--deps) ── */
if (process.argv.includes('--deps')) {
    console.log('\n파일 간 의존 관계 (→ 다른 파일의 무엇을 쓰는가)');
    for (const f of scripts) {
        const by = {};
        for (const [name, d] of decl) if (d.file !== f && count(code[f], name)) (by[d.file] ??= []).push(name);
        console.log(`\n${f}`);
        for (const [g, names] of Object.entries(by)) {
            const later = scripts.indexOf(g) > scripts.indexOf(f) ? ' (뒤에 불러오는 파일 — 함수 안에서만 써야 함)' : '';
            console.log(`  → ${g}${later}: ${names.join(', ')}`);
        }
    }
    const keys = new Set([...allCode.matchAll(/(?:lsGet|lsSet|lsArr|getItem|setItem|removeItem)\(\s*'([\w]+)'/g)].map(m => m[1]));
    console.log(`\nlocalStorage 키 ${keys.size}개: ${[...keys].sort().join(', ')}`);
}

/* ── 결과 ── */
for (const m of infos) console.log('·', m);
if (warns.length) { console.log(`\n경고 ${warns.length}건`); for (const m of warns) console.log('  ⚠', m); }
if (errors.length) { console.log(`\n오류 ${errors.length}건`); for (const m of errors) console.log('  ✗', m); process.exit(1); }
console.log(`\n✓ 정적 점검 통과 (파일 ${scripts.length}개, 최상위 이름 ${decl.size}개${warns.length ? `, 경고 ${warns.length}건` : ''})`);
