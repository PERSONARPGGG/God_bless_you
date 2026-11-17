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

scenario('전 조합 120개 × 3개 언어: 빈 카드·undefined·언어 섞임 없음', { seed: { userName: '' } }, async p => {
    await p.goto();
    const bad = await p.eval(`(() => {
        const bad = [], E = ['감사','평안','걱정','지침','아픔','기도'], T = ['일','가족','공부','사람','모름'], N = ['위로','힘','지혜','쉼'];
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

scenario('날짜: 미국 시간대에서도 하루가 밀리지 않음', {
    now: '2026-11-16T22:00:00-05:00', tz: 'America/New_York',
    seed: { userName: '', appLang: 'en', moodHistory: JSON.stringify([{ date: '2026-11-16', emotion: '감사', topic: '일', need: '힘', emoji: '😊' }]) },
}, async p => {
    await p.goto();
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
    p.eq(await p.eval(`[...document.querySelectorAll('.svi-context')].map(e => e.textContent)`), ['😊 감사했어요 · 🌙 그냥 쉬고 싶어요', '😌 평안했어요 · 🌙 그냥 쉬고 싶어요'], '즐겨찾기 표시(예전 방식·서버에서 온 것)');
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

scenario('좁은 화면(360px)·매우 큰 글씨: 가로로 넘치지 않음', { width: 360, height: 640, seed: { userName: '아주긴이름열두글자까지입력', fontLevel: '2' } }, async p => {
    await p.goto();
    const over = async where => {
        const w = await p.eval(`document.documentElement.scrollWidth - window.innerWidth`);
        p.ok(w <= 1, `${where}: 가로로 ${w}px 넘침`);
    };
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
