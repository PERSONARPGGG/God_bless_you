/* Supabase 점검 — 프로젝트를 살리거나 새로 만든 뒤 한 번에 확인한다 (설치할 것 없음, Node 22+)
   node tools/supabase-check.mjs
   js/core.js의 SUPABASE_URL·SUPABASE_KEY(공개 키)로 아래를 확인:
   ① 주소가 열리는지(DNS) ② REST가 응답하는지 ③ 테이블 5개가 있는지 ④ 로그인 없이 남의 기록이 보이지 않는지(RLS) ⑤ Google 로그인이 켜져 있는지 */
import fs from 'node:fs';
import dns from 'node:dns/promises';
const src = fs.readFileSync(new URL('../js/core.js', import.meta.url), 'utf8');
const URL_ = (src.match(/SUPABASE_URL\s*=\s*'([^']+)'/) || [])[1], KEY = (src.match(/SUPABASE_KEY\s*=\s*'([^']+)'/) || [])[1];
let bad = 0;
const ok = (m) => console.log('✓ ' + m), no = (m) => { bad++; console.log('✗ ' + m); };
if (!URL_ || !KEY) { console.log('✗ js/core.js에서 SUPABASE_URL·SUPABASE_KEY를 찾지 못함'); process.exit(1); }
console.log('대상: ' + URL_);
try { await dns.lookup(new globalThis.URL(URL_).hostname); ok('주소(DNS)가 열려 있음'); }
catch { no('주소(DNS)가 없음 — 프로젝트가 일시정지·삭제된 상태. 대시보드에서 Restore project 하거나 새 프로젝트를 만들고 js/core.js의 URL·키를 바꾸세요'); process.exit(1); }
const get = (p, h = {}) => fetch(URL_ + p, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, ...h }, signal: AbortSignal.timeout(10000) });
try { const r = await get('/rest/v1/'); r.status < 500 ? ok('REST 응답 ' + r.status) : no('REST 오류 ' + r.status); } catch (e) { no('REST 연결 실패: ' + e.message); process.exit(1); }
for (const t of ['profiles', 'visit_dates', 'mood_history', 'saved_verses', 'subscriptions']) {
    try {
        const r = await get('/rest/v1/' + t + '?select=*&limit=3');
        const body = await r.json().catch(() => null);
        if (r.status === 404 || (body && body.code === 'PGRST205')) no(`테이블 ${t} 없음 — docs/supabase_schema.sql(+ docs/supabase_v2.7.sql)을 SQL Editor에서 실행하세요`);
        else if (r.ok && Array.isArray(body) && body.length === 0) ok(`테이블 ${t}: 있음, 로그인 없이는 아무 행도 안 보임 (RLS 정상)`);
        else if (r.ok && Array.isArray(body)) no(`테이블 ${t}: 로그인 없이 ${body.length}행이 보임 — RLS(행 단위 보안)가 꺼져 있거나 정책이 너무 넓음. 개인 기록이 노출될 수 있으니 즉시 수정`);
        else ok(`테이블 ${t}: 있음 (접근 거부 ${r.status} — 보호됨)`);
    } catch (e) { no(`테이블 ${t} 확인 실패: ${e.message}`); }
}
try {
    const s = await (await get('/auth/v1/settings')).json();
    s.external && s.external.google ? ok('Google 로그인 켜져 있음') : no('Google 로그인이 꺼져 있음 — Authentication > Providers > Google 에서 켜고 Client ID·Secret 입력');
} catch (e) { no('인증 설정 확인 실패: ' + e.message); }
console.log(bad ? `\n✗ ${bad}건 확인 필요` : '\n✓ Supabase 점검 통과');
process.exit(bad ? 1 : 0);
