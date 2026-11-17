/* 밤의 목장 — js/core.js : 전역 상태 · 오류 격리(safe) · 저장소 · 날짜 · 공용 도구
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다)
   다른 모든 파일이 여기 것을 씁니다. 여기에는 화면(DOM)을 건드리는 코드를 넣지 않습니다. */

/* ═══════════════════════════════════════
   상태
═══════════════════════════════════════ */
const APP_VERSION = '2.8';
const SHARE_URL = 'https://god-bless-you.vercel.app/';
const SUPABASE_URL = 'https://pzakpaomnmahcugkzdff.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nyWe0_C6prKvfP9R9EMXdA_DgH6bfwf';
let sb = null;
let sbUser = null;

let sel = { emotion:null, topic:null, need:null };
let curVerse = null;
let verseSaved = false;
let curMoodRowId = null;   // 방금 서버에 넣은 감정 기록의 id (일기를 그 줄에만 붙이기 위함)
let fontLevel = 0;

/* 결과화면 마무리(클로징) 상태 */
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
function lsSet(k,v) { try { localStorage.setItem(k, typeof v==='object' ? JSON.stringify(v) : String(v)); } catch {} }
function lsArr(k) { const v = lsGet(k); return Array.isArray(v) ? v : []; }
/* 정수 설정값: 숫자가 아니거나 범위를 벗어나면 기본값 */
function lsInt(k, min, max, dflt) {
    const n = parseInt(lsGet(k), 10);
    return Number.isFinite(n) && n >= min && n <= max ? n : dflt;
}

const isYmd = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const LOCAL_KEEP_DAYS = 62;   // 기기에 남기는 감정 기록·방문일 기간 (이번 달 리포트와 "한 달 전 오늘 밤"에 필요한 만큼)

/* 감정 기록 — 최신순 [{date:'YYYY-MM-DD', emotion, topic, need, emoji, diary?}] */
function getMoods()  { return lsArr('moodHistory').filter(h => h && typeof h === 'object' && isYmd(h.date) && h.emotion); }
/* 즐겨찾기 말씀 — 최신순 [{verse, ref, emotion?, need?, savedAt?, date?, context?}] */
function getSaved()  { return lsArr('savedVerses').filter(v => v && typeof v === 'object' && v.verse); }
/* 방문일 ['YYYY-MM-DD', …] (중복 없음) */
function getVisits() { return [...new Set(lsArr('visitDates').filter(isYmd))]; }
/* 기기 보관 기간이 지난 기록을 덜어 낸 목록 */
function trimMoods(list) { const cut = ymd(addDays(new Date(), -LOCAL_KEEP_DAYS)); return list.filter(h => h.date >= cut); }

/* ═══════════════════════════════════════
   날짜 — 전부 "이 기기의 현지 날짜" 기준
   toISOString()은 UTC라서 한국에서는 자정~오전 9시에 어제 날짜가 나온다. 쓰지 말 것.
═══════════════════════════════════════ */
function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function todayStr() { return ymd(new Date()); }
/* 'YYYY-MM-DD' → 현지 자정의 Date (new Date('YYYY-MM-DD')는 UTC 자정이라 서쪽 시간대에서 전날이 됨) */
function parseYmd(s) { const p = String(s).split('-').map(Number); return new Date(p[0], (p[1] || 1) - 1, p[2] || 1); }
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
