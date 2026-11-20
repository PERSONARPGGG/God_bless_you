/* 밤의 목장 — js/core.js : 전역 상태 · 오류 격리(safe) · 저장소 · 날짜 · 공용 도구
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다)
   다른 모든 파일이 여기 것을 씁니다. 여기에는 화면(DOM)을 건드리는 코드를 넣지 않습니다. */

/* ═══════════════════════════════════════
   상태
═══════════════════════════════════════ */
const APP_VERSION = '2.10';
/* 앱 주소 — 도메인을 바꿀 때 여기와 index.html의 og:url, sitemap.xml을 함께 바꾼다 (tools/check.mjs가 서로 다르면 알려 줌).
   Supabase(Authentication > URL Configuration)와 Google OAuth의 허용 주소에도 새 주소를 추가해야 로그인이 된다. */
const SHARE_URL = 'https://god-bless-you.vercel.app/';
const SUPABASE_URL = 'https://pzakpaomnmahcugkzdff.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nyWe0_C6prKvfP9R9EMXdA_DgH6bfwf';
/* 결제·AI 스위치 — 준비가 끝나기 전에는 둘 다 false (화면에 아무것도 나타나지 않음).
   켜기 전 확인: ① Supabase에 docs/supabase_schema.sql 실행 ② Vercel 환경 변수 설정 (lib/server.mjs 맨 위 목록)
   ③ PAYMENTS.clientKey에 토스 클라이언트 키(test_ck_… → 심사 후 live_ck_…; 공개돼도 되는 키) ④ js/premium.js의 DEMO_UNLOCK = false
   시크릿 키(test_sk_/live_sk_)와 AI 키는 절대 여기에 적지 않는다 — 서버 환경 변수에만. */
const PAYMENTS = { on: false, clientKey: '' };
const AI_REPORT = { on: false };
let sb = null;
let sbUser = null;

let sel = { emotion:null, topic:null, need:null };
let curVerse = null;
let verseSaved = false;
let curMoodRowId = null;   // 방금 서버에 넣은 감정 기록의 id (일기를 그 줄에만 붙이기 위함)
let fontLevel = 0;

/* 결과화면 마무리(클로징) 상태 */
/* 지금 열려 있는 언어. 영어·일본어는 말씀 번역본의 이용 조건을 확인하기 전까지 잠시 닫아 둔다.
   데이터(LANG_DATA의 en·ja, VERSE_POOL_EN 등)는 지우지 않고 그대로 있음 — 다시 열 때는 'en', 'ja'를 이 목록에 넣기만 하면 된다.
   저장된 언어 설정(appLang)도 지우지 않으므로, 다시 열면 이전 선택이 살아난다 */
const ENABLED_LANGS = ['ko'];
/* 이 언어가 지금 열려 있는가 (ENABLED_LANGS) */
function langEnabled(l) { return ENABLED_LANGS.includes(l); }

const CLOSING_TIMEOUT = 300;   // 5분
const CLOSING_WARN_AT = 30;    // 마지막 30초 경고
let closingTriggered = false;
let closingTimerId = null;
let closingCountdown = CLOSING_TIMEOUT;
let closingWarned = false;

/* ═══════════════════════════════════════
   오류 격리
   한 기능이 고장 나도 그 기능만 빠지고 나머지는 계속 가도록, 여러 일을 차례로 하는 곳
   (앱 시작·결과 화면 만들기·마무리 등)에서는 각 단계를 safe()로 감싼다.
   잡힌 오류는 조용히 사라지지 않고 기기에 최근 30건이 남는다 (콘솔에서 errLog()).
═══════════════════════════════════════ */
const ERR_KEEP = 30;
/* 잡힌 오류를 기기에 30건까지 남김 (콘솔에서 errLog()로 확인) */
function logErr(where, e) {
    try {
        const list = lsArr('errLog');
        list.unshift({ at: new Date().toISOString(), v: APP_VERSION, where: String(where).slice(0, 60),
                       msg: String((e && e.message) || e).slice(0, 200),
                       stack: String((e && e.stack) || '').split('\n').slice(1, 4).join(' | ').slice(0, 300) });
        lsSet('errLog', list.slice(0, ERR_KEEP));
    } catch (_) {}
    try { console.warn('[밤의 목장] ' + where + ' 에서 문제가 생겼지만 계속 진행합니다:', e); } catch (_) {}
}
/* 남겨 둔 오류 목록 */
function errLog() { return lsArr('errLog'); }

/* fn을 실행하고, 실패하면 기록만 남기고 fallback을 돌려준다 */
function safe(where, fn, fallback) {
    try { return fn(); }
    catch (e) { logErr(where, e); return fallback; }
}
/* 나중에 실행되는 일(연출 등)도 실패가 밖으로 새지 않게 */
function later(where, fn, ms) { return setTimeout(() => safe(where, fn), ms); }

/* safe()로 감싸지 못한 곳(버튼의 onclick 등)에서 난 오류도 기록 */
window.addEventListener('error', e => { if (e && e.error) logErr('window', e.error); });
window.addEventListener('unhandledrejection', e => { logErr('promise', e && e.reason); });

/* ═══════════════════════════════════════
   저장소 (localStorage)
   값의 모양을 믿지 않는다: 기록류는 반드시 getMoods()/getSaved()/getVisits()로 읽는다.
   (저장소가 깨졌거나 예전 형식이어도 배열·정상 항목만 돌려줌)
═══════════════════════════════════════ */
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { try { return localStorage.getItem(k); } catch { return null; } } }
/* 저장에 성공하면 true. 저장 공간이 가득 찼거나 시크릿 모드라 실패하면 false — "저장됐다"고 말하기 전에 확인할 수 있게 */
function lsSet(k,v) { try { localStorage.setItem(k, typeof v==='object' ? JSON.stringify(v) : String(v)); return true; } catch { return false; } }
/* 저장소에서 배열로 읽기 (모양이 깨졌으면 빈 배열) */
function lsArr(k) { const v = lsGet(k); return Array.isArray(v) ? v : []; }
/* 정수 설정값: 숫자가 아니거나 범위를 벗어나면 기본값 */
function lsInt(k, min, max, dflt) {
    const n = parseInt(lsGet(k), 10);
    return Number.isFinite(n) && n >= min && n <= max ? n : dflt;
}

const isYmd = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const DIARY_KEEP_DAYS = 365;  // 일기를 쓴 기록은 기기에 1년 둔다 (손으로 쓴 글이 두 달 만에 사라지면 안 됨)
const LOCAL_KEEP_DAYS = 62;   // 기기에 남기는 감정 기록·방문일 기간 (이번 달 리포트와 "한 달 전 오늘 밤"에 필요한 만큼)

/* 감정 기록 — 최신순 [{date:'YYYY-MM-DD', emotion, topic, need, emoji, diary?, ref?(그날 본 말씀의 출처)}] */
function getMoods()  { return lsArr('moodHistory').filter(h => h && typeof h === 'object' && isYmd(h.date) && h.emotion); }
/* 즐겨찾기 말씀 — 최신순 [{verse, ref, emotion?, need?, savedAt?, date?, context?}] */
function getSaved()  { return lsArr('savedVerses').filter(v => v && typeof v === 'object' && v.verse); }
/* 방문일 ['YYYY-MM-DD', …] (중복 없음) */
function getVisits() { return [...new Set(lsArr('visitDates').filter(isYmd))]; }
/* 기기 보관 기간이 지난 기록을 덜어 낸 목록 */
function trimMoods(list) {
    const cut = ymd(addDays(new Date(), -LOCAL_KEEP_DAYS)), cutDiary = ymd(addDays(new Date(), -DIARY_KEEP_DAYS));
    return list.filter(h => h.date >= cut || (h.diary && h.date >= cutDiary));
}

/* ═══════════════════════════════════════
   날짜 — 전부 "이 기기의 현지 날짜" 기준
   toISOString()은 UTC라서 한국에서는 자정~오전 9시에 어제 날짜가 나온다. 쓰지 말 것.
═══════════════════════════════════════ */
function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
/* 오늘 날짜 YYYY-MM-DD (현지 기준) */
function todayStr() { return ymd(new Date()); }
/* 'YYYY-MM-DD' → 현지 자정의 Date (new Date('YYYY-MM-DD')는 UTC 자정이라 서쪽 시간대에서 전날이 됨) */
function parseYmd(s) { const p = String(s).split('-').map(Number); return new Date(p[0], (p[1] || 1) - 1, p[2] || 1); }
/* 날짜에 n일 더하기 (현지 자정 기준 새 Date) */
function addDays(d, n) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
/* n개월 전 같은 날. 그 달에 그 날짜가 없으면 말일 (3월 31일의 한 달 전 = 2월 28일) */
function monthsAgo(n, from) {
    const f = from || new Date();
    const d = new Date(f.getFullYear(), f.getMonth() - n, 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(f.getDate(), last));
    return d;
}

/* ═══════════════════════════════════════
   공용 도구
═══════════════════════════════════════ */
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
/* 사용자가 쓴 글(일기·이름)을 innerHTML에 넣을 때는 반드시 거친다 */
function escHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
