#!/usr/bin/env node
/* 밤의 목장 — 서버 함수 점검 (설치할 것 없음)
   실행:  node tools/api-test.mjs
   lib/server.mjs를 실제 그대로 돌리되, 바깥 세상(Supabase·토스·OpenRouter)은 메모리 안의 가짜로 바꿔
   결제·해지·갱신·AI 돌아보기의 규칙을 확인한다. 실제 토스 테스트 키로 하는 확인은 이것과 별개로 필요하다. */
import { handle, addMonths, PLANS } from '../lib/server.mjs';

const U1 = '11111111-1111-4111-8111-111111111111', U2 = '22222222-2222-4222-8222-222222222222';
let fails = 0, count = 0;
const ok = (cond, msg) => { count++; if (!cond) { fails++; console.log('    ✗ ' + msg); } };
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} — 기대 ${JSON.stringify(b)}, 실제 ${JSON.stringify(a)}`);

/* ── 가짜 바깥 세상 ── */
function world(nowIso) {
    const w = {
        now: new Date(nowIso),
        tables: { subscriptions: [], billing_keys: [], payments: [], ai_reports: [], profiles: [], mood_history: [] },
        tokens: { 'tok-u1': U1, 'tok-u2': U2 },
        toss: { issued: 0, charges: [], deleted: [], failCharge: null, failIssue: false, seenOrders: new Map() },
        ai: { calls: [], reply: '한 달을 돌아보는 글입니다.' },
        calls: [],
    };
    const pk = { subscriptions: ['user_id'], billing_keys: ['user_id'], payments: ['order_id'], ai_reports: ['user_id', 'period'], profiles: ['id'] };
    const res = (status, body) => new Response(status === 204 ? null : (body === null ? '' : JSON.stringify(body)), { status });
    const filterFn = params => {
        const fs = [];
        for (const [k, v] of params) {
            if (['select', 'limit', 'order', 'on_conflict'].includes(k)) continue;
            const m = /^(eq|lte|gte|in)\.(.*)$/s.exec(v);
            if (!m) throw new Error('가짜 DB가 모르는 조건: ' + k + '=' + v);
            if (m[1] === 'eq') fs.push(r => String(r[k]) === m[2]);
            if (m[1] === 'lte') fs.push(r => r[k] != null && String(r[k]) <= m[2]);
            if (m[1] === 'gte') fs.push(r => r[k] != null && String(r[k]) >= m[2]);
            if (m[1] === 'in') { const list = m[2].replace(/^\(|\)$/g, '').split(','); fs.push(r => list.includes(String(r[k]))); }
        }
        return r => fs.every(f => f(r));
    };
    w.fetch = async (url, init = {}) => {
        const u = new URL(url), method = init.method || 'GET', body = init.body ? JSON.parse(init.body) : null;
        const h = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
        w.calls.push({ url, method, body, headers: h });
        if (u.host === 'db.test') {
            if (h.apikey !== 'svc-key') return res(401, { message: 'bad key' });
            if (u.pathname === '/auth/v1/user') {
                const id = w.tokens[(h.authorization || '').slice(7)];
                return id ? res(200, { id, email: 'x@example.com' }) : res(401, { message: 'invalid token' });
            }
            const t = u.pathname.replace('/rest/v1/', ''), rows = w.tables[t];
            if (!rows) return res(404, { message: 'no table ' + t });
            const hit = filterFn(u.searchParams);
            if (method === 'GET') { const lim = Number(u.searchParams.get('limit')) || 1e9; return res(200, rows.filter(hit).slice(0, lim)); }
            if (method === 'POST') {
                const keys = (u.searchParams.get('on_conflict') || '').split(',').filter(Boolean);
                const old = keys.length ? rows.find(r => keys.every(k => r[k] === body[k])) : null;
                if (old) Object.assign(old, body);
                else { if ((pk[t] || []).length && rows.some(r => pk[t].every(k => r[k] === body[k]))) return res(409, { message: 'duplicate' }); rows.push({ ...body }); }
                return res(201, [old || body]);
            }
            if (method === 'PATCH') { const hits = rows.filter(hit); hits.forEach(r => Object.assign(r, body)); return res(200, hits); }
            if (method === 'DELETE') { w.tables[t] = rows.filter(r => !hit(r)); return res(204, null); }
        }
        if (u.host === 'api.tosspayments.com') {
            if (h.authorization !== 'Basic ' + Buffer.from('test_sk_x:').toString('base64')) return res(401, { code: 'UNAUTHORIZED_KEY', message: 'bad key' });
            if (u.pathname === '/v1/billing/authorizations/issue') {
                if (w.toss.failIssue || body.authKey === 'used') return res(400, { code: 'INVALID_AUTH_KEY', message: '이미 사용된 인증' });
                w.toss.issued++;
                return res(200, { billingKey: 'bk-' + w.toss.issued, customerKey: body.customerKey, card: { cardType: '신용', number: '4330****123*' } });
            }
            const m = /^\/v1\/billing\/(.+)$/.exec(u.pathname);
            if (m && method === 'DELETE') { w.toss.deleted.push(m[1]); return res(200, null); }
            if (m && method === 'POST') {
                const idem = h['idempotency-key'];
                if (w.toss.seenOrders.has(idem)) return res(200, w.toss.seenOrders.get(idem));   // 같은 주문번호는 처음 결과를 그대로
                if (w.toss.failCharge) return res(400, { code: w.toss.failCharge, message: '한도 초과' });
                const pay = { paymentKey: 'pay-' + (w.toss.charges.length + 1), status: 'DONE', orderId: body.orderId, totalAmount: body.amount, approvedAt: w.now.toISOString(), receipt: { url: 'https://r/' + body.orderId } };
                w.toss.charges.push({ billingKey: m[1], ...body });
                w.toss.seenOrders.set(idem, pay);
                return res(200, pay);
            }
        }
        if (u.host === 'openrouter.ai') {
            w.ai.calls.push(body);
            return w.ai.reply === null ? res(500, { error: 'down' }) : res(200, { choices: [{ message: { content: w.ai.reply } }] });
        }
        throw new Error('가짜 세상에 없는 주소: ' + url);
    };
    w.ctx = { env: { SUPABASE_URL: 'https://db.test', SUPABASE_SERVICE_KEY: 'svc-key', TOSS_SECRET_KEY: 'test_sk_x', CRON_SECRET: 'cron-secret',
                     OPENROUTER_API_KEY: 'or-key', OPENROUTER_MODEL: 'test/model', APP_ORIGIN: 'https://app.test' }, fetch: w.fetch, now: () => w.now };
    w.call = async (name, { method = 'POST', token, body, headers = {} } = {}) => {
        const hs = { 'content-type': 'application/json', ...headers };
        if (token) hs.authorization = 'Bearer ' + token;
        const r = await handle(name, new Request('https://app.test/api/' + name, { method, headers: hs, body: method === 'GET' ? undefined : JSON.stringify(body || {}) }), w.ctx);
        return { status: r.status, body: await r.json().catch(() => null), headers: r.headers };
    };
    w.sub = uid => w.tables.subscriptions.find(r => r.user_id === uid);
    return w;
}

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('날짜: 한 달 뒤 같은 날, 없는 날은 말일', () => {
    eq(addMonths(new Date('2026-01-31T10:00:00Z'), 1).toISOString(), '2026-02-28T10:00:00.000Z', '1월 31일 + 1개월');
    eq(addMonths(new Date('2026-11-17T12:00:00Z'), 1).toISOString(), '2026-12-17T12:00:00.000Z', '11월 17일 + 1개월');
    eq(addMonths(new Date('2026-11-17T12:00:00Z'), 12).toISOString(), '2027-11-17T12:00:00.000Z', '+ 12개월');
    eq(addMonths(new Date('2028-02-29T00:00:00Z'), 12).toISOString(), '2029-02-28T00:00:00.000Z', '윤일 + 12개월');
});

test('구독 시작: 로그인 확인 → 빌링키 발급 → 첫 결제 → 구독 한 달', async () => {
    const w = world('2026-11-17T12:00:00Z');
    eq((await w.call('billing-confirm', { body: { authKey: 'a1', plan: 'monthly' } })).status, 401, '로그인 토큰이 없으면 거절');
    eq((await w.call('billing-confirm', { token: 'nope', body: { authKey: 'a1', plan: 'monthly' } })).status, 401, '가짜 토큰 거절');
    eq((await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'weekly' } })).body.code, 'BAD_PLAN', '없는 요금제 거절');
    eq(w.toss.issued, 0, '거절된 요청은 토스를 부르지 않음');
    const r = await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly', userId: U2, amount: 1 } });
    eq([r.status, r.body.status, r.body.current_period_end], [200, 'active', '2026-12-17T12:00:00.000Z'], '구독 시작');
    eq(w.toss.charges.map(c => [c.customerKey, c.amount, c.billingKey]), [[U1, 1900, 'bk-1']], '금액·대상은 서버가 정함 (브라우저가 보낸 값은 무시)');
    ok(/^[A-Za-z0-9_=-]{6,64}$/.test(w.toss.charges[0].orderId), '주문번호 형식: ' + w.toss.charges[0].orderId);
    eq(w.tables.billing_keys.map(k => [k.user_id, k.billing_key]), [[U1, 'bk-1']], '빌링키 저장');
    eq(w.tables.payments.map(p => [p.user_id, p.amount, p.status]), [[U1, 1900, 'DONE']], '결제 내역 저장');
    ok(!w.sub(U2), '다른 사용자에게는 아무 일도 없음');
    const again = await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'used', plan: 'monthly' } });
    eq([again.status, w.toss.charges.length], [200, 1], '같은 요청이 한 번 더 와도 성공으로 답하고 이중 결제 없음');
});

test('연간 요금제', async () => {
    const w = world('2026-11-17T12:00:00Z');
    const r = await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'yearly' } });
    eq([r.body.current_period_end, w.toss.charges[0].amount, w.sub(U1).plan], ['2027-11-17T12:00:00.000Z', PLANS.yearly.amount, 'yearly'], '1년, 19,000원');
});

test('첫 결제 실패: 구독이 생기지 않고 등록한 카드도 지움', async () => {
    const w = world('2026-11-17T12:00:00Z');
    w.toss.failCharge = 'REJECT_CARD_COMPANY';
    const r = await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly' } });
    eq([r.status, r.body.code], [402, 'REJECT_CARD_COMPANY'], '실패 사유 전달');
    eq([w.sub(U1), w.tables.billing_keys.length, w.toss.deleted], [undefined, 0, ['bk-1']], '구독·키 없음, 토스의 키도 삭제');
    w.toss.failCharge = null; w.toss.failIssue = true;
    eq((await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a2', plan: 'monthly' } })).status, 402, '카드 등록 실패');
    ok(!w.sub(U1), '등록 실패 때도 구독 없음');
});

test('해지: 다음 결제부터 멈추고, 결제한 기간은 끝까지', async () => {
    const w = world('2026-11-17T12:00:00Z');
    await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly' } });
    eq((await w.call('billing-cancel', {})).status, 401, '로그인 없이 해지 불가');
    const r = await w.call('billing-cancel', { token: 'tok-u1' });
    eq([r.body.status, r.body.current_period_end, w.tables.billing_keys.length, w.toss.deleted], ['canceled', '2026-12-17T12:00:00.000Z', 0, ['bk-1']], '해지');
    w.now = new Date('2026-12-17T01:00:00Z');
    const cron = await w.call('billing-renew', { method: 'GET', headers: { authorization: 'Bearer cron-secret' } });
    eq([cron.body.renewed, w.toss.charges.length], [0, 1], '해지한 구독은 갱신 결제되지 않음');
    eq((await w.call('billing-cancel', { token: 'tok-u1' })).body.status, 'canceled', '두 번 해지해도 그대로');
    // 기간 안에 다시 구독: 결제 없이 이어 감
    w.now = new Date('2026-12-10T12:00:00Z');
    const re = await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a2', plan: 'monthly' } });
    eq([re.body.status, re.body.current_period_end, w.toss.charges.length], ['active', '2026-12-17T12:00:00.000Z', 1], '남은 기간에 다시 구독하면 지금은 결제하지 않음');
    eq((await w.call('billing-cancel', { token: 'tok-u2' })).body.status, 'inactive', '구독이 없는 사람이 해지해도 오류 없음');
});

test('갱신: 끝나기 전날 결제하고 원래 끝나는 날에서 이어 붙임, 이중 결제 없음', async () => {
    const w = world('2026-11-17T12:00:00Z');
    await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly' } });
    const cron = () => w.call('billing-renew', { method: 'GET', headers: { authorization: 'Bearer cron-secret' } });
    eq((await w.call('billing-renew', { method: 'GET' })).status, 401, '비밀 값 없이는 갱신 호출 불가');
    eq((await w.call('billing-renew', { method: 'GET', headers: { authorization: 'Bearer wrong' } })).status, 401, '틀린 비밀 값 거절');
    w.now = new Date('2026-12-10T01:00:00Z');
    eq([(await cron()).body.checked, w.toss.charges.length], [0, 1], '아직 멀었으면 결제하지 않음');
    w.now = new Date('2026-12-17T01:00:00Z');
    eq([(await cron()).body.renewed, w.sub(U1).current_period_end, w.toss.charges.length], [1, '2027-01-17T12:00:00.000Z', 2], '끝나기 11시간 전에 갱신');
    eq([(await cron()).body.checked, w.toss.charges.length], [0, 2], '같은 날 다시 불려도 결제하지 않음');
    // 갱신 결과를 DB에 쓰기 전에 죽었다가 다시 불린 경우: 같은 주문번호라 토스가 처음 결과를 돌려줌
    w.sub(U1).current_period_end = '2027-01-17T12:00:00.000Z'; w.now = new Date('2027-01-17T01:00:00Z');
    await cron(); const n = w.toss.charges.length;
    w.sub(U1).current_period_end = '2027-01-17T12:00:00.000Z';
    await cron();
    eq([w.toss.charges.length, w.sub(U1).current_period_end], [n, '2027-02-17T12:00:00.000Z'], '같은 기간을 두 번 결제하지 않음');
});

test('갱신 실패: 기간이 남으면 이용 유지, 지나면 past_due, 3번 실패하면 종료', async () => {
    const w = world('2026-11-17T12:00:00Z');
    await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly' } });
    await w.call('billing-confirm', { token: 'tok-u2', body: { authKey: 'b1', plan: 'monthly' } });
    const cron = () => w.call('billing-renew', { method: 'GET', headers: { authorization: 'Bearer cron-secret' } });
    w.toss.failCharge = 'EXCEED_MAX_AMOUNT';
    w.now = new Date('2026-12-17T01:00:00Z'); await cron();
    eq([w.sub(U1).status, w.sub(U1).fail_count], ['active', 1], '1번 실패 (기간 남음) → 이용 유지');
    w.now = new Date('2026-12-18T01:00:00Z'); await cron();
    eq([w.sub(U1).status, w.sub(U1).fail_count], ['past_due', 2], '2번 실패 (기간 지남) → past_due');
    w.toss.failCharge = null; w.sub(U2).fail_count = 2; w.toss.failCharge = 'EXCEED_MAX_AMOUNT';
    w.now = new Date('2026-12-19T01:00:00Z'); const r = await cron();
    eq([w.sub(U1).status, w.sub(U1).fail_count, w.tables.billing_keys.length], ['inactive', 3, 0], '3번 실패 → 구독 종료, 카드 삭제');
    ok(r.body.ended >= 1, '종료 건수 보고');
    // 다시 성공하는 경우
    const w2 = world('2026-11-17T12:00:00Z');
    await w2.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly' } });
    w2.toss.failCharge = 'EXCEED_MAX_AMOUNT'; w2.now = new Date('2026-12-18T01:00:00Z');
    await w2.call('billing-renew', { method: 'GET', headers: { authorization: 'Bearer cron-secret' } });
    w2.toss.failCharge = null; w2.now = new Date('2026-12-19T01:00:00Z');
    await w2.call('billing-renew', { method: 'GET', headers: { authorization: 'Bearer cron-secret' } });
    eq([w2.sub(U1).status, w2.sub(U1).fail_count, w2.sub(U1).current_period_end], ['active', 0, '2027-01-17T12:00:00.000Z'], '다음 날 성공하면 원래 날짜 기준으로 이어짐');
});

test('웹훅: 토스에서 카드가 지워지면 다음 결제를 멈춤, 모르는 키는 무시', async () => {
    const w = world('2026-11-17T12:00:00Z');
    await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly' } });
    await w.call('toss-webhook', { body: { eventType: 'BILLING_DELETED', data: { billingKey: 'someone-elses' } } });
    await w.call('toss-webhook', { body: { eventType: 'PAYMENT_STATUS_CHANGED', data: { status: 'DONE' } } });
    eq([w.sub(U1).status, w.tables.billing_keys.length], ['active', 1], '모르는 키·다른 이벤트는 아무 일도 하지 않음');
    await w.call('toss-webhook', { body: { eventType: 'BILLING_DELETED', data: { billingKey: 'bk-1' } } });
    eq([w.sub(U1).status, w.tables.billing_keys.length], ['canceled', 0], '등록된 키가 지워지면 해지 상태로');
});

test('다른 사이트에서 부르는 요청 거절, 허용되지 않는 방식 거절', async () => {
    const w = world('2026-11-17T12:00:00Z');
    eq((await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly' }, headers: { origin: 'https://evil.test' } })).status, 403, '다른 출처 거절');
    eq(w.toss.issued, 0, '거절된 요청은 결제로 이어지지 않음');
    eq((await w.call('billing-cancel', { method: 'GET', token: 'tok-u1' })).status, 405, 'GET으로 해지 불가');
    const good = await w.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly' }, headers: { origin: 'https://app.test' } });
    eq([good.status, good.headers.get('access-control-allow-origin')], [200, 'https://app.test'], '우리 앱에서 온 요청은 통과');
    const w3 = world('2026-11-17T12:00:00Z'); delete w3.ctx.env.TOSS_SECRET_KEY;
    const nc = await w3.call('billing-confirm', { token: 'tok-u1', body: { authKey: 'a1', plan: 'monthly' } });
    eq([nc.status, nc.body.code], [500, 'NOT_CONFIGURED'], '키가 설정되지 않았으면 결제하지 않고 알림');
});

test('AI 돌아보기: 프리미엄 + 동의가 있어야 하고, 저장된 글을 재사용, 횟수 제한', async () => {
    const w = world('2026-11-17T12:00:00Z');
    const days = ['03', '05', '09', '12'].map((d, i) => ({ user_id: U1, date: '2026-10-' + d, emotion: ['걱정', '지침', '감사', '평안'][i], topic: '일', need: '쉼', diary_text: i === 0 ? '비밀 일기 내용' : null }));
    w.tables.mood_history.push(...days, { user_id: U2, date: '2026-10-04', emotion: '아픔', topic: '사람', need: '위로', diary_text: '다른 사람의 일기' });
    const ask = (extra = {}) => w.call('ai-report', { token: 'tok-u1', body: { period: '2026-10', lang: 'ko', ...extra } });
    eq((await ask()).body.code, 'NOT_PREMIUM', '무료 사용자 거절');
    w.tables.subscriptions.push({ user_id: U1, status: 'active', current_period_end: '2026-12-01T00:00:00Z' });
    w.tables.profiles.push({ id: U1, ai_consent_at: null });
    eq((await ask()).body.code, 'NO_AI_CONSENT', '동의가 없으면 거절');
    eq(w.ai.calls.length, 0, '거절된 요청은 AI로 아무것도 보내지 않음');
    w.tables.profiles[0].ai_consent_at = '2026-11-17T00:00:00Z';
    eq((await ask({ period: '2026-13' })).body.code, 'BAD_PERIOD', '잘못된 달 거절');
    const r = await ask();
    eq([r.status, r.body.content, r.body.left, r.body.cached], [200, '한 달을 돌아보는 글입니다.', 1, false], '생성');
    const sent = JSON.stringify(w.ai.calls[0]);
    ok(sent.includes('비밀 일기 내용') && !sent.includes('다른 사람의 일기'), '본인의 그 달 기록만 보냄');
    ok(!sent.includes(U1) && !sent.includes('example.com'), '이름·이메일·계정 식별자는 보내지 않음');
    eq(w.ai.calls[0].provider, { data_collection: 'deny' }, '학습·보관하지 않는 제공자로 한정');
    eq([(await ask()).body.cached, w.ai.calls.length], [true, 1], '다시 열면 저장된 글 (AI 호출 없음)');
    eq([(await ask({ regenerate: true })).body.left, w.ai.calls.length], [0, 2], '다시 만들기 1회');
    eq([(await ask({ regenerate: true })).body.code, w.ai.calls.length], ['AI_LIMIT', 2], '상한을 넘으면 거절');
    eq((await w.call('ai-report', { token: 'tok-u1', body: { period: '2026-09' } })).body.code, 'TOO_FEW', '기록이 3일 미만인 달은 만들지 않음');
    w.tables.ai_reports.length = 0; w.ai.reply = null;
    eq([(await ask()).body.code, w.tables.ai_reports.length], ['AI_FAILED', 0], 'AI 장애 시 실패를 알리고 횟수를 쓰지 않음');
    w.tables.subscriptions[0].current_period_end = '2026-11-01T00:00:00Z'; w.ai.reply = 'x';
    eq((await ask()).body.code, 'NOT_PREMIUM', '구독이 끝나면 거절');
});

console.log(`서버 함수 점검  ·  ${tests.length}개 묶음\n`);
for (const t of tests) {
    const before = fails;
    try { await t.fn(); } catch (e) { fails++; console.log('    ✗ 예외: ' + (e && e.stack || e)); }
    console.log((fails === before ? '✓ ' : '✗ ') + t.name);
}
console.log(fails ? `\n✗ ${fails}건 실패 (확인 ${count}건)` : `\n✓ 서버 함수 점검 통과 (확인 ${count}건)`);
process.exit(fails ? 1 : 0);
