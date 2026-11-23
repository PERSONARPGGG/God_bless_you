#!/usr/bin/env node
/* 밤의 목장 — 실행 점검 (설치할 것 없음: Node 22+ 와 PC에 깔린 Chrome/Edge만 사용)
   실행:  node tools/smoke.mjs            전체 시나리오
          node tools/smoke.mjs 날짜        이름에 '날짜'가 들어간 시나리오만
          node tools/smoke.mjs --url=https://god-bless-you.vercel.app/   배포본을 상대로
          node tools/smoke.mjs 나의 --shots=폴더   시나리오 안의 p.shot('이름') 지점을 PNG로 저장 (눈으로 확인용)
   로컬 파일을 임시 서버로 띄우고, 화면 없는 브라우저로 실제 클릭·입력을 해 본 뒤
   잡히지 않은 오류가 하나라도 있으면 실패로 처리합니다. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const REMOTE = args.find(a => a.startsWith('--url='))?.slice(6);
const FILTER = args.filter(a => !a.startsWith('--'));
const SHOTS = args.find(a => a.startsWith('--shots='))?.slice(8);
const sleep = ms => new Promise(r => setTimeout(r, ms));
/* 영어·일본어는 평소 잠겨 있음(core.js ENABLED_LANGS). 그 데이터가 망가지지 않았는지 보는 시나리오에서만 연다 */
const OPEN_LANGS = `['en','ja'].forEach(l => { if (!ENABLED_LANGS.includes(l)) ENABLED_LANGS.push(l); }); syncLangChoices();`;

/* ── 임시 서버 ── */
const MIME = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8',
    json: 'application/json', svg: 'image/svg+xml', mp3: 'audio/mpeg', png: 'image/png', xml: 'application/xml' };
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') p = '/index.html';
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).slice(1)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = REMOTE || `http://127.0.0.1:${server.address().port}/`;

/* ── 브라우저 ── */
const BROWSERS = [process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
const exe = BROWSERS.find(p => fs.existsSync(p));
if (!exe) { console.error('Chrome/Edge를 찾지 못했습니다. CHROME_PATH 환경변수로 경로를 알려 주세요.'); process.exit(2); }
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mokjang-smoke-'));
const proc = spawn(exe, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--mute-audio', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    proc.stderr.on('data', d => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) resolve(m[1]); });
    proc.on('exit', () => reject(new Error('브라우저가 바로 종료됨\n' + buf)));
    setTimeout(() => reject(new Error('브라우저 시작 시간 초과')), 20000);
});
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let seq = 0; const pending = new Map(); const listeners = new Set();
ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
    else for (const l of listeners) l(msg);
};
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params, sessionId }));
});

/* 시나리오마다 저장소가 비어 있는 새 창을 엽니다 */
async function openPage({ seed = {}, intro = false, now = null, tz = 'Asia/Seoul', width = 390, height = 844 } = {}) {
    const { browserContextId } = await send('Target.createBrowserContext');
    const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const S = (m, p) => send(m, p, sessionId);
    const page = { errors: [], netFails: [], fails: [] };
    const onMsg = msg => {
        if (msg.sessionId !== sessionId) return;
        if (msg.method === 'Runtime.exceptionThrown') {
            const d = msg.params.exceptionDetails;
            page.errors.push((d.exception?.description || d.text || '').split('\n').slice(0, 3).join(' ⏎ ') + (d.url ? ` @ ${d.url.replace(BASE, '')}:${d.lineNumber + 1}` : ''));
        }
        if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
            const e = msg.params.entry;
            (e.source === 'network' ? page.netFails : page.errors).push(`${e.text} ${e.url || ''}`.trim());
        }
        if (msg.method === 'Page.javascriptDialogOpening') S('Page.handleJavaScriptDialog', { accept: true });
    };
    listeners.add(onMsg);
    await S('Page.enable'); await S('Runtime.enable'); await S('Log.enable'); await S('Network.enable');
    await S('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: true });
    await S('Emulation.setTimezoneOverride', { timezoneId: tz });
    const seedAll = { bgMusic: '0', ...seed };
    await S('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
        ${now ? `const RD = Date, off = new RD(${JSON.stringify(now)}).getTime() - RD.now();
        Date = class extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + off); } static now() { return RD.now() + off; } };` : ''}
        try {
            if (!sessionStorage.getItem('__seed')) {
                sessionStorage.setItem('__seed', '1');
                ${intro ? '' : `sessionStorage.setItem('coverShown', '1');`}
                for (const [k, v] of Object.entries(${JSON.stringify(seedAll)})) localStorage.setItem(k, v);
            }
        } catch (e) {}
        window.__t = {
            vis: s => { const e = document.querySelector(s); return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none'; },
            txt: s => (document.querySelector(s)?.textContent || '').trim(),
            click: s => { const e = document.querySelector(s); if (!e) throw new Error('없는 요소: ' + s); e.click(); },
            ls: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return localStorage.getItem(k); } },
        };
    })();` });
    page.S = S;
    page.eval = async (expression) => {
        const r = await S('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
        if (r.exceptionDetails) throw new Error('eval 실패: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + '\n  ' + expression.slice(0, 160));
        return r.result.value;
    };
    page.waitFor = async (expression, what = expression, timeout = 8000) => {
        const t0 = Date.now();
        while (Date.now() - t0 < timeout) { if (await page.eval(`!!(${expression})`)) return true; await sleep(80); }
        page.fails.push(`기다려도 되지 않음: ${what}`); return false;
    };
    page.ok = (cond, what) => { if (!cond) page.fails.push(what); return !!cond; };
    page.eq = (a, b, what) => page.ok(JSON.stringify(a) === JSON.stringify(b), `${what} — 기대 ${JSON.stringify(b)}, 실제 ${JSON.stringify(a)}`);
    page.goto = async (url = BASE) => {
        const loaded = new Promise(r => { const l = m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') { listeners.delete(l); r(); } }; listeners.add(l); });
        await S('Page.navigate', { url });
        await Promise.race([loaded, sleep(20000)]);
        await sleep(250);
    };
    page.reload = () => page.goto(BASE);
    /* 화면 캡처 — --shots=폴더 를 줬을 때만 저장 (평소 점검에서는 아무 일도 하지 않음) */
    page.shot = async name => {
        if (!SHOTS) return;
        fs.mkdirSync(SHOTS, { recursive: true });
        const { data } = await S('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(SHOTS, name + '.png'), Buffer.from(data, 'base64'));
    };
    page.close = async () => { listeners.delete(onMsg); await send('Target.disposeBrowserContext', { browserContextId }).catch(() => {}); };
    /* 감정→주제→필요를 실제로 눌러 결과 화면까지 */
    /* 버튼마다 빠르게 두 번 누른다 (손이 떨리거나 성급한 사용자). 한 번 누른 것과 결과가 같아야 한다 */
    page.flow = async (emo = '걱정', topic = '일', need = '위로') => {
        const ready = `typeof _picking === 'undefined' || !_picking`;
        await page.eval(`__t.click('.em-${emo}'); __t.click('.em-${emo}')`);
        await page.waitFor(`__t.vis('#step2') && (${ready})`, '2단계(주제) 화면');
        await page.eval(`__t.click('.bc-${topic}'); __t.click('.bc-${topic}')`);
        await page.waitFor(`__t.vis('#step3') && (${ready})`, '3단계(필요) 화면');
        await page.eval(`__t.click('.bc-${need}'); __t.click('.bc-${need}')`);
        return page.waitFor(`__t.vis('#step4') && !__t.vis('#step3')`, '결과 화면');
    };
    return page;
}

/* ── 시나리오 ── */
const scenarios = [];
const scenario = (name, opts, fn) => scenarios.push({ name, opts, fn });
const HANGUL = '/[\\uAC00-\\uD7A3]/';

scenario('첫 방문: 인트로 → 이름 입력 → 메인', { intro: true }, async p => {
    await p.goto();
    await p.waitFor(`document.getElementById('night-intro').classList.contains('gone')`, '인트로가 끝나고 사라짐', 9000);
    p.ok(await p.eval(`__t.vis('#overlay-name')`), '첫 방문 이름 입력창이 보여야 함');
    await p.eval(`document.getElementById('name-input').value = '은혜'; __t.click('#wc-start')`);
    p.ok(!(await p.eval(`__t.vis('#overlay-name')`)), '시작하기를 누르면 이름 입력창이 닫혀야 함');
    p.ok((await p.eval(`__t.txt('#welcome-text')`)).startsWith('은혜님'), '환영 문구에 이름이 들어가야 함');
    p.ok(await p.eval(`__t.vis('#checkin-pill')`), '출석 표시가 보여야 함');
    p.eq(await p.eval(`__t.txt('#app-version')`), 'v' + (await p.eval('APP_VERSION')), '설정의 버전 표기');
});

scenario('다른 말씀 보기 + 감정별 일기 안내문 + 동률인 주의 이야기', { seed: { userName: '은혜' } }, async p => {
    await p.goto();
    await p.flow('걱정', '일', '위로');
    p.ok((await p.eval(`__t.txt('#diary-label')`)).includes('맡겨'), '걱정이면 일기 안내문이 "맡겨 보세요"');
    p.ok(!(await p.eval(`__t.txt('#sec-diary')`)).includes('감사'), '일기 제목이 감사로 고정되어 있지 않음');
    p.ok(!(await p.eval(`__t.txt('#welcome-text')`)).includes('은혜로운 하루'), '마음이 무거운 날 인사말이 "은혜로운 하루"가 아님');
    const before = await p.eval(`curVerse.r + '|' + curVerse.v`);
    await p.eval(`__t.click('#btn-save')`);
    await p.eval(`__t.click('#btn-next')`);
    const after = await p.eval(`curVerse.r + '|' + curVerse.v`);
    p.ok(before !== after, '"다른 말씀"을 누르면 다른 구절로 바뀜');
    p.eq(await p.eval(`__t.txt('#r-ref')`), '— ' + after.split('|')[0], '화면의 장절도 바뀜');
    p.ok(!(await p.eval(`document.getElementById('btn-save').classList.contains('saved')`)), '새 구절은 즐겨찾기 표시가 풀림');
    p.eq(await p.eval(`__t.ls('moodHistory')[0].ref`), after.split('|')[0], '기록의 말씀도 바뀐 구절');
    p.eq(await p.eval(`__t.ls('moodHistory').length`), 1, '기록이 늘어나지 않음');
    // 감정이 동률이면 한 감정으로 단정하지 않음
    const t = await p.eval(`todayStr()`);
    await p.eval(`localStorage.setItem('moodHistory', JSON.stringify([{date:'${t}',emotion:'감사',topic:'일',need:'쉼'},{date:'${t}',emotion:'걱정',topic:'일',need:'쉼'}])); openDashboard()`);
    p.ok((await p.eval(`__t.txt('#db-narrative .db-narrative-main')`)).includes('여러 마음'), '동률이면 "여러 마음이 오갔군요"');
});

scenario('보관 기간: 62일 지난 기록은 덜어 내되, 일기를 쓴 기록은 1년 남음', { now: '2026-11-17T21:00:00+09:00', seed: { userName: '은혜', moodHistory: JSON.stringify([
    { date: '2026-03-01', emotion: '감사', topic: '일', need: '쉼', diary: '오래된 일기' },
    { date: '2026-03-02', emotion: '걱정', topic: '일', need: '쉼' },
    { date: '2025-01-01', emotion: '감사', topic: '일', need: '쉼', diary: '1년도 더 된 일기' }]) } }, async p => {
    await p.goto();
    await p.flow('평안', '일', '쉼');   // 기록을 저장하는 순간 정리가 돌아감
    const m = await p.eval(`__t.ls('moodHistory').map(h => h.date)`);
    p.ok(m.includes('2026-03-01'), '일기가 있는 8개월 전 기록은 남음');
    p.ok(!m.includes('2026-03-02'), '일기 없는 62일 지난 기록은 사라짐');
    p.ok(!m.includes('2025-01-01'), '1년이 지난 일기 기록은 사라짐');
});

scenario('일기: 쓰는 동안 기기에 저장(마치기 전에 앱이 닫혀도 남음), 저장 실패를 속이지 않음', { seed: { userName: '은혜' } }, async p => {
    await p.goto();
    await p.flow('아픔', '가족', '위로');
    await p.eval(`(() => { const i = document.getElementById('diary-input'); i.value = '버스에서 쓰던 일기'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(900);
    p.eq(await p.eval(`__t.ls('moodHistory')[0].diary`), '버스에서 쓰던 일기', '입력 0.6초 뒤 마치기 전에 기기에 저장');
    await p.eval(`document.getElementById('diary-input').value = '버스에서 쓰던 일기, 한 줄 더'`);
    await p.eval(`window.dispatchEvent(new Event('pagehide'))`);
    p.eq(await p.eval(`__t.ls('moodHistory')[0].diary`), '버스에서 쓰던 일기, 한 줄 더', '앱이 닫히는 순간(pagehide)에도 저장');
    p.eq(await p.eval(`__t.ls('moodHistory').length`), 1, '기록이 늘어나지 않음 (같은 줄에 덧씀)');
    // 쓴 글을 직접 모두 지우고 마치면 저장된 글도 사라져야 함 (지운 글이 기기·내보내기에 남지 않음)
    await p.eval(`(() => { const i = document.getElementById('diary-input'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); autoSaveDiary(); })()`);
    p.ok(!(await p.eval(`__t.ls('moodHistory')[0].diary`)), '글을 모두 지우고 마치면 저장된 일기도 지워짐');
    await p.eval(`(() => { const i = document.getElementById('diary-input'); i.value = '버스에서 쓰던 일기, 한 줄 더'; i.dispatchEvent(new Event('input', { bubbles: true })); saveDiaryDraft(); })()`);
    await p.reload();   // 앱이 완전히 닫혔다 다시 열림
    await p.eval(`openVault()`);
    p.ok((await p.eval(`__t.txt('#mood-list .mood-diary')`)).includes('한 줄 더'), '다시 열어도 보관함에 일기가 있음');
    // 저장 공간이 막혀 있으면 "저장됐다"고 하지 않는다
    await p.eval(`hideOverlay('overlay-vault'); localStorage.setItem = () => { throw new Error('QuotaExceededError'); }`);
    await p.eval(`sel = { emotion: '아픔', topic: '가족', need: '위로' }; document.getElementById('diary-input').value = '못 저장될 글'; autoSaveDiary()`);
    p.ok(/저장하지 못했/.test(await p.eval(`__t.txt('#toast')`)) && !/저장되었습니다/.test(await p.eval(`__t.txt('#toast')`)), '저장 실패 안내 — 실제: ' + await p.eval(`__t.txt('#toast')`));
});

scenario('오프라인에서 쓴 일기: 인터넷이 돌아오면 묻고, 허락하면 클라우드로 올림', { now: '2026-11-17T21:00:00+09:00', seed: { userName: '', dataOwner: 'u1',
    moodHistory: JSON.stringify([{ date: '2026-11-17', emotion: '걱정', topic: '일', need: '힘', emoji: '😔', diary: '지하철에서 쓴 일기' }]) } }, async p => {
    await p.goto();
    await p.eval(`sb = ${FAKE_SB}({
        mood_history: [{ id: 9, user_id: 'u1', date: '2026-11-17', emotion: '걱정', topic: '일', need: '힘', diary_text: null }],
        saved_verses: [], visit_dates: [], profiles: [], subscriptions: [] });
        sbUser = { id: 'u1', email: 'u1@example.com' }; updateAuthUI(); _syncedUser = null; _syncAsked = null; window.dispatchEvent(new Event('online'))`);
    await p.waitFor(`__t.vis('#sync-modal')`, '인터넷이 돌아오면 기기에만 있는 일기를 알려 줌');
    p.ok(/1/.test(await p.eval(`__t.txt('#sync-modal-desc')`)), '기기에만 있는 기록 1건');
    p.eq(await p.eval(`__srv.mood_history[0].diary_text`), null, '묻는 동안에는 서버를 바꾸지 않음');
    await p.eval(`__t.click('#sync-yes')`);
    await p.waitFor(`__srv.mood_history[0].diary_text === '지하철에서 쓴 일기'`, '허락하면 일기가 클라우드로 올라감');
    p.eq(await p.eval(`__srv.mood_history.length`), 1, '기록이 중복되지 않음');
});

scenario('동기화: 서로 다른 일기는 둘 다 살리고, 기기에서 지운 즐겨찾기는 되살아나지 않음', { now: '2026-11-17T21:00:00+09:00', seed: { userName: '', dataOwner: 'u1',
    moodHistory: JSON.stringify([{ date: '2026-11-17', emotion: '걱정', topic: '일', need: '힘', emoji: '😔', diary: '기기에서 쓴 글' }]),
    savedDeleted: JSON.stringify(['시편 23:1|여호와는 나의 목자시니']) } }, async p => {
    await p.goto();
    await p.eval(`sb = ${FAKE_SB}({
        mood_history: [{ id: 9, user_id: 'u1', date: '2026-11-17', emotion: '걱정', topic: '일', need: '힘', diary_text: '클라우드에서 쓴 글' }],
        saved_verses: [{ id: 1, user_id: 'u1', verse_text: '여호와는 나의 목자시니', verse_ref: '시편 23:1', emotion: '평안', need: '쉼' }], visit_dates: [], profiles: [], subscriptions: [] });
        sbUser = { id: 'u1', email: 'u1@example.com' }; updateAuthUI(); _syncedUser = null; _syncAsked = null; window.dispatchEvent(new Event('online'))`);
    await p.waitFor(`__t.vis('#sync-modal')`, '다른 점이 있으면 먼저 물음');
    await p.eval(`__t.click('#sync-yes')`);
    await p.waitFor(`__srv.saved_verses.length === 0`, '기기에서 지운 즐겨찾기는 클라우드에서도 지워짐');
    const d = await p.eval(`__srv.mood_history[0].diary_text`);
    p.ok(d.includes('기기에서 쓴 글') && d.includes('클라우드에서 쓴 글'), '서로 다른 일기는 둘 다 남음: ' + d);
    p.eq(await p.eval(`getSaved().length`), 0, '기기에도 되살아나지 않음');
    p.eq(await p.eval(`__t.ls('savedDeleted')`), [], '삭제 기록은 처리 후 비워짐');
});

scenario('서비스 운영 기준 화면, 즐겨찾기 삭제 기록(오프라인에서 지워도 되살아나지 않게)', { width: 390, height: 800, seed: { userName: '은혜', savedVerses: JSON.stringify([{ verse: '여호와는 나의 목자시니', ref: '시편 23:1', savedAt: '2026-11-01T00:00:00Z' }]) } }, async p => {
    await p.goto();
    await p.eval(`openPolicy('standards')`);
    p.ok((await p.eval(`__t.txt('#policy-body')`)).includes('개역한글'), '운영 기준에 말씀 출처(개역한글)가 적혀 있음');
    p.eq(await p.eval(`__t.txt('#policy-title')`), '서비스 운영 기준', '운영 기준 제목');
    p.ok(await p.eval(`!!document.getElementById('btn-policy-standards')`), '설정에 운영 기준 버튼이 있음');
    p.eq(await p.eval(`getSaved().length`), 1, '시작: 저장한 말씀 1개');
    await p.eval(`deleteSaved(0)`);
    p.eq(await p.eval(`__t.ls('savedDeleted')`), ['시편 23:1|여호와는 나의 목자시니'], '지운 즐겨찾기는 삭제 기록으로 남음 (다음 동기화에서 클라우드도 지움)');
    p.eq(await p.eval(`getSaved().length`), 0, '기기에서는 지워짐');
});

scenario('질문 단계: 뒤로 가기, 건너뛰고 말씀 보기(2번 만에), 작은 화면에서도 버튼이 보임', { width: 375, height: 667, seed: { userName: '은혜' } }, async p => {
    const ready = `typeof _picking === 'undefined' || !_picking`;
    await p.goto();
    // 뒤로 가기: 감정 → 주제 → (뒤로) → 감정 선택이 비워진 첫 화면
    await p.eval(`__t.click('.em-지침')`);
    await p.waitFor(`__t.vis('#step2') && (${ready})`, '주제 화면');
    const fit = async (id, what) => { await sleep(500); const b = await p.eval(`(() => { const r = document.querySelector('#${id} .step-skip').getBoundingClientRect(); return [Math.round(r.bottom), innerHeight]; })()`);
        p.ok(b[0] <= b[1] - 8, `${what}: 건너뛰기 버튼 아래끝 ${b[0]}px가 화면 높이 ${b[1]}px 안에 들어와야 함`); };
    await fit('step2', '주제 화면 375×667');
    await p.eval(`__t.click('.bc-일')`);
    await p.waitFor(`__t.vis('#step3') && (${ready})`, '필요 화면');
    await fit('step3', '필요 화면 375×667');
    await p.eval(`__t.click('#step3 .step-back')`);
    await p.waitFor(`__t.vis('#step2') && (${ready})`, '필요 → 뒤로 → 주제 화면');
    p.eq(await p.eval(`sel.topic`), null, '뒤로 가면 주제 선택이 비워짐');
    await p.eval(`__t.click('#step2 .step-back')`);
    await p.waitFor(`__t.vis('#step1') && (${ready})`, '주제 → 뒤로 → 감정 화면');
    p.eq(await p.eval(`sel.emotion`), null, '첫 화면으로 돌아가면 감정 선택도 비워짐');
    p.eq(await p.eval(`__t.ls('resumeSel')`), null, '첫 화면으로 돌아가면 이어하기 기록도 지움');
    // 감정만 누르고 건너뛰기 → 결과, 기록은 주제 '모름' + 감정별 기본 필요
    await p.eval(`__t.click('.em-아픔')`);
    await p.waitFor(`__t.vis('#step2') && (${ready})`, '주제 화면');
    await p.eval(`__t.click('#step2 .step-skip')`);
    await p.waitFor(`__t.vis('#step4') && !__t.vis('#step2')`, '주제 화면에서 건너뛰면 결과 화면');
    const h = await p.eval(`__t.ls('moodHistory')[0]`);
    p.eq([h.emotion, h.topic, h.need], ['아픔', '모름', '위로'], '건너뛴 기록: 주제 모름 · 아픔의 기본 필요(위로)');
    p.eq(h.skip, 1, '건너뛴 기록에는 skip 표시가 붙음 (통계에서 기본 필요를 뺌)');
    await p.waitFor(`__t.txt('#r-verse').length > 8 && !document.getElementById('r-verse').classList.contains('typing')`, '말씀 타이핑이 끝남', 12000);
    p.ok((await p.eval(`__t.txt('#r-reflection')`)).length > 5, '건너뛰어도 말씀·묵상이 나옴');
    // 주제는 고르고 필요에서 건너뛰기
    await p.eval(`restart()`);
    await p.waitFor(`__t.vis('#step1') && (${ready})`, '처음으로');
    await p.eval(`__t.click('.em-감사')`);
    await p.waitFor(`__t.vis('#step2') && (${ready})`, '주제 화면');
    await p.eval(`__t.click('.bc-가족')`);
    await p.waitFor(`__t.vis('#step3') && (${ready})`, '필요 화면');
    await p.eval(`__t.click('#step3 .step-skip')`);
    await p.waitFor(`__t.vis('#step4') && !__t.vis('#step3')`, '필요 화면에서 건너뛰면 결과 화면');
    const h2 = await p.eval(`__t.ls('moodHistory')[0]`);
    p.eq([h2.emotion, h2.topic, h2.need], ['감사', '가족', '쉼'], '고른 주제는 유지, 필요는 감사의 기본값(쉼)');
});

/* 글과 글, 글과 입력칸·버튼이 겹치는지 모든 화면에서 찾는다. 보이는 글(또는 입력칸·버튼)의 네모를 서로 비교해
   (조상-자손 관계, 장식 요소, 스크롤 영역 밖으로 잘린 것은 뺌) 겹친 쌍을 알려 준다 */
const FIND_OVERLAPS = `(() => {
    const decor = '#stars,.aurora,#sheep,.moon-wrap,.moon-orbital,#welcome-particles,#night-intro,.sheep-el,.card-blessing,[aria-hidden="true"]';
    const shown = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
    const tops = [...document.querySelectorAll('.overlay:not(.hidden), #premium-modal:not(.hidden), #consent-modal:not(.hidden), #sync-modal:not(.hidden), #devpw-modal:not(.hidden)')];
    const root = tops.sort((a, b) => (parseInt(getComputedStyle(a).zIndex) || 0) - (parseInt(getComputedStyle(b).zIndex) || 0)).pop() || document.querySelector('.page-wrap');
    const boxOf = el => {
        if (/^(INPUT|TEXTAREA|BUTTON|SELECT)$/.test(el.tagName)) return el.getBoundingClientRect();
        const rs = []; [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).forEach(n => { const g = document.createRange(); g.selectNodeContents(n); rs.push(...g.getClientRects()); });
        if (!rs.length) return null;
        return { left: Math.min(...rs.map(r => r.left)), right: Math.max(...rs.map(r => r.right)), top: Math.min(...rs.map(r => r.top)), bottom: Math.max(...rs.map(r => r.bottom)) };
    };
    const clipped = (el, b) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflow + getComputedStyle(a).overflowY; if (/hidden|auto|scroll/.test(o)) { const r = a.getBoundingClientRect(); const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2; if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return true; } } return false; };
    const items = [];
    root.querySelectorAll('*').forEach(el => {
        if (!shown(el) || el.closest(decor)) return;
        const ctl = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/.test(el.tagName);
        if (!ctl && ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
        const b = boxOf(el); if (!b || clipped(el, b)) return;
        items.push({ el, b });
    });
    const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/)[0] : '') + '「' + (el.textContent || el.placeholder || '').trim().slice(0, 12) + '」';
    const out = [];
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const A = items[i], B = items[j];
        if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
        const w = Math.min(A.b.right, B.b.right) - Math.max(A.b.left, B.b.left), h = Math.min(A.b.bottom, B.b.bottom) - Math.max(A.b.top, B.b.top);
        if (w > 3 && h > 3) out.push(name(A.el) + ' ↔ ' + name(B.el) + ' (' + Math.round(w) + '×' + Math.round(h) + 'px)');
    }
    return out;
})()`;
scenario('화면 겹침: 모든 화면에서 글·입력칸·버튼이 서로 겹치지 않음 (폰 4종 + 태블릿 + PC, 글자 크기 3단계)', { seed: { userName: '은혜' } }, async p => {
    const ready = `typeof _picking === 'undefined' || !_picking`;
    const sizes = [[360, 640, true, 0], [375, 667, true, 0], [390, 844, true, 0], [412, 915, true, 0], [768, 1024, false, 0], [1366, 768, false, 0], [1920, 1080, false, 0], [360, 740, true, 2], [390, 844, true, 1]];
    await p.goto();
    const past = await p.eval(`ymd(monthsAgo(1))`), d1 = await p.eval(`ymd(addDays(new Date(), -1))`), d2 = await p.eval(`ymd(addDays(new Date(), -2))`);
    await p.eval(`localStorage.setItem('moodHistory', JSON.stringify([
        { date: '${d1}', emotion: '걱정', topic: '일', need: '힘', emoji: '😔', diary: '어제 쓴 일기가 조금 길어서 두 줄이 되도록 이어서 쓰고 있어요', ref: '시편 56:3' },
        { date: '${d2}', emotion: '감사', topic: '가족', need: '쉼', emoji: '😊' },
        { date: '${past}', emotion: '평안', topic: '일', need: '쉼', emoji: '😌', diary: '한 달 전 일기' }]));
        localStorage.setItem('savedVerses', JSON.stringify([{ verse: '여호와는 나의 목자시니 내가 부족함이 없으리로다', ref: '시편 23:1', emotion: '평안', need: '쉼', savedAt: new Date().toISOString() }]))`);
    const seen = new Set();
    for (const [w, h, mobile, level] of sizes) {
        await p.S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
        await p.eval(`localStorage.setItem('fontLevel', '${level}')`);
        await p.reload();
        await sleep(900);
        const tag = `${w}×${h}${level ? ' 글자' + level : ''}`;
        const check = async what => {
            await sleep(450);
            const o = await p.eval(FIND_OVERLAPS);
            for (const line of o) { const k = what + '|' + line.replace(/\(\d+×\d+px\)/, ''); if (!seen.has(k)) { seen.add(k); p.fails.push(`겹침 [${tag}] ${what}: ${line}`); } }
        };
        await check('첫 화면');
        await p.eval(`showOverlay('overlay-name')`); await check('이름 입력(첫 방문)'); await p.eval(`hideOverlay('overlay-name')`);
        await p.eval(`__t.click('.em-걱정')`); await p.waitFor(`__t.vis('#step2') && (${ready})`, '주제'); await check('주제');
        await p.eval(`__t.click('.bc-일')`); await p.waitFor(`__t.vis('#step3') && (${ready})`, '필요'); await check('필요');
        await p.eval(`__t.click('.bc-위로')`); await p.waitFor(`__t.vis('#step4')`, '결과');
        await p.waitFor(`__t.txt('#r-verse').length > 8 && !document.getElementById('r-verse').classList.contains('typing')`, '말씀 타이핑', 12000);
        await sleep(900); await check('결과');
        await p.eval(`document.getElementById('diary-input').value = '오늘의 일기 한 줄'; __t.click('.btn-restart')`); await check('마무리');
        for (const [what, open, close] of [
            ['설정', `openSettings()`, `hideOverlay('overlay-settings')`], ['보관함', `openVault()`, `hideOverlay('overlay-vault')`],
            ['나의 이야기', `openDashboard()`, `hideOverlay('overlay-dashboard')`], ['프리미엄 안내', `openPremiumModal()`, `closePremiumModal()`],
            ['처리방침', `openPolicy('privacy')`, `hideOverlay('overlay-policy')`], ['로그인 동의', `openConsent()`, `closeConsent && closeConsent()`],
            ['기록 맞추기 확인', `askSync(2, 3)`, `closeSyncAsk()`]]) {
            await p.eval(open); await check(what); await p.eval(`try { ${close} } catch (e) {}`);
        }
        await p.eval(`restart()`); await sleep(500);
    }
    await p.eval(`localStorage.removeItem('fontLevel')`);
});

scenario('언어: 영어·일본어는 잠겨 있고(저장된 설정이 en이어도) 한국어로 켜지며, 데이터는 남아 있음', { seed: { userName: '은혜', appLang: 'en' } }, async p => {
    await p.goto();
    p.eq(await p.eval('appLang'), 'ko', '저장된 언어가 en이어도 잠겨 있으면 한국어');
    p.eq(await p.eval('document.documentElement.lang'), 'ko', '문서 언어');
    await p.eval(`setLang('en'); setLang('ja')`);
    p.eq(await p.eval('appLang'), 'ko', 'setLang은 잠긴 언어를 받지 않음');
    p.eq(await p.eval(`__t.ls('appLang')`), 'en', '저장된 설정은 지우지 않음 (다시 열면 되살아남)');
    p.ok(await p.eval(`getComputedStyle(document.getElementById('lbl-lang').closest('.settings-section')).display === 'none'`), '설정의 언어 줄이 보이지 않음');
    p.ok(await p.eval(`getComputedStyle(document.querySelector('.lang-select')).display === 'none'`), '첫 화면의 언어 버튼이 보이지 않음');
    p.ok(await p.eval(`Object.keys(VERSE_POOL_EN).length > 20 && !!LANG_DATA.en && !!LANG_DATA.ja`), '영어·일본어 데이터는 그대로 남아 있음');
    await p.eval(OPEN_LANGS);
    p.ok(await p.eval(`getComputedStyle(document.getElementById('lbl-lang').closest('.settings-section')).display !== 'none'`), '다시 열면 언어 줄이 나타남');
});

scenario('출퇴근길: 끊겼다 돌아오면 이어하기, 홈 화면 바로가기(?e=)로 감정 선택 건너뛰기, 운전 안내', { seed: { userName: '은혜' } }, async p => {
    const ready = `typeof _picking === 'undefined' || !_picking`;
    await p.goto();
    p.ok(/운전 중/.test(await p.eval(`__t.txt('#drive-note')`)), '운전 중 사용 안내 문구가 있음');
    p.ok(!(await p.eval(`__t.vis('#resume-bar')`)), '처음 열면 이어하기 바가 없음');
    // 감정·주제를 고른 뒤 앱이 닫혔다 다시 열림
    await p.eval(`__t.click('.em-걱정')`);
    await p.waitFor(`__t.vis('#step2') && (${ready})`, '주제 화면');
    await p.eval(`__t.click('.bc-일')`);
    await p.waitFor(`__t.vis('#step3') && (${ready})`, '필요 화면');
    p.eq(await p.eval(`__t.ls('resumeSel').emotion + '/' + __t.ls('resumeSel').topic`), '걱정/일', '선택이 적혀 있음');
    await p.reload();
    await p.waitFor(`__t.vis('#resume-bar')`, '다시 열면 이어하기 바', 4000);
    p.ok(await p.eval(`!!document.querySelector('#resume-text svg.ic')`), '이어하기 문구에 고르던 감정의 그림');
    await p.eval(`__t.click('#resume-go')`);
    await p.waitFor(`__t.vis('#step3') && (${ready})`, '이어하기 → 필요 화면으로 바로');
    p.eq(await p.eval(`sel.emotion + '/' + sel.topic`), '걱정/일', '감정·주제가 되살아남');
    await p.eval(`__t.click('.bc-위로')`);
    await p.waitFor(`__t.vis('#step4')`, '결과 화면');
    p.eq(await p.eval(`__t.ls('resumeSel')`), null, '결과까지 가면 이어하기 기록이 지워짐');
    // 오래된 기록·깨진 기록은 무시
    await p.eval(`localStorage.setItem('resumeSel', JSON.stringify({ emotion: '걱정', topic: null, date: todayStr(), t: Date.now() - 3 * 3600 * 1000 }))`);
    await p.reload(); await sleep(1600);
    p.ok(!(await p.eval(`__t.vis('#resume-bar')`)), '3시간 지난 기록은 묻지 않음');
    await p.eval(`localStorage.setItem('resumeSel', 'garbage{')`);
    await p.reload(); await sleep(1600);
    p.ok(!(await p.eval(`__t.vis('#resume-bar')`)) && await p.eval(`__t.vis('#step1')`), '깨진 기록이어도 첫 화면은 정상');
    // 홈 화면 바로가기
    const origin = await p.eval('location.origin');
    await p.goto(origin + '/?e=hurt');
    await p.waitFor(`__t.vis('#step2') && sel.emotion === '아픔'`, '?e=hurt → 아픔을 고른 상태로 주제 화면', 12000);
    p.ok(!(await p.eval(`location.search`)), '주소에서 ?e= 가 정리됨');
    await p.goto(origin + '/?e=nonsense');
    await sleep(1500);
    p.ok(await p.eval(`__t.vis('#step1')`), '모르는 값이면 무시하고 첫 화면');
    const man = await (await fetch(origin + '/manifest.json').catch(() => null))?.json?.();
    if (man) p.ok(Array.isArray(man.shortcuts) && man.shortcuts.length === 4 && man.shortcuts.every(s => /\?e=(worry|tired|hurt|pray)$/.test(s.url)), 'manifest 바로가기 4개');
});

scenario('감정 화면: 기도 버튼은 감정 칸과 분리되고 누르면 그대로 진행', { seed: { userName: '은혜' } }, async p => {
    await p.goto();
    p.eq(await p.eval(`document.querySelectorAll('.emotion-grid .btn-emotion').length`), 5, '감정 칸에는 감정 5개만');
    p.ok(await p.eval(`!document.querySelector('.emotion-grid .em-기도') && !!document.querySelector('.emotion-pray .em-기도')`), '기도 버튼은 감정 칸 밖(.emotion-pray)에 있어야 함');
    // 언어 적용은 .e-text 순서(6번째=기도)에 기대므로 순서가 깨지면 안 됨
    p.eq(await p.eval(`[...document.querySelectorAll('.e-text')].map(e=>e.textContent.trim()).pop()`), '기도하고 싶어요', '여섯 번째 문구가 기도');
    await p.eval(`document.querySelector('.emotion-pray').scrollIntoView({ block: 'end' })`);
    await sleep(700);
    await p.shot('emotion-grid');
    await p.eval(`__t.click('.em-기도')`);
    await p.waitFor(`__t.vis('#step2')`, '기도를 눌러도 주제 화면으로 넘어감');
    p.eq(await p.eval(`sel.emotion`), '기도', '선택값은 기존과 같은 "기도"');
});

/* 여러 기기에서 감정 버튼 전부(기도 버튼까지)가 스크롤 없이 한 화면에 들어오는지.
   가장 불리한 날(한 달 전 회고 카드가 뜨는 날)로 잰다. 모바일이 기준, PC·태블릿도 어색하지 않아야 함 */
scenario('감정 화면: 여러 기기에서 스크롤 없이 한 화면', { seed: { userName: '은혜' } }, async p => {
    const devices = [
        ['아이폰 SE', 375, 667, true], ['갤럭시 소형', 360, 740, true], ['아이폰 14', 390, 844, true],
        ['갤럭시 S25', 412, 915, true], ['태블릿 세로', 768, 1024, false], ['노트북', 1366, 768, false], ['데스크톱', 1920, 1080, false],
    ];
    await p.goto();
    const past = await p.eval(`ymd(monthsAgo(1))`);
    await p.eval(`localStorage.setItem('moodHistory', JSON.stringify([{ date: '${past}', emotion: '평안', topic: '일', need: '쉼', emoji: '😌', diary: '한 달 전 일기' }]))`);
    for (const [name, w, h, mobile] of devices) {
        await p.S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
        await p.reload();
        await p.waitFor(`__t.vis('#otd-card')`, name + ': 회고 카드가 떠 있는 상태', 4000);
        const m = await p.eval(`(() => {
            const r = s => document.querySelector(s).getBoundingClientRect();
            return { pray: Math.round(r('.emotion-pray .btn-emotion').bottom), vh: innerHeight,
                     over: document.documentElement.scrollWidth - innerWidth,
                     grid: Math.round(r('.emotion-grid').width), cardW: Math.round(r('#step1 .card').width) };
        })()`);
        p.ok(m.pray <= m.vh - 8, `${name} ${w}×${h}: 기도 버튼 아래끝 ${m.pray}px가 화면 높이 ${m.vh}px 안에 들어와야 함`);
        p.ok(m.over <= 0, `${name}: 가로로 넘치면 안 됨 (${m.over}px)`);
        if (w >= 768) p.ok(m.cardW <= 640, `${name}: 큰 화면에서 카드가 너무 퍼지면 안 됨 (${m.cardW}px)`);
        await p.shot('fit-' + w + 'x' + h);
    }
    // 글자 크기를 키운 사용자(설정의 가+, 가++)도 폰에서 한 화면에 들어와야 함
    const measure = `(() => { const r = s => document.querySelector(s).getBoundingClientRect();
        return { pray: Math.round(r('.emotion-pray .btn-emotion').bottom), vh: innerHeight, over: document.documentElement.scrollWidth - innerWidth }; })()`;
    for (const level of [1, 2]) {
        await p.eval(`localStorage.setItem('fontLevel', '${level}')`);
        for (const [name, w, h] of devices.filter(d => d[3])) {
            await p.S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: true });
            await p.reload();
            const m = await p.eval(measure);
            p.ok(m.pray <= m.vh - 8, `글자 크기 ${level} · ${name} ${w}×${h}: 기도 버튼 아래끝 ${m.pray}px가 화면 높이 ${m.vh}px 안에 들어와야 함`);
            p.ok(m.over <= 0, `글자 크기 ${level} · ${name}: 가로로 넘치면 안 됨 (${m.over}px)`);
            if (level === 2 && h === 667) await p.shot('fit-font2-' + w + 'x' + h);
        }
    }
    await p.eval(`localStorage.removeItem('fontLevel')`);
    // 이어하기 바가 떠 있어도 (끊겼다 돌아온 날) 한 화면
    await p.eval(`localStorage.setItem('resumeSel', JSON.stringify({ emotion: '걱정', topic: null, date: todayStr(), t: Date.now() }))`);
    for (const [name, w, h] of devices.filter(d => d[3])) {
        await p.S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: true });
        await p.reload();
        await p.waitFor(`__t.vis('#resume-bar')`, name + ': 이어하기 바', 4000);
        const m = await p.eval(measure);
        p.ok(m.pray <= m.vh - 8, `이어하기 바가 떠 있을 때 · ${name} ${w}×${h}: 기도 버튼 아래끝 ${m.pray}px가 화면 높이 ${m.vh}px 안에 들어와야 함`);
        if (h === 667) await p.shot('fit-resume-' + w + 'x' + h);
    }
    await p.eval(`localStorage.removeItem('resumeSel')`);
    // 가로로 눕힌 폰(차량 거치대): 겹치거나 옆으로 넘치지 않고, 스크롤로 모두 닿을 수 있어야 함
    for (const [w, h] of [[844, 390], [740, 360]]) {
        await p.S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: true });
        await p.reload();
        const m = await p.eval(measure);
        p.ok(m.over <= 0, `가로 모드 ${w}×${h}: 옆으로 넘치면 안 됨 (${m.over}px)`);
        await p.eval(`document.querySelector('.emotion-pray .btn-emotion').scrollIntoView({ block: 'end' })`);
        await sleep(700);   // 첫 화면 등장 연출(0.5초)이 끝난 뒤에 잰다
        p.ok(await p.eval(`document.querySelector('.emotion-pray .btn-emotion').getBoundingClientRect().bottom <= innerHeight + 2`), `가로 모드 ${w}×${h}: 스크롤하면 기도 버튼까지 닿아야 함`);
        await p.shot('fit-landscape-' + w + 'x' + h);
    }
});

scenario('핵심 플로우: 감정→주제→필요→결과→일기→마치기→보관함', { seed: { userName: '은혜' } }, async p => {
    await p.goto();
    await p.flow('걱정', '일', '위로');
    await p.waitFor(`__t.txt('#r-verse').length > 8 && !document.getElementById('r-verse').classList.contains('typing')`, '말씀 타이핑이 끝남', 12000);
    for (const id of ['r-ref', 'r-reflection', 'r-enc', 'r-context']) p.ok((await p.eval(`__t.txt('#${id}')`)).length > 3, `#${id} 내용이 있어야 함`);
    const today = await p.eval('todayStr()');
    const h = await p.eval(`__t.ls('moodHistory')[0]`);
    p.eq([h.date, h.emotion, h.topic, h.need], [today, '걱정', '일', '위로'], '감정 기록 저장');
    p.ok((await p.eval('closingCountdown')) >= 290 && (await p.eval('closingTimerId')) !== null, '마무리 타이머 5분 시작');
    await p.eval(`document.getElementById('diary-input').value = '오늘도 지켜주셔서 감사합니다'; __t.click('#btn-save')`);
    p.eq((await p.eval(`__t.ls('savedVerses')`)).length, 1, '즐겨찾기 저장');
    await p.eval(`__t.click('#btn-save')`);
    p.eq((await p.eval(`__t.ls('savedVerses')`)).length, 1, '즐겨찾기를 두 번 눌러도 한 번만 저장');
    await p.eval(`__t.click('.btn-restart')`);
    p.ok(await p.eval(`document.getElementById('step4').classList.contains('closing')`), '마치기 → 마무리 카드');
    p.eq(await p.eval(`__t.ls('moodHistory')[0].diary`), '오늘도 지켜주셔서 감사합니다', '마칠 때 일기 자동 저장');
    p.ok((await p.eval(`__t.txt('#blessing-streak')`)).includes('1'), '마무리 카드에 연속 일수');
    p.eq(await p.eval('closingTimerId'), null, '마무리 후 타이머 정지');
    await p.eval(`__t.click('#btn-vault-closing')`);
    p.ok(await p.eval(`__t.vis('#overlay-vault')`), '보관함 열림');
    p.eq(await p.eval(`document.querySelectorAll('#mood-list .mood-item').length`), 1, '보관함 감정 기록 1건');
    p.ok((await p.eval(`__t.txt('#mood-list .mood-diary')`)).includes('감사합니다'), '보관함에 일기 표시');
    await p.eval(`switchTab('saved')`);
    p.eq(await p.eval(`document.querySelectorAll('#saved-list .saved-verse-item').length`), 1, '보관함 즐겨찾기 1건');
    await p.eval(`__t.click('#saved-list .svi-del')`);
    p.eq(await p.eval(`document.querySelectorAll('#saved-list .saved-verse-item').length`), 0, '즐겨찾기 삭제');
    await p.eval(`hideOverlay('overlay-vault'); __t.click('.btn-restart')`);
    await p.waitFor(`__t.vis('#step1') && !__t.vis('#step4')`, '처음으로 돌아감');
    await p.flow('감사', '가족', '쉼');
    p.eq(await p.eval(`__t.ls('moodHistory').length`), 2, '두 번째 기록');
    p.ok(!(await p.eval(`document.getElementById('step4').classList.contains('closing')`)), '두 번째 결과 화면은 마무리 상태가 아니어야 함');
});

scenario('전 조합 192개 × 3개 언어: 빈 카드·undefined·언어 섞임 없음', { seed: { userName: '' } }, async p => {
    await p.goto();
    await p.eval(OPEN_LANGS);
    const bad = await p.eval(`(() => {
        const bad = [], E = ['감사','평안','걱정','지침','아픔','기도'], T = ['일','가족','공부','사람','건강','자녀','신앙','모름'], N = ['위로','힘','지혜','쉼'];
        const tw = typewriterVerse; window.typewriterVerse = t => { document.getElementById('r-verse').textContent = t; };
        for (const lang of ['ko','en','ja']) {
            setLang(lang);
            for (const e of E) for (const t of T) for (const n of N) for (let rep = 0; rep < 3; rep++) {
                sel = { emotion: e, topic: t, need: n };
                try { buildResult(); } catch (x) { bad.push(lang + ' ' + e + '/' + t + '/' + n + ' 예외: ' + x.message); continue; }
                const g = id => document.getElementById(id).textContent;
                for (const id of ['r-verse','r-ref','r-reflection','r-enc','r-context','blessing-sub'])
                    if (!g(id) || g(id).trim().length < 3 || /undefined|null|NaN/.test(g(id))) bad.push(lang + ' ' + e + '/' + t + '/' + n + ' #' + id + ' = ' + JSON.stringify(g(id)).slice(0, 40));
                if (lang === 'en') for (const id of ['r-verse','r-ref','r-reflection','r-enc'])
                    if (${HANGUL}.test(g(id))) bad.push('en ' + e + '/' + t + '/' + n + ' #' + id + ' 에 한글이 섞임: ' + g(id).slice(0, 30));
            }
            stopClosingTimer();
            openSettings(); openVault(); switchTab('saved'); switchTab('mood');
            const all = document.body.innerText;
            if (/undefined|\\bNaN\\b/.test(all)) bad.push(lang + ' 화면 어딘가에 undefined/NaN 이 보임: …' + all.slice(Math.max(0, all.search(/undefined|NaN/) - 30), all.search(/undefined|NaN/) + 20).replace(/\\n/g, ' '));
            hideOverlay('overlay-settings'); hideOverlay('overlay-vault');
        }
        window.typewriterVerse = tw; setLang('ko');
        return bad;
    })()`);
    for (const b of bad.slice(0, 12)) p.fails.push(b);
    if (bad.length > 12) p.fails.push(`… 외 ${bad.length - 12}건`);
});

scenario('날짜: 한국 새벽 0시 30분에도 오늘 날짜로 기록', {
    now: '2026-11-17T00:30:00+09:00',
    seed: { userName: '', devMode: '1', visitDates: JSON.stringify(['2026-11-15', '2026-11-16']),
        moodHistory: JSON.stringify([{ date: '2026-11-16', emotion: '걱정', topic: '일', need: '힘', emoji: '😔' }, { date: '2026-11-15', emotion: '지침', topic: '일', need: '쉼', emoji: '😞' }]) },
}, async p => {
    await p.goto();
    p.eq(await p.eval('todayStr()'), '2026-11-17', '오늘 날짜(화요일 0:30 KST)');
    p.eq(await p.eval('getWeekRange()'), { startStr: '2026-11-15', endStr: '2026-11-21' }, '이번 주 범위(일~토)');
    p.ok((await p.eval(`__t.ls('visitDates')`)).includes('2026-11-17'), '방문일에 11/17 기록');
    p.ok((await p.eval(`__t.txt('#cp-streak')`)).startsWith('3'), '연속 3일');
    await p.flow('아픔', '가족', '위로');
    p.eq(await p.eval(`__t.ls('moodHistory')[0].date`), '2026-11-17', '감정 기록 날짜');
    p.eq(await p.eval('calcEmotionRun()'), { cat: 'neg', n: 3 }, '무거운 마음 3일 연속 인식');
    p.ok(await p.eval(`__t.vis('#care-card')`), '3일 연속이면 돌봄 안내 카드가 보여야 함');
    p.ok(await p.eval(`__t.vis('#r-pattern')`), '연속 감정 문장이 보여야 함');
    await p.eval(`openVault()`);
    p.eq(await p.eval(`[...document.querySelectorAll('.wc-col')].map(c => c.querySelector('.wc-circle').classList.contains('has-data'))`),
        [false, false, false, false, true, true, true], '주간 차트: 최근 3일(15·16·17일)에 기록 표시');
    p.eq(await p.eval(`[...document.querySelectorAll('.wc-date-num')].map(e => e.textContent).join()`), '11,12,13,14,15,16,17', '주간 차트 날짜');
    p.eq(await p.eval(`[...document.querySelectorAll('.mood-date')].map(e => e.textContent.match(/\\d+일/)[0]).join()`), '17일,16일,15일', '보관함 기록 날짜');
    await p.eval(`hideOverlay('overlay-vault'); openDashboard()`);
    await p.waitFor(`__t.vis('#overlay-dashboard')`, '대시보드 열림');
    p.eq(await p.eval(`[...document.querySelectorAll('#db-day-flow .db-day-col')].map(c => !c.querySelector('.db-day-dot').classList.contains('empty'))`),
        [true, true, true, false, false, false, false], '대시보드 요일 흐름: 일·월·화에 기록');
    p.eq(await p.eval(`[...document.querySelectorAll('#db-day-flow .db-day-col')].findIndex(c => c.classList.contains('db-day-today'))`), 2, '대시보드 오늘 = 화요일 칸');
    await p.waitFor(`document.querySelectorAll('#hist-cal .hc-day.has').length === 3`, '달력: 이번 달 기록 3일(15·16·17일)');
    p.eq(await p.eval(`[...document.querySelectorAll('#hist-cal .hc-day.has .hc-num')].map(e => e.textContent).join()`), '15,16,17', '달력 날짜');
    p.ok(await p.eval(`document.querySelector('#hist-cal .hc-day.today .hc-num').textContent === '17'`), '달력의 오늘 = 17일');
});

scenario('자체 아이콘·QR·양 표정: 이모지 없이 그려지고, 칸을 넘치지 않고, 외부 서버를 부르지 않음', { seed: { userName: '은혜' } }, async p => {
    await p.goto();
    p.eq(await p.eval(`[...document.querySelectorAll('[data-ic]')].filter(e => !e.querySelector('svg.ic')).length`), 0, '모든 자리에 아이콘이 채워짐');
    p.ok(await p.eval(`document.querySelectorAll('[data-ic]').length >= 19`), '감정 6 + 주제 8 + 필요 4 + 기도 안내');
    p.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(await p.eval(`__t.txt('#step1 .emotion-grid') + __t.txt('.emotion-pray')`)), '감정 화면에 이모지가 없음');
    p.eq(await p.eval(`[...document.querySelectorAll('#step1 .btn-emotion')].filter(b => { const i = b.querySelector('svg').getBoundingClientRect(), r = b.getBoundingClientRect(); return i.width < 12 || i.right > r.right || i.left < r.left || i.bottom > r.bottom || i.top < r.top; }).length`), 0, '감정 아이콘이 칸 안에 들어옴');
    /* QR: 앱 안에서 그린 그림이어야 함 */
    await p.eval(`toggleQR()`);
    await p.waitFor(`document.getElementById('qr-img').src.startsWith('data:image/png')`, 'QR 그림 생성(외부 주소 아님)');
    p.eq(await p.eval(`qrMatrix(SHARE_URL).length`), 29, '주소 길이에 맞는 QR 크기(버전 3)');
    p.eq(await p.eval(`qrMatrix('a'.repeat(400))`), null, '너무 긴 글자는 만들지 않음');
    /* 양 표정 */
    await p.flow('걱정', '일', '위로');
    p.ok(await p.eval(`document.getElementById('sheep').classList.contains('face-걱정')`), '걱정을 고르면 양도 걱정하는 표정');
    p.ok(await p.eval(`!!document.querySelector('#r-context svg.ic')`), '결과 화면 배지에 아이콘');
    await p.eval(`restart()`);
    p.ok(await p.eval(`!document.getElementById('sheep').className.includes('face-')`), '다시 시작하면 기본 표정');
});

scenario('날짜: 미국 시간대에서도 하루가 밀리지 않음', {
    now: '2026-11-16T22:00:00-05:00', tz: 'America/New_York',
    seed: { userName: '', moodHistory: JSON.stringify([{ date: '2026-11-16', emotion: '감사', topic: '일', need: '힘', emoji: '😊' }]) },
}, async p => {
    await p.goto();
    await p.eval(OPEN_LANGS + `setLang('en')`);
    p.eq(await p.eval('todayStr()'), '2026-11-16', '오늘 날짜(뉴욕 밤 10시)');
    await p.eval('openVault()');
    p.ok((await p.eval(`__t.txt('.mood-date')`)).includes('16'), '보관함 기록 날짜가 16일로 보여야 함 — 실제: ' + await p.eval(`__t.txt('.mood-date')`));
    p.eq(await p.eval(`calcStreak(['2026-03-07','2026-03-08','2026-03-09'])`), 3, '서머타임이 바뀌는 주에도 연속 계산');
    p.eq(await p.eval(`calcStreak(['2026-11-10','2026-11-12','2026-11-13','2026-11-16','2026-11-15','2026-11-14'])`), 5, '연속 계산(정렬·끊김)');
    p.eq(await p.eval(`calcStreak([])`), 0, '방문 기록이 없으면 0');
    p.eq(await p.eval(`otdTargets().map(t => t.date)`), ['2025-11-16', '2026-05-16', '2026-08-16', '2026-10-16'], '회고 카드 대상 날짜');
});

scenario('날짜: 31일에는 "한 달 전"이 없는 날로 넘어가지 않음', { now: '2026-03-31T21:00:00+09:00', seed: { userName: '' } }, async p => {
    await p.goto();
    p.eq(await p.eval(`otdTargets().map(t => t.date)`), ['2025-03-31', '2025-09-30', '2025-12-31', '2026-02-28'], '회고 카드 대상 날짜(말일 보정)');
});

scenario('저장소가 깨져 있어도 앱이 켜지고 끝까지 진행됨', {
    intro: true,
    seed: { userName: '은혜', moodHistory: 'garbage{', savedVerses: '"text"', visitDates: '123', appLang: 'xx', fontLevel: 'abc',
        appTheme: 'nope', bgSong: '99', bgVol: 'loud', premiumActive: 'yes', consent: '[]', shownTeaser: '{}', '감사_위로': 'x', 'shownV_걱정_위로': '7', bgMusic: '0' },
}, async p => {
    await p.goto();
    await p.waitFor(`document.getElementById('night-intro').classList.contains('gone')`, '인트로가 사라짐(갇히지 않음)', 9000);
    p.ok(await p.eval(`__t.vis('#step1')`), '메인 화면 표시');
    p.ok((await p.eval(`__t.txt('.s1-title')`)).length > 2, '메인 제목 문구');
    await p.flow('걱정', '일', '위로');
    p.ok((await p.eval(`__t.txt('#r-reflection')`)).length > 3, '결과 묵상 표시');
    p.ok(Array.isArray(await p.eval(`__t.ls('moodHistory')`)), '깨진 기록이 배열로 복구됨');
    await p.eval(`__t.click('#btn-save'); openVault(); switchTab('saved'); switchTab('mood'); hideOverlay('overlay-vault'); openSettings(); exportData(); hideOverlay('overlay-settings')`);
    await p.eval(`__t.click('.btn-restart')`);
    p.ok(await p.eval(`document.getElementById('step4').classList.contains('closing')`), '마무리까지 도달');
});

scenario('연쇄 차단: 한 기능이 고장 나도 나머지는 동작', { seed: { userName: '' } }, async p => {
    await p.goto();
    await p.eval(`(() => {
        const boom = n => () => { throw new Error('test: ' + n + ' 고장'); };
        for (const n of ['checkSeason','updateStreak','initHeroTeaser','generateStars','renderOnThisDay']) window[n] = boom(n);
        if (!ENABLED_LANGS.includes('en')) ENABLED_LANGS.push('en');
        localStorage.setItem('appLang', 'en');
        init();
    })()`);
    p.eq(await p.eval('document.documentElement.lang'), 'en', '초기화 중 5곳이 고장 나도 언어 적용까지 진행');
    p.ok((await p.eval(`__t.txt('.s1-title')`)).length > 2 && !/[가-힣]/.test(await p.eval(`__t.txt('.s1-title')`)), '영어 문구로 바뀜');
    await p.eval(`(() => {
        const boom = n => () => { throw new Error('test: ' + n + ' 고장'); };
        for (const n of ['saveMood','renderEmotionPattern','renderCareCard','startClosingTimer','spawnBlessing','applyEmoTint','spawnEmoEffect','addRipple','playSfx','typewriterVerse']) window[n] = boom(n);
    })()`);
    await p.flow('지침', '공부', '쉼');
    p.ok((await p.eval(`__t.txt('#r-reflection')`)).length > 3, '기록·연출 10곳이 고장 나도 결과 화면의 묵상은 보임');
    p.ok((await p.eval(`__t.txt('#r-ref')`)).length > 3, '말씀 출처 보임');
    await p.eval(`window.autoSaveDiary = () => { throw new Error('test: autoSaveDiary 고장'); }; window.spawnShootingStar = window.autoSaveDiary; __t.click('.btn-restart')`);
    p.ok(await p.eval(`document.getElementById('step4').classList.contains('closing')`), '일기 저장이 고장 나도 마무리는 됨');
    await p.eval(`window.setWelcome = () => { throw new Error('test: setWelcome 고장'); }; __t.click('.btn-restart')`);
    await p.waitFor(`__t.vis('#step1')`, '환영 문구가 고장 나도 처음 화면으로 돌아감');
    const log = await p.eval(`typeof errLog === 'function' ? errLog().length : -1`);
    p.ok(log >= 10, `고장 난 곳이 오류 기록에 남아야 함 (기록 ${log}건)`);
    p.errors = p.errors.filter(e => !e.includes('test: '));
});

scenario('마무리 타이머: 활동하면 연장, 0초가 되면 자동 마무리', { seed: { userName: '' } }, async p => {
    await p.goto();
    await p.flow('평안', '모름', '쉼');
    await p.eval(`closingCountdown = 100; document.body.dispatchEvent(new Event('click', { bubbles: true }))`);
    p.eq(await p.eval('closingCountdown'), 300, '화면을 누르면 5분으로 돌아감');
    await p.eval(`document.getElementById('diary-input').value = '자동 저장 확인'; closingCountdown = 1`);
    await p.waitFor(`document.getElementById('step4').classList.contains('closing')`, '시간이 다 되면 자동 마무리', 4000);
    p.eq(await p.eval(`__t.ls('moodHistory')[0].diary`), '자동 저장 확인', '자동 마무리 때도 일기 저장');
});

scenario('개발자 모드·대시보드·프리미엄 체험·회고 카드·PDF', { now: '2026-11-17T21:30:00+09:00', seed: { userName: '', devMode: '1' } }, async p => {
    await p.goto();
    p.ok(await p.eval(`__t.vis('#btn-dashboard-top')`), '나의 이야기 버튼 표시');
    await p.eval(`injectDemoData(); renderOnThisDay()`);
    await p.waitFor(`__t.vis('#otd-card')`, '회고 카드 표시');
    p.ok((await p.eval(`__t.txt('#otd-card')`)).includes('1년 전') && await p.eval(`!!document.querySelector('#otd-card .otd-btn')`), '무료: 1년 전 기록은 잠금 안내');
    await p.eval(`openDashboard()`);
    await p.waitFor(`__t.vis('#overlay-dashboard')`, '대시보드 열림');
    p.eq(await p.eval(`document.querySelectorAll('#db-day-flow .db-day-dot:not(.empty)').length`), 7, '데모 데이터 7일이 이번 주(일~토)에 모두 표시');
    p.ok(await p.eval(`__t.vis('.persona-demo')`), '개발자 모드: 체험 데이터 선택이 보임');
    await p.waitFor(`!!document.querySelector('#hist-monthly .locked')`, '무료: 월간 리포트 잠금');
    for (const who of ['male', 'female', 'housewife', 'pastor', 'foreigner']) {
        await p.eval(`loadPersona('${who}', null)`);
        p.ok((await p.eval(`__t.txt('#db-narrative')`)).length > 5, `페르소나 ${who} 서사 카드`);
        p.eq(await p.eval(`document.querySelectorAll('#db-day-flow .db-day-dot:not(.empty)').length`), 7, `페르소나 ${who} 요일 흐름 7일`);
    }
    await p.eval(`__t.click('#db-detail-btn')`);
    p.ok(await p.eval(`__t.vis('#db-detail')`), '상세히 보기 펼침');
    p.ok(await p.eval(`document.querySelectorAll('#db-diaries .db-diary-item').length > 0`), '페르소나 일기 표시');
    // 프리미엄 체험: 틀린 비밀번호 → 그대로, 맞는 비밀번호 → 열림
    await p.eval(`openDevPwModal('premium'); document.getElementById('devpw-input').value = '0000'; checkDevPw()`);
    p.ok(!(await p.eval('isPremium()')), '틀린 비밀번호로는 열리지 않음');
    await p.eval(`document.getElementById('devpw-input').value = '7501'; checkDevPw()`);
    p.ok(await p.eval('isPremium()'), '시연 비밀번호로 프리미엄 체험 ON');
    await p.waitFor(`!!document.querySelector('#hist-monthly .db-pdf-btn')`, '프리미엄: PDF 버튼');
    p.ok((await p.eval(`__t.txt('#hist-monthly')`)).includes('7일'), '월간 리포트: 이번 달 7일 — 실제: ' + (await p.eval(`__t.txt('#hist-monthly')`)).slice(0, 60));
    p.ok(await p.eval(`__t.vis('#hist-year-sec')`) && (await p.eval(`__t.txt('#hist-yearly')`)).includes('2026'), '프리미엄: 연간 리포트 표시');
    await p.eval(`window.print = () => { window.__printed = true; }; exportDiaryPdf()`);
    p.ok(await p.eval(`window.__printed === true && document.querySelectorAll('#print-diary .pd-entry').length === 7`), 'PDF 일기장 7건 인쇄 호출');
    await p.waitFor(`__t.vis('#otd-card') && !document.querySelector('#otd-card .otd-btn')`, '프리미엄: 1년 전 기록이 열려 보임');
    p.ok((await p.eval(`__t.txt('#otd-card .otd-diary')`)).includes('맡겨드리고'), '회고 카드에 그날 일기');
    await p.eval(`hideOverlay('overlay-dashboard'); openSettings(); setTheme('ocean')`);
    p.ok(await p.eval(`document.body.classList.contains('theme-ocean')`), '프리미엄: 바다 테마 적용');
    await p.eval(`devPremiumTap(new Event('click'))`);
    p.ok(!(await p.eval('isPremium()')), '체험 OFF');
    p.ok(!(await p.eval(`document.body.classList.contains('theme-ocean')`)), '체험을 끄면 프리미엄 테마도 기본으로');
    await p.eval(`setTheme('dawn')`);
    p.ok(await p.eval(`__t.vis('#premium-modal') && !document.body.classList.contains('theme-dawn')`), '무료: 프리미엄 테마를 누르면 안내 모달');
    p.ok((await p.eval(`__t.txt('#pm-feats')`)).length > 20 && !(await p.eval(`__t.txt('#premium-modal')`)).includes('undefined'), '프리미엄 안내 문구');
    await p.eval(`premiumInterest()`);
    p.eq(await p.eval(`__t.ls('premiumInterest')`), true, '출시 알림 신청 기록');
    await p.reload();
    p.ok(!(await p.eval(`document.body.classList.contains('theme-ocean')`)), '새로고침 후에도 무료 사용자는 기본 테마');
});

scenario('로그인 전 동의·처리방침·Esc 닫기 (Supabase 불통이어도 오류 없음)', { seed: { userName: '' } }, async p => {
    await p.goto();
    await p.eval(`openSettings(); loginWithGoogle()`);
    if (await p.eval(`typeof supabase !== 'undefined'`)) {
        p.ok(await p.eval(`__t.vis('#consent-modal')`), '로그인 전에 동의 창이 먼저');
        p.ok(await p.eval(`document.getElementById('consent-agree').disabled`), '세 항목을 모두 체크하기 전에는 동의 버튼 비활성');
        await p.eval(`['consent-c1','consent-c2','consent-c3'].forEach(id => document.getElementById(id).click())`);
        p.ok(!(await p.eval(`document.getElementById('consent-agree').disabled`)), '모두 체크하면 활성');
        await p.eval(`__t.click('#consent-view')`);
        p.ok((await p.eval(`__t.txt('#policy-body')`)).length > 300, '처리방침 본문');
        await p.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
        p.ok(await p.eval(`__t.vis('#consent-modal') && !__t.vis('#overlay-policy')`), 'Esc는 맨 위 창(처리방침) 하나만 닫음');
        await p.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
        p.ok(await p.eval(`!__t.vis('#consent-modal') && __t.vis('#overlay-settings')`), 'Esc 한 번 더 → 동의 창이 닫히고 설정은 남음');
    } else p.netFails.push('supabase-js CDN을 불러오지 못해 동의 창 확인을 건너뜀');
    await p.eval(`openPolicy('terms')`);
    p.ok((await p.eval(`__t.txt('#policy-body')`)).length > 200, '이용약관 본문');
    p.ok(!(await p.eval(`__t.vis('#row-delete')`)), '로그인 전에는 계정 삭제 줄이 보이지 않음');
});

/* 실제 Supabase 대신 메모리 안의 가짜 서버로, 기기↔클라우드 기록 맞추기 규칙을 확인 */
const FAKE_SB = `(tables => {
    const from = t => {
        const st = { f: [], op: 'select', one: false, payload: null };
        const rows = () => (tables[t] ||= []);
        const api = {
            select() { return api; }, order() { return api; }, limit() { return api; },
            eq(c, v) { st.f.push(r => r[c] === v); return api; }, gte(c, v) { st.f.push(r => r[c] >= v); return api; },
            lte(c, v) { st.f.push(r => r[c] <= v); return api; }, in(c, vs) { st.f.push(r => vs.includes(r[c])); return api; },
            single() { st.one = true; return api; }, maybeSingle() { st.one = true; return api; },
            insert(p) { st.op = 'insert'; st.payload = [].concat(p); return api; },
            upsert(p) { st.op = 'upsert'; st.payload = [].concat(p); return api; },
            update(p) { st.op = 'update'; st.payload = p; return api; }, delete() { st.op = 'delete'; return api; },
            then(res, rej) {
                let data = null; const hit = r => st.f.every(f => f(r));
                if (st.op === 'select') { data = rows().filter(hit); if (st.one) data = data[0] || null; }
                else if (st.op === 'insert' || st.op === 'upsert') {
                    const added = st.payload.map(r => ({ id: ++tables.__id, ...r }));
                    added.forEach(r => {
                        const dup = st.op === 'upsert' && rows().find(x => (t === 'profiles' ? x.id === r.id : x.user_id === r.user_id && x.visit_date === r.visit_date));
                        if (dup) Object.assign(dup, r, { id: dup.id }); else rows().push(r);
                    });
                    data = st.one ? added[0] : null;
                }
                else if (st.op === 'update') rows().filter(hit).forEach(r => Object.assign(r, st.payload));
                else if (st.op === 'delete') tables[t] = rows().filter(r => !hit(r));
                return Promise.resolve({ data, error: null }).then(res, rej);
            },
        };
        return api;
    };
    tables.__id = 100;
    window.__srv = tables;
    return { from, rpc: async () => ({ error: null }), auth: { signOut: async () => ({}) } };
})`;
scenario('클라우드 기록 맞추기(가짜 서버): 올리기·내려받기·중복 없음·계정 바뀜·구독 판정', {
    now: '2026-11-17T21:00:00+09:00',
    seed: { userName: '', visitDates: JSON.stringify(['2026-11-16']),
        moodHistory: JSON.stringify([
            { date: '2026-11-16', emotion: '감사', topic: '가족', need: '쉼', emoji: '😊', diary: '기기에서 쓴 일기' },
            { date: '2026-11-15', emotion: '걱정', topic: '일', need: '힘', emoji: '😔' }]),
        savedVerses: JSON.stringify([{ date: '11월 16일', context: '😊 감사했어요 · 🌙 그냥 쉬고 싶어요', verse: '기기 말씀', ref: '시편 23:1' }]) },
}, async p => {
    await p.goto();
    await p.eval(`sb = ${FAKE_SB}({
        mood_history: [
            { id: 1, user_id: 'u1', date: '2026-11-15', emotion: '걱정', topic: '일', need: '힘', diary_text: '다른 기기에서 쓴 일기' },
            { id: 2, user_id: 'u1', date: '2026-11-10', emotion: '평안', topic: '모름', need: '쉼', diary_text: null },
            { id: 3, user_id: 'u1', date: '2025-11-17', emotion: '지침', topic: '일', need: '쉼', diary_text: '1년 전' },
            { id: 4, user_id: 'u2', date: '2026-11-12', emotion: '기도', topic: '사람', need: '지혜', diary_text: '다른 사람의 기록' }],
        saved_verses: [{ id: 5, user_id: 'u1', verse_text: '서버 말씀', verse_ref: '요한복음 14:27', emotion: '평안', need: '쉼', saved_at: '2026-11-10T12:00:00Z' }],
        visit_dates: [{ id: 6, user_id: 'u1', visit_date: '2026-11-15' }, { id: 7, user_id: 'u1', visit_date: '2026-11-14' }],
        profiles: [{ id: 'u1', name: '은혜' }],
        subscriptions: [],
    }); sbUser = { id: 'u1', email: 'u1@example.com' }; updateAuthUI(); syncWithServer()`);
    // 기기와 클라우드가 다르면 말없이 합치지 않고 먼저 묻는다
    await p.waitFor(`__t.vis('#sync-modal')`, '기록이 다르면 맞출지 묻는 창');
    p.ok(/2.*2/.test(await p.eval(`__t.txt('#sync-modal-desc')`)), '묻는 창에 기기에만 2건·클라우드에만 2건 — 실제: ' + await p.eval(`__t.txt('#sync-modal-desc')`));
    await p.eval(`__t.click('#sync-no')`);
    await sleep(200);
    p.ok(!(await p.eval(`__t.vis('#sync-modal')`)) && (await p.eval(`__t.ls('dataOwner')`)) == null, '"나중에"를 누르면 아무것도 바꾸지 않음');
    p.eq(await p.eval(`__srv.mood_history.filter(r => r.user_id === 'u1').length`), 3, '"나중에" → 서버도 그대로');
    await p.eval(`syncWithServer()`); await sleep(150);
    p.ok(!(await p.eval(`__t.vis('#sync-modal')`)), '"나중에" 뒤에는 이번 접속에서 다시 묻지 않음');
    await p.eval(`syncNow()`);
    await p.waitFor(`__t.vis('#sync-modal')`, '설정의 "지금 맞추기"로 다시 확인');
    await p.eval(`__t.click('#sync-yes')`);
    await p.waitFor(`__t.ls('dataOwner') === 'u1'`, '기록 맞추기 완료');
    const moods = await p.eval(`__t.ls('moodHistory')`);
    p.eq(moods.map(m => m.date), ['2026-11-16', '2026-11-15', '2026-11-10'], '기기 기록 = 기기 2건 + 서버에만 있던 1건 (62일 지난 것은 내려받지 않음)');
    p.eq(moods[1].diary, '다른 기기에서 쓴 일기', '같은 기록은 한 건으로 보고 일기가 있는 쪽을 살림');
    const srvMoods = await p.eval(`__srv.mood_history.filter(r => r.user_id === 'u1').map(r => r.date + r.emotion).sort()`);
    p.eq(srvMoods, ['2025-11-17지침', '2026-11-10평안', '2026-11-15걱정', '2026-11-16감사'], '서버 기록 = 원래 3건 + 기기에만 있던 1건 (중복 없이)');
    p.eq(await p.eval(`__srv.mood_history.find(r => r.date === '2026-11-16').diary_text`), '기기에서 쓴 일기', '올릴 때 일기도 함께');
    p.eq((await p.eval(`__t.ls('savedVerses')`)).map(v => v.ref), ['시편 23:1', '요한복음 14:27'], '즐겨찾기 합쳐짐');
    p.eq(await p.eval(`__srv.saved_verses.filter(r => r.user_id === 'u1').length`), 2, '기기의 즐겨찾기가 서버로 올라감');
    p.eq(await p.eval(`__t.ls('visitDates')`), ['2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17'], '방문일 합쳐짐');
    p.ok((await p.eval(`__t.txt('#cp-streak')`)).startsWith('4'), '합친 뒤 연속 4일로 표시');
    p.eq(await p.eval(`__t.ls('userName')`), '은혜', '호칭이 비어 있으면 클라우드 것을 가져옴');
    await p.waitFor(`__t.vis('#otd-card')`, '서버에 있는 1년 전 기록으로 회고 카드 표시');
    p.ok(await p.eval(`__t.vis('#row-delete') && __t.txt('#auth-email') === 'u1@example.com'`), '로그인 상태 표시(이메일·계정 삭제 줄)');
    // 한 번 더 맞춰도 늘어나지 않음
    await p.eval(`_syncedUser = null; syncWithServer()`);
    await sleep(300);
    p.eq(await p.eval(`[__t.ls('moodHistory').length, __srv.mood_history.length, __srv.saved_verses.length]`), [3, 5, 2], '다시 맞춰도 중복이 생기지 않음');
    // 보관함: 예전 방식 즐겨찾기와 새 방식이 함께 보이고, 지우면 서버에서도 지워짐
    await p.eval(`openVault(); switchTab('saved')`);
    p.eq(await p.eval(`[...document.querySelectorAll('.svi-context')].map(e => e.textContent)`), ['😊 감사했어요 · 🌙 그냥 쉬고 싶어요', '평안했어요 · 그냥 쉬고 싶어요'], '즐겨찾기 표시(예전 방식·서버에서 온 것)');
    await p.eval(`document.querySelectorAll('#saved-list .svi-del')[1].click()`);
    await sleep(100);
    p.eq(await p.eval(`__srv.saved_verses.map(r => r.verse_ref)`), ['시편 23:1'], '즐겨찾기를 지우면 서버에서도 지워짐');
    await p.eval(`hideOverlay('overlay-vault')`);
    // 새 기록: 서버에 한 줄, 일기는 그 줄에만
    await p.flow('감사', '가족', '쉼');
    await sleep(100);
    await p.eval(`document.getElementById('diary-input').value = '오늘 일기'; __t.click('.btn-restart')`);
    await sleep(100);
    p.eq(await p.eval(`__srv.mood_history.filter(r => r.date === '2026-11-17').map(r => r.diary_text)`), ['오늘 일기'], '오늘 기록 한 줄 + 일기');
    p.eq(await p.eval(`__srv.mood_history.find(r => r.date === '2026-11-16').diary_text`), '기기에서 쓴 일기', '다른 날의 일기는 건드리지 않음');
    // 구독 판정
    const sub = async (row) => { await p.eval(`__srv.subscriptions = ${JSON.stringify(row ? [{ user_id: 'u1', ...row }] : [])}; refreshEntitlement()`); await sleep(120); return p.eval('isPremium()'); };
    p.eq(await sub(null), false, '구독 없음 → 무료');
    p.eq(await sub({ status: 'active', current_period_end: '2026-12-17T00:00:00Z' }), true, '이용 중 → 프리미엄');
    p.eq(await sub({ status: 'active', current_period_end: '2026-11-01T00:00:00Z' }), false, '기간이 지남 → 무료');
    p.eq(await sub({ status: 'canceled', current_period_end: '2026-12-01T00:00:00Z' }), true, '해지했지만 기간이 남음 → 그때까지 프리미엄');
    p.eq(await sub({ status: 'canceled', current_period_end: '2026-11-01T00:00:00Z' }), false, '해지 + 기간 끝 → 무료');
    p.eq(await sub({ status: 'past_due', current_period_end: '2026-12-01T00:00:00Z' }), false, '결제 실패 상태 → 무료');
    p.eq(await sub({ status: 'active', current_period_end: null }), true, '기간 없는 이용권 → 프리미엄');
    await p.eval(`setTheme('forest')`);
    p.ok(await p.eval(`document.body.classList.contains('theme-forest')`), '프리미엄: 숲속 테마');
    p.eq(await sub({ status: 'inactive' }), false, '구독이 끝남');
    p.ok(!(await p.eval(`document.body.classList.contains('theme-forest')`)), '구독이 끝나면 프리미엄 테마가 기본으로 돌아감');
    p.eq(await sub({ status: 'active', current_period_end: null }), true, '다시 구독');
    p.ok(await p.eval(`document.body.classList.contains('theme-forest')`), '다시 구독하면 쓰던 테마로 돌아옴');
    // 같은 기기에 다른 계정이 로그인: 앞사람 기록을 올리지 않고, 그 계정의 기록으로 바뀜
    await p.eval(`sbLogout()`); await sleep(100);
    p.ok(!(await p.eval('isPremium()')), '로그아웃하면 프리미엄 해제');
    await p.eval(`sbUser = { id: 'u2', email: 'u2@example.com' }; updateAuthUI(); syncWithServer()`);
    await p.waitFor(`__t.ls('dataOwner') === 'u2'`, '두 번째 계정 맞추기 완료');
    p.eq((await p.eval(`__t.ls('moodHistory')`)).map(m => m.diary), ['다른 사람의 기록'], '기기 기록이 두 번째 계정의 것으로 바뀜');
    p.eq(await p.eval(`__srv.mood_history.filter(r => r.user_id === 'u2').length`), 1, '앞사람의 기록이 두 번째 계정으로 올라가지 않음');
    p.eq(await p.eval(`__t.ls('savedVerses')`), [], '즐겨찾기도 두 번째 계정 기준(없음)');
    // 데이터 초기화·계정 삭제
    await p.eval(`clearData()`); await sleep(200);
    p.eq(await p.eval(`[__srv.mood_history.filter(r => r.user_id === 'u2').length, __t.ls('moodHistory')]`), [0, null], '초기화: 서버와 기기 모두 지워짐');
    p.eq(await p.eval(`__srv.mood_history.filter(r => r.user_id === 'u1').length`), 5, '초기화가 다른 계정의 기록은 건드리지 않음');
    await p.eval(`deleteAccount()`); await sleep(200);
    p.ok(await p.eval(`sbUser === null && __t.vis('#row-login') && !__t.vis('#row-delete')`), '계정 삭제 후 로그아웃 상태');
});

scenario('나의 이야기(무료·게스트): 달력은 지난달까지, 그날 본 말씀, 리포트 잠금, 3개 언어', {
    now: '2026-11-17T21:00:00+09:00',
    seed: { userName: '', moodHistory: JSON.stringify([
        { date: '2026-11-03', emotion: '걱정', topic: '일', need: '힘', emoji: '😔', diary: '<b>굵게</b> 쓴 일기' },
        { date: '2026-11-03', emotion: '감사', topic: '가족', need: '쉼', emoji: '😊' },
        { date: '2026-10-20', emotion: '평안', topic: '모름', need: '쉼', emoji: '😌' },
        { date: '2026-09-20', emotion: '지침', topic: '일', need: '쉼', emoji: '😞' }]) },
}, async p => {
    await p.goto();
    await p.flow('감사', '가족', '쉼');
    const shown = await p.eval('({ v: curVerse.v, r: curVerse.r })');
    p.eq(await p.eval(`__t.ls('moodHistory')[0].ref`), shown.r, '기록에 그날 본 말씀의 출처가 남음');
    await p.eval(`stopClosingTimer(); openDashboard()`);
    p.ok(await p.eval(`__t.vis('#overlay-dashboard') && !__t.vis('.persona-demo')`), '게스트도 열리고, 체험 데이터 선택은 보이지 않음');
    await p.waitFor(`document.querySelectorAll('#hist-cal .hc-day.has').length === 2`, '달력: 11월에 기록 있는 날 2일(3일·17일)');
    p.eq(await p.eval(`__t.txt('#hist-cal .hc-title')`), '2026년 11월', '달력 제목');
    p.ok(await p.eval(`document.querySelector('#hist-cal .hc-arrow:last-child').disabled`), '이번 달에서는 다음 달 버튼이 꺼져 있음');
    await p.eval(`histPick('2026-11-17')`);
    p.ok((await p.eval(`__t.txt('#hist-cal .hc-entry-verse')`)).includes(shown.v.slice(0, 12)), '날짜를 누르면 그날 본 말씀이 보임');
    await p.eval(`histPick('2026-11-03')`);
    p.eq(await p.eval(`document.querySelectorAll('#hist-cal .hc-entry').length`), 2, '하루에 두 번 기록한 날은 두 건 모두');
    await p.eval(`document.getElementById('hist-cal-sec').scrollIntoView()`); await p.shot('free-calendar');
    p.ok(await p.eval(`!document.querySelector('#hist-cal .hc-entry-diary b') && __t.txt('#hist-cal .hc-entry-diary').includes('<b>')`), '일기의 특수문자는 글자 그대로');
    p.ok(!(await p.eval(`!!document.querySelector('#hist-cal .hc-entry-verse')`)), '출처가 없는 예전 기록에는 말씀을 지어내지 않음');
    p.ok((await p.eval(`__t.txt('#hist-note')`)).includes('두 달'), '게스트 안내 문구');
    p.ok(await p.eval(`!!document.querySelector('#hist-monthly .locked') && !__t.vis('#hist-year-sec')`), '무료: 월간 잠금, 연간 숨김');
    await p.eval(`window.print = () => { window.__printed = true; }; exportDiaryPdf()`);
    p.ok(await p.eval(`window.__printed !== true && __t.vis('#premium-modal')`), '무료: PDF는 인쇄되지 않고 안내 모달');
    await p.eval(`closePremiumModal(); histMove(-1)`);
    await p.waitFor(`__t.txt('#hist-cal .hc-title') === '2026년 10월'`, '지난달로 이동');
    p.eq(await p.eval(`document.querySelectorAll('#hist-cal .hc-day.has').length`), 1, '10월 기록 1일');
    await p.eval(`histMove(-1)`);
    p.ok(await p.eval(`__t.vis('#premium-modal') && __t.txt('#hist-cal .hc-title') === '2026년 10월'`), '무료: 지난달보다 이전은 안내 모달, 달력은 그대로');
    p.eq(await p.eval(`document.querySelectorAll('#pm-feats li').length`), 5, '프리미엄 안내: 구현된 5가지만');
    p.ok(!/챌린지|꾸미기/.test(await p.eval(`__t.txt('#premium-modal')`)), '안내 문구에 미구현 기능이 없음');
    await p.eval(`closePremiumModal()`);
    await p.eval(OPEN_LANGS);
    for (const lang of ['en', 'ja']) {
        await p.eval(`setLang('${lang}'); openDashboard()`);
        await p.waitFor(`document.querySelectorAll('#hist-cal .hc-day').length > 27`, lang + ' 달력');
        const txt = await p.eval(`document.getElementById('overlay-dashboard').innerText`);
        p.ok(!/undefined|NaN|\{\w+\}/.test(txt), lang + ': 나의 이야기에 undefined·빈 자리 없음');
        if (lang === 'en') p.ok(!/[가-힣]/.test(txt),'en: 나의 이야기에 한글이 남지 않음 — ' + (txt.match(/[^\n]*[가-힣][^\n]*/) || [''])[0].slice(0, 40));
    }
});

scenario('프리미엄(가짜 서버): 지난 해 기록 달력·월간·연간·PDF, 구독이 끝나면 닫힘, verse_ref 열 없는 서버', {
    now: '2026-11-17T21:00:00+09:00', seed: { userName: '' },
}, async p => {
    await p.goto();
    const ref = await p.eval(`VERSE_POOL['평안_쉼'][0].r`);
    await p.eval(`sb = ${FAKE_SB}({
        mood_history: [
            { id: 1, user_id: 'u1', date: '2026-11-10', emotion: '평안', topic: '모름', need: '쉼', diary_text: null, verse_ref: ${JSON.stringify(ref)} },
            { id: 2, user_id: 'u1', date: '2026-03-05', emotion: '걱정', topic: '일', need: '힘', diary_text: '봄에 쓴 일기' },
            { id: 3, user_id: 'u1', date: '2026-03-06', emotion: '걱정', topic: '일', need: '힘', diary_text: null },
            { id: 4, user_id: 'u1', date: '2025-12-25', emotion: '감사', topic: '가족', need: '위로', diary_text: '성탄의 일기' },
            { id: 5, user_id: 'u2', date: '2026-03-05', emotion: '아픔', topic: '사람', need: '위로', diary_text: '다른 사람의 기록' }],
        saved_verses: [], visit_dates: [], profiles: [],
        subscriptions: [{ user_id: 'u1', status: 'active', current_period_end: '2026-12-17T00:00:00Z' }],
    }); sbUser = { id: 'u1', email: 'u1@example.com' }; updateAuthUI(); syncWithServer()`);
    await p.waitFor(`__t.vis('#sync-modal')`, '클라우드에만 있는 기록이 있어 맞출지 묻는 창');
    await p.eval(`__t.click('#sync-yes')`);
    await p.waitFor(`__t.ls('dataOwner') === 'u1' && isPremium()`, '로그인 + 구독 확인');
    p.eq((await p.eval(`__t.ls('moodHistory')`)).map(m => [m.date, m.ref]), [['2026-11-10', ref]], '기기에는 최근 기록만, 말씀 출처도 함께 내려옴');
    await p.eval(`openVault()`);
    p.ok(await p.eval(`!!document.querySelector('#vault-banner .premium .vb-btn')`), '보관함: 프리미엄에게 달력 버튼');
    await p.eval(`document.querySelector('#vault-banner .premium .vb-btn').click()`);
    await p.waitFor(`__t.vis('#overlay-dashboard') && !__t.vis('#overlay-vault') && document.querySelectorAll('#hist-cal .hc-day.has').length === 1`, '달력으로 이동, 11월 기록 1일');
    await p.eval(`histPick('2026-11-10')`);
    p.ok((await p.eval(`__t.txt('#hist-cal .hc-entry-verse')`)).includes(ref), '서버에서 온 기록의 그날 말씀');
    p.ok((await p.eval(`__t.txt('#hist-yearly')`)).includes('3일 밤'), '연간 리포트: 2026년 3일 — 실제: ' + (await p.eval(`__t.txt('#hist-yearly')`)).slice(0, 80));
    p.eq(await p.eval(`__t.txt('#hist-note')`), '', '프리미엄에게는 제한 안내가 없음');
    for (let i = 0; i < 8; i++) { await p.eval(`histMove(-1)`); await sleep(30); }
    await p.waitFor(`__t.txt('#hist-cal .hc-title') === '2026년 3월' && document.querySelectorAll('#hist-cal .hc-day.has').length === 2`, '3월: 클라우드 기록 2일');
    await p.eval(`histPick('2026-03-05')`);
    p.eq(await p.eval(`[...document.querySelectorAll('#hist-cal .hc-entry-diary')].map(e => e.textContent)`), ['봄에 쓴 일기'], '그날의 일기 (다른 사람의 기록은 보이지 않음)');
    p.ok((await p.eval(`__t.txt('#hist-monthly')`)).includes('2일 밤') && (await p.eval(`__t.txt('#hist-monthly')`)).includes('1편'), '3월 월간 리포트');
    await p.eval(`document.getElementById('hist-cal-sec').scrollIntoView()`); await p.shot('premium-calendar');
    await p.eval(`document.getElementById('hist-year-sec').scrollIntoView()`); await p.shot('premium-yearly');
    for (let i = 0; i < 3; i++) { await p.eval(`histMove(-1)`); await sleep(30); }
    await p.waitFor(`__t.txt('#hist-cal .hc-title') === '2025년 12월' && document.querySelectorAll('#hist-cal .hc-day.has').length === 1`, '해를 넘겨 2025년 12월');
    p.ok((await p.eval(`__t.txt('#hist-yearly')`)).includes('2025'), '연간 리포트도 2025년으로');
    await p.eval(`window.print = () => { window.__printed = true; }; exportDiaryPdf()`);
    p.ok(await p.eval(`window.__printed === true && document.querySelectorAll('#print-diary .pd-entry').length === 1 && __t.txt('#print-diary').includes('성탄의 일기')`), 'PDF: 보고 있는 달(2025년 12월)의 기록');
    // 구독이 끝나면 지난 기록은 닫히고 볼 수 있는 달로 돌아옴
    await p.eval(`__srv.subscriptions = []; refreshEntitlement()`);
    await p.waitFor(`!isPremium() && __t.txt('#hist-cal .hc-title') === '2026년 11월'`, '구독 종료 → 이번 달로');
    p.ok(await p.eval(`!!document.querySelector('#hist-monthly .locked') && !__t.vis('#hist-year-sec')`), '구독 종료 → 리포트 잠금');
    p.ok((await p.eval(`__t.txt('#hist-note')`)).includes('프리미엄'), '로그인한 무료 사용자 안내 문구');
    // 서버 테이블에 verse_ref 열이 없어도 기록은 저장됨
    await p.eval(`hideOverlay('overlay-dashboard'); (() => { const of = sb.from; sb.from = t => { const a = of(t);
        if (t === 'mood_history') { const ins = a.insert; a.insert = pl => [].concat(pl).some(r => 'verse_ref' in r)
            ? { select() { return this; }, single() { return this; }, then(res, rej) { return Promise.resolve({ data: null, error: { message: "Could not find the 'verse_ref' column of 'mood_history' in the schema cache" } }).then(res, rej); } }
            : ins(pl); }
        return a; }; })()`);
    await p.flow('감사', '가족', '쉼');
    await p.waitFor(`curMoodRowId != null`, '열이 없어도 서버에 기록이 들어감');
    p.ok(await p.eval(`__srv.mood_history.some(r => r.date === '2026-11-17' && !('verse_ref' in r)) && errLog().some(e => e.where === 'mood.verse_ref')`), 'verse_ref 없이 저장되고 사유가 기록됨');
});

/* 결제·AI 화면: 우리 서버(/api/*)와 토스 결제창은 가짜로 바꿔, 브라우저 쪽 흐름만 확인한다 (서버 규칙은 tools/api-test.mjs) */
scenario('구독 결제·해지·AI 돌아보기 화면(가짜 서버·가짜 결제창): 꺼져 있으면 안 보임, 켜면 동의→결제→해지', {
    now: '2026-11-17T21:00:00+09:00', seed: { userName: '' },
}, async p => {
    await p.goto();
    // 기본값(판매 전): 결제 화면이 전혀 없음
    await p.eval(`openPremiumModal()`);
    p.ok(await p.eval(`!__t.vis('#pm-pay') && __t.txt('#pm-cta').includes('알림') && !paymentsOn() && !aiReportOn()`), '스위치가 꺼져 있으면 "출시 알림 받기" 그대로');
    await p.eval(`closePremiumModal(); openPolicy('terms')`);
    p.ok((await p.eval(`__t.txt('#policy-body')`)).includes('아직 판매하지'), '판매 전 약관 문구');
    await p.eval(`hideOverlay('overlay-policy')`);
    // 켜기 + 가짜 서버·결제창
    await p.eval(`PAYMENTS.on = true; PAYMENTS.clientKey = 'test_ck_x'; AI_REPORT.on = true;
        window.__api = []; window.__toss = [];
        window.TossPayments = key => ({ payment: o => ({ requestBillingAuth: async r => { __toss.push({ key, customerKey: o.customerKey, ...r }); } }) });
        const realFetch = window.fetch;
        window.fetch = async (url, init) => {
            if (!String(url).startsWith('/api/')) return realFetch(url, init);
            const name = String(url).slice(5), body = JSON.parse(init.body || '{}');
            __api.push({ name, body, auth: init.headers.authorization });
            const reply = (status, o) => new Response(JSON.stringify(o), { status });
            if (init.headers.authorization !== 'Bearer tok-u1') return reply(401, { ok: false, code: 'BAD_LOGIN' });
            if (name === 'billing-confirm') { __srv.subscriptions = [{ user_id: 'u1', status: 'active', plan: body.plan, current_period_end: '2027-11-17T12:00:00Z' }]; return reply(200, { ok: true, status: 'active' }); }
            if (name === 'billing-cancel') { if (__srv.subscriptions[0]) __srv.subscriptions[0].status = 'canceled'; return reply(200, { ok: true, status: 'canceled' }); }
            if (name === 'ai-report') {
                if (!(__srv.profiles.find(r => r.id === 'u1') || {}).ai_consent_at) return reply(403, { ok: false, code: 'NO_AI_CONSENT' });
                return reply(200, { ok: true, period: body.period, content: '첫 문단 <img src=x onerror=window.__xss=1>\\n\\n둘째 문단', made: 1, left: 1 });
            }
            return reply(404, { ok: false });
        }`);
    await p.eval(`openPremiumModal()`);
    p.ok(await p.eval(`__t.vis('#pm-pay') && document.querySelectorAll('#pm-pay .bl-plan').length === 2 && __t.txt('#pm-cta').includes('로그인')`), '게스트: 요금제 2개, 버튼은 로그인으로');
    p.ok((await p.eval(`__t.txt('#pm-pay')`)).includes('자동 결제'), '결제 전 자동 갱신 고지');
    await p.eval(`closePremiumModal()`);
    // 로그인
    await p.eval(`sb = ${FAKE_SB}({ mood_history: [
            { id: 1, user_id: 'u1', date: '2026-11-10', emotion: '평안', topic: '모름', need: '쉼', diary_text: null },
            { id: 2, user_id: 'u1', date: '2026-11-11', emotion: '감사', topic: '가족', need: '쉼', diary_text: '일기' },
            { id: 3, user_id: 'u1', date: '2026-11-12', emotion: '걱정', topic: '일', need: '힘', diary_text: null }],
        saved_verses: [], visit_dates: [], profiles: [], subscriptions: [] });
        sb.auth.getSession = async () => ({ data: { session: { access_token: 'tok-u1' } } });
        sbUser = { id: 'u1', email: 'u1@example.com' }; updateAuthUI(); syncWithServer()`);
    await p.waitFor(`__t.vis('#sync-modal')`, '클라우드에만 있는 기록이 있어 맞출지 묻는 창');
    await p.eval(`__t.click('#sync-yes')`);
    await p.waitFor(`__t.ls('dataOwner') === 'u1'`, '로그인');
    await p.eval(`openSettings()`);
    p.ok(await p.eval(`__t.vis('#row-sub') && __t.txt('#row-sub-sub').length > 2`), '설정에 구독 줄 (구독하지 않음)');
    await p.eval(`hideOverlay('overlay-settings'); openPremiumModal()`);
    p.ok(await p.eval(`document.getElementById('pm-cta').disabled`), '동의에 체크하기 전에는 구독 버튼이 꺼져 있음');
    await p.eval(`__t.click('#pm-cta')`);
    p.eq(await p.eval('__toss.length'), 0, '동의 없이 눌러도 결제창이 열리지 않음');
    await p.eval(`document.querySelectorAll('#pm-pay .bl-plan')[1].click(); document.getElementById('bl-agree').click()`);
    p.ok(!(await p.eval(`document.getElementById('pm-cta').disabled`)), '동의하면 켜짐');
    await p.eval(`__t.click('#pm-cta')`);
    await p.waitFor('__toss.length === 1', '결제창 호출');
    const t = await p.eval('__toss[0]');
    p.eq([t.key, t.customerKey, t.method], ['test_ck_x', 'u1', 'CARD'], '결제창: 클라이언트 키, 계정 번호, 카드');
    p.ok(t.successUrl.endsWith('?billing=success&plan=yearly') && t.failUrl.endsWith('?billing=fail') && t.successUrl.startsWith('http'), '돌아올 주소: ' + t.successUrl);
    p.eq(await p.eval('__api.length'), 0, '결제창을 여는 것만으로는 서버에 아무것도 보내지 않음');
    await p.eval(`closePremiumModal()`);
    // 결제창에서 실패·취소로 돌아옴
    await p.eval(`history.replaceState(null, '', location.pathname + '?billing=fail&code=PAY_PROCESS_CANCELED&message=x'); captureBillingReturn(); resumeBilling()`);
    await sleep(100);
    p.eq(await p.eval(`[location.search, sessionStorage.getItem('billingReturn'), __api.length]`), ['', null, 0], '취소로 돌아오면 주소를 정리하고 서버를 부르지 않음');
    // 다른 계정의 인증값으로 돌아옴
    await p.eval(`history.replaceState(null, '', location.pathname + '?billing=success&plan=yearly&customerKey=someone&authKey=ak0'); captureBillingReturn(); resumeBilling()`);
    await sleep(100);
    p.eq(await p.eval(`[__api.length, isPremium()]`), [0, false], '계정이 다르면 결제를 진행하지 않음');
    // 성공으로 돌아옴
    await p.eval(`history.replaceState(null, '', location.pathname + '?billing=success&plan=yearly&customerKey=u1&authKey=ak1'); captureBillingReturn(); resumeBilling(); resumeBilling()`);
    await p.waitFor('isPremium()', '결제 확인 후 프리미엄');
    p.eq(await p.eval(`__api.map(a => [a.name, a.body.authKey, a.body.plan, a.auth])`), [['billing-confirm', 'ak1', 'yearly', 'Bearer tok-u1']], '인증값을 로그인 토큰과 함께 서버로 한 번만 보냄');
    p.eq(await p.eval(`[location.search, sessionStorage.getItem('billingReturn')]`), ['', null], '주소·임시값 정리');
    await p.eval(`openPremiumModal()`);
    p.ok(await p.eval(`__t.txt('#pm-pay').includes('이용 중') && __t.txt('#pm-pay').includes('2027') && __t.vis('#bl-cancel') && !__t.vis('#pm-cta')`), '구독 중: 다음 결제일과 해지 버튼');
    await p.eval(`__t.click('#bl-cancel')`);
    await p.waitFor(`__t.txt('#pm-pay').includes('해지됨')`, '해지 반영');
    p.ok(await p.eval(`isPremium() && __t.vis('#pm-cta') && __api[1].name === 'billing-cancel'`), '해지해도 기간이 남아 프리미엄 유지, 다시 구독 버튼');
    await p.eval(`closePremiumModal(); openSettings()`);
    p.ok((await p.eval(`__t.txt('#row-sub-sub')`)).includes('2027'), '설정의 구독 줄에 이용 기한');
    await p.eval(`hideOverlay('overlay-settings'); openPolicy('terms')`);
    p.ok(await p.eval(`__t.txt('#policy-body').includes('자동 갱신') && __t.txt('#policy-body').includes('환불') && !__t.txt('#policy-body').includes('아직 판매하지')`), '판매 중 약관: 자동 갱신·환불 조항');
    await p.eval(`openPolicy('privacy')`);
    p.ok(await p.eval(`__t.txt('#policy-body').includes('토스페이먼츠') && __t.txt('#policy-body').includes('OpenRouter')`), '처리방침: 결제 위탁·AI 국외 전송');
    await p.eval(`hideOverlay('overlay-policy')`);
    // AI 돌아보기: 동의 → 생성 → 철회
    await p.eval(`openDashboard()`);
    await p.waitFor(`!!document.getElementById('ai-btn')`, 'AI 돌아보기 버튼');
    await p.eval(`__t.click('#ai-btn')`);
    p.ok(await p.eval(`__t.vis('#ai-modal') && document.getElementById('ai-consent-agree').disabled && !__api.some(a => a.name === 'ai-report')`), '처음에는 별도 동의 창, 동의 전에는 서버를 부르지 않음');
    await p.eval(`document.getElementById('ai-consent-check').click(); __t.click('#ai-consent-agree')`);
    await p.waitFor(`document.querySelectorAll('#ai-out .ai-card p').length === 2`, 'AI 글 표시(문단 2개)');
    p.ok(await p.eval(`!!__srv.profiles.find(r => r.id === 'u1').ai_consent_at && !document.querySelector('#ai-out img') && window.__xss !== 1 && __t.txt('#ai-out').includes('<img')`), '동의 시각 저장, AI 글은 글자 그대로(태그 실행 안 됨)');
    p.eq(await p.eval(`__api.filter(a => a.name === 'ai-report').map(a => [a.body.period, a.body.lang])`), [['2026-11', 'ko']], '보고 있는 달·언어로 요청');
    p.ok((await p.eval(`__t.txt('#ai-out')`)).includes('대신하지 않아요'), 'AI 글 아래 안내 문구');
    await p.shot('ai-report');
    await p.eval(`withdrawAiConsent()`);
    await p.waitFor(`__srv.profiles.find(r => r.id === 'u1').ai_consent_at === null && __t.txt('#ai-out') === ''`, '동의 철회');
    await p.eval(`__t.click('#ai-btn')`);
    p.ok(await p.eval(`__t.vis('#ai-modal')`), '철회 뒤에는 다시 동의 창');
    await p.eval(`closeAiConsent(); hideOverlay('overlay-dashboard')`);
    // 계정 삭제: 자동결제부터 멈춤
    const before = await p.eval(`__api.filter(a => a.name === 'billing-cancel').length`);
    await p.eval(`deleteAccount()`); await sleep(300);
    p.eq(await p.eval(`[__api.filter(a => a.name === 'billing-cancel').length, sbUser]`), [before + 1, null], '계정 삭제 때 구독 해지를 먼저 요청');
});

/* 화면 둘러보기: 주요 화면을 차례로 열어 본다. --shots=폴더 를 주면 화면마다 PNG가 남아 디자인을 눈으로 볼 수 있다 */
scenario('화면 둘러보기: 주요 화면이 모두 열리고 빈 글·undefined가 없음', {
    now: '2026-11-17T21:00:00+09:00',
    seed: { userName: '은혜', visitDates: JSON.stringify(['2026-11-15', '2026-11-16']), moodHistory: JSON.stringify([
        { date: '2026-11-16', emotion: '걱정', topic: '일', need: '힘', emoji: '😔', diary: '내일 일이 걱정이지만 맡겨드린다.' },
        { date: '2026-11-15', emotion: '감사', topic: '가족', need: '쉼', emoji: '😊' },
        { date: '2026-10-17', emotion: '평안', topic: '모름', need: '쉼', emoji: '😌', diary: '한 달 전의 일기' }]) },
}, async p => {
    await p.goto();
    const look = async name => {
        await sleep(350);
        const txt = await p.eval(`document.body.innerText`);
        p.ok(!/undefined|\bNaN\b|\[object /.test(txt), name + ': 화면에 undefined·NaN·[object 가 보임');
        const w = await p.eval(`document.documentElement.scrollWidth - window.innerWidth`);
        p.ok(w <= 1, name + ': 가로로 ' + w + 'px 넘침');
        await p.shot('tour-' + name);
    };
    await look('01-main');
    await p.eval(`__t.click('#step1 .emo-btn, #step1 button')`).catch(() => {});
    await p.flow('지침', '일', '쉼');
    await p.waitFor(`!document.getElementById('r-verse').classList.contains('typing')`, '말씀 타이핑 끝', 15000);
    await look('02-result-top');
    await p.eval(`window.scrollTo(0, document.body.scrollHeight)`);
    await look('03-result-bottom');
    await p.eval(`document.getElementById('diary-input').value = '오늘도 감사합니다'; __t.click('.btn-restart')`);
    await p.waitFor(`document.getElementById('step4').classList.contains('closing')`, '마무리');
    await p.eval(`window.scrollTo(0, 0)`);
    await look('04-closing');
    await p.eval(`openVault()`); await look('05-vault-mood');
    await p.eval(`switchTab('saved')`); await look('06-vault-saved');
    await p.eval(`hideOverlay('overlay-vault'); openSettings()`); await look('07-settings-top');
    await p.eval(`document.getElementById('overlay-settings').scrollTop = 99999`); await look('08-settings-bottom');
    await p.eval(`hideOverlay('overlay-settings'); openPremiumModal()`); await look('09-premium');
    await p.eval(`closePremiumModal(); openDashboard()`);
    await p.waitFor(`document.querySelectorAll('#hist-cal .hc-day').length > 27`, '달력');
    await look('10-story');
    await p.eval(`hideOverlay('overlay-dashboard'); openPolicy('privacy')`); await look('11-policy');
    await p.eval(`hideOverlay('overlay-policy'); restart()`);
    await p.waitFor(`__t.vis('#step1')`, '처음으로');
    await p.eval(`window.scrollTo(0, 0)`);
    await look('12-main-after');
});

scenario('주제 화면: 8칸이 작은 폰에서도 한 화면에 들어옴', { seed: { userName: '은혜' } }, async p => {
    const devices = [['아이폰 SE', 375, 667], ['갤럭시 소형', 360, 740], ['아이폰 14', 390, 844]];
    await p.goto();
    for (const [name, w, h] of devices) {
        await p.S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: true });
        await p.reload();
        await p.eval(`pick('emotion','걱정')`);
        await p.waitFor(`__t.vis('#step2')`, name + ': 주제 화면');
        const m = await p.eval(`(() => { const r = s => document.querySelector(s).getBoundingClientRect();
            return { skip: Math.round(r('#step2 .step-skip').bottom), vh: innerHeight, n: document.querySelectorAll('#step2 .btn-choice').length,
                     over: document.documentElement.scrollWidth - innerWidth }; })()`);
        p.eq(m.n, 8, name + ': 주제 칸 8개');
        p.ok(m.skip <= m.vh - 8, name + ' ' + w + 'x' + h + ': 건너뛰기 버튼 아래끝 ' + m.skip + 'px가 화면 높이 ' + m.vh + 'px 안에 들어와야 함');
        p.ok(m.over <= 0, name + ': 가로로 넘치면 안 됨 (' + m.over + 'px)');
        await p.shot('topic-' + w + 'x' + h);
    }
});

scenario('좁은 화면(360px)·매우 큰 글씨: 가로로 넘치지 않음', { width: 360, height: 640, seed: { userName: '아주긴이름열두글자까지입력', fontLevel: '2' } }, async p => {
    await p.goto();
    const over = async where => {
        const w = await p.eval(`document.documentElement.scrollWidth - window.innerWidth`);
        p.ok(w <= 1, `${where}: 가로로 ${w}px 넘침`);
    };
    await p.eval(OPEN_LANGS);
    for (const lang of ['ko', 'en', 'ja']) {
        await p.eval(`setLang('${lang}')`);
        await over(`${lang} 메인`);
        await p.flow('아픔', '사람', '지혜');
        await sleep(500); await over(`${lang} 결과`);
        await p.eval(`openSettings()`); await over(`${lang} 설정`);
        await p.eval(`hideOverlay('overlay-settings'); openVault()`); await over(`${lang} 보관함`);
        await p.eval(`hideOverlay('overlay-vault'); openDashboard(); histPick(todayStr())`);
        await p.waitFor(`document.querySelectorAll('#hist-cal .hc-day').length > 27`, '달력');
        await over(`${lang} 나의 이야기`);
        const inner = await p.eval(`(() => { const o = document.querySelector('#overlay-dashboard .overlay-inner'); return o.scrollWidth - o.clientWidth; })()`);
        p.ok(inner <= 1, `${lang} 나의 이야기 안쪽: 가로로 ${inner}px 넘침`);
        await p.shot('narrow-' + lang);
        await p.eval(`hideOverlay('overlay-dashboard'); restart()`);
        await p.waitFor(`__t.vis('#step1')`, '처음으로');
    }
});

scenario('오프라인: Service Worker 캐시만으로 다시 열림', { seed: { userName: '' } }, async p => {
    if (REMOTE) return;
    await p.goto();
    await p.eval(`navigator.serviceWorker.ready.then(() => true)`);
    await p.waitFor(`navigator.serviceWorker.controller`, 'Service Worker가 페이지를 맡음', 10000);
    const n = await p.eval(`caches.keys().then(ks => Promise.all(ks.map(k => caches.open(k).then(c => c.keys())))).then(a => a.flat().length)`);
    p.ok(n >= 15, `캐시에 앱 파일이 담김 (${n}개)`);
    await p.S('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    await p.reload();
    p.ok(await p.eval(`typeof LANG_DATA !== 'undefined' && __t.vis('#step1') && !document.getElementById('boot-fail')`), '오프라인에서도 앱이 켜짐');
    await p.flow('기도', '가족', '힘');
    p.ok((await p.eval(`__t.txt('#r-reflection')`)).length > 3, '오프라인에서도 결과 화면까지');
    p.netFails = [];
});

/* ── 실행 ── */
let failed = 0;
const run = scenarios.filter(s => !FILTER.length || FILTER.some(f => s.name.includes(f)));
console.log(`대상: ${BASE}  ·  브라우저: ${path.basename(exe)}  ·  시나리오 ${run.length}개\n`);
for (const s of run) {
    const p = await openPage(s.opts);
    const t0 = Date.now();
    try { await s.fn(p); } catch (e) { p.fails.push('시나리오 중단: ' + e.message); }
    await sleep(150);
    const problems = [...p.fails.map(f => '✗ ' + f), ...[...new Set(p.errors)].map(e => '✗ 잡히지 않은 오류: ' + e)];
    console.log(`${problems.length ? '✗' : '✓'} ${s.name}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    for (const m of problems) console.log('    ' + m);
    const nets = [...new Set(p.netFails)];
    if (nets.length) console.log('    · 네트워크: ' + nets.slice(0, 3).join(' | ').slice(0, 300));
    if (problems.length) failed++;
    await p.close();
}
ws.close(); proc.kill(); server.close();
await sleep(300);
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(failed ? `\n✗ ${failed}개 시나리오 실패 (전체 ${run.length}개)` : `\n✓ 실행 점검 통과 (${run.length}개 시나리오)`);
process.exit(failed ? 1 : 0);
