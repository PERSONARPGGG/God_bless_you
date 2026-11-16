/* 밤의 목장 — js/core.js : PWA 설치 프롬프트 · 전역 상태 · lsGet/lsSet
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   PWA 설치 프롬프트
═══════════════════════════════════════ */
let deferredInstall = null;

window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e;
    scheduleInstallBanner();
});

window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('hidden');
});

function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
    return window.navigator.standalone === true ||
           window.matchMedia('(display-mode: standalone)').matches;
}

function scheduleInstallBanner() {
    if (isStandalone()) return;
    const ts = lsGet('installDismissed');
    if (ts && (Date.now() - Number(ts)) < 7 * 24 * 60 * 60 * 1000) return;
    setTimeout(() => {
        const banner = document.getElementById('install-banner');
        if (banner) banner.classList.remove('hidden');
    }, 2500);
}

function doInstall() {
    if (deferredInstall) {
        deferredInstall.prompt();
        deferredInstall.userChoice.then(result => {
            if (result.outcome === 'accepted') toast('홈 화면에 추가되었습니다 🎉');
            deferredInstall = null;
        });
        dismissInstall();
    } else {
        dismissInstall();
        showOverlay('ios-install-guide');
    }
}

function dismissInstall() {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('hidden');
    lsSet('installDismissed', Date.now());
}

/* ═══════════════════════════════════════
   상태
═══════════════════════════════════════ */
const APP_VERSION = '2.7';
const SHARE_URL = 'https://god-bless-you.vercel.app/';
const SUPABASE_URL = 'https://pzakpaomnmahcugkzdff.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nyWe0_C6prKvfP9R9EMXdA_DgH6bfwf';
let sb = null;
let sbUser = null;

let sel = { emotion:null, topic:null, need:null };
let curVerse = null;
let verseSaved = false;
let fontLevel = 0;

/* 결과화면 마무리(클로징) 상태 */
const CLOSING_TIMEOUT = 300;   // 5분
const CLOSING_WARN_AT = 30;    // 마지막 30초 경고
let closingTriggered = false;
let closingTimerId = null;
let closingCountdown = CLOSING_TIMEOUT;
let closingWarned = false;

const rand = arr => arr[Math.floor(Math.random() * arr.length)];
function getTimeSlot() {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return 'morning';
    if (h >= 21 || h < 5) return 'night';
    return 'day';
}


/* 중복 방지 말씀 선택 */
function getVerseForMood(emotion, need) {
    const key = `${emotion}_${need}`;
    const pool = VERSE_POOL[key] || [];
    if (!pool.length) return { v: '', r: '' };
    if (pool.length === 1) return pool[0];

    const storeKey = `shownV_${key}`;
    let shown = lsGet(storeKey) || [];

    const allIdx = pool.map((_, i) => i);
    let avail = allIdx.filter(i => !shown.includes(i));

    // 전부 다 봤으면 절반 리셋
    if (!avail.length) {
        shown = shown.slice(-Math.floor(pool.length / 2));
        avail = allIdx.filter(i => !shown.includes(i));
        lsSet(storeKey, shown);
    }

    const picked = avail[Math.floor(Math.random() * avail.length)];
    lsSet(storeKey, [...shown, picked]);
    if (appLang==='en' && VERSE_POOL_EN[key]) return VERSE_POOL_EN[key][picked] || pool[picked];
    return pool[picked];
}
const todayStr = () => new Date().toISOString().slice(0,10);

/* ── localStorage 헬퍼 ── */
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return localStorage.getItem(k); } }
function lsSet(k,v) { try { localStorage.setItem(k, typeof v==='object' ? JSON.stringify(v) : String(v)); } catch {} }
