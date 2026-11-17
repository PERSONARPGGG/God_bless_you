/* 밤의 목장 — js/pwa.js : 홈 화면 설치 · Service Worker 업데이트
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
   Service Worker 등록 · 새 버전 감지
═══════════════════════════════════════ */
let _swRegistered = false, _updateRequested = false;
function registerSW() {
    if (_swRegistered || !('serviceWorker' in navigator) || location.protocol === 'file:') return;
    _swRegistered = true;
    navigator.serviceWorker.register('sw.js').then(reg => {
        // 페이지 로드 시 즉시 업데이트 확인 (기본 24시간 간격 보완)
        reg.update().catch(() => {});
        reg.addEventListener('updatefound', () => {
            const newSW = reg.installing;
            if (!newSW) return;
            newSW.addEventListener('statechange', () => {
                // 기존 SW 위에 새 SW가 설치 완료된 경우에만 배너 표시
                if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                    const b = document.getElementById('update-banner');
                    if (b) b.classList.remove('hidden');
                }
            });
        });
    }).catch(e => logErr('sw.register', e));
    // 새 버전으로 바뀌면 새로고침 — 단, 이 화면에서 "지금 업데이트"를 눌렀을 때만.
    // (저절로 새로고침하면 쓰고 있던 일기와 결과 화면이 사라진다. 앱 코드는 네트워크 우선이라
    //  누르지 않아도 다음에 열 때 새 버전이 뜬다.)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!_updateRequested || refreshing) return;
        refreshing = true;
        location.reload();
    });
}

/* 스트릭 설치 넛지 */
function checkInstallNudge(streak) {
    if (isStandalone()) return;
    const key = streak === 7 ? 'installNudge7' : streak === 3 ? 'installNudge3' : null;
    if (!key || lsGet(key)) return;
    later('installNudge', () => {
        // 메인 화면을 보고 있을 때만 띄운다 (말씀을 읽는 중이거나 다른 창이 열려 있으면 다음 기회에)
        const s1 = document.getElementById('step1');
        const busy = !s1 || s1.classList.contains('hidden') || !!document.querySelector('.overlay:not(.hidden)');
        if (busy) return;
        lsSet(key, '1');
        showInstallNudge(streak);
    }, 1600);
}
let _nudgeTimer = null;
function showInstallNudge(streak) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const nudge = document.getElementById('install-nudge');
    if (!nudge) return;
    document.getElementById('in-icon').textContent  = streak >= 7 ? '🔥' : '🌟';
    document.getElementById('in-title').textContent = L['install_nudge_'+streak] || (streak+'일 연속 달성!');
    document.getElementById('in-sub').textContent   = L.install_nudge_sub;
    document.getElementById('in-btn-add').textContent  = L.install_nudge_add;
    document.getElementById('in-btn-skip').textContent = L.install_nudge_skip;
    nudge.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => nudge.classList.add('visible')));
    clearTimeout(_nudgeTimer);
    _nudgeTimer = later('nudge.auto', () => dismissNudge(), 12000);
}
function dismissNudge() {
    const nudge = document.getElementById('install-nudge');
    if (!nudge || nudge.classList.contains('hidden')) return;
    clearTimeout(_nudgeTimer);
    nudge.classList.remove('visible');
    setTimeout(() => nudge.classList.add('hidden'), 380);
}
function nudgeInstall() {
    dismissNudge();
    setTimeout(() => triggerInstall(), 420);
}

/* 홈 화면 추가 */
function triggerInstall() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (isStandalone()) { toast(L.already_installed); return; }
    if (isIOS()) { hideOverlay('overlay-settings'); showOverlay('ios-install-guide'); return; }
    if (deferredInstall) {
        deferredInstall.prompt();
        deferredInstall.userChoice.then(r => { if (r.outcome==='accepted') deferredInstall=null; });
    } else {
        toast(L.install_unavailable);
    }
}

/* 수동 업데이트 확인 */
function checkUpdateManual() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') {
        _setUpdateStatus(L.upd_manual);
        _resetUpdateBtn();
        return;
    }
    const btn = document.getElementById('btn-check-update');
    if (btn) { btn.disabled = true; btn.textContent = L.upd_btn_checking; }
    _setUpdateStatus(L.upd_checking);

    navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) { _setUpdateStatus(L.upd_no_sw); _resetUpdateBtn(); return; }
        reg.update().then(() => {
            if (reg.waiting) {
                _setUpdateStatus(L.upd_ready_msg);
                if (btn) { btn.disabled = false; btn.textContent = L.upd_btn_apply; btn.onclick = () => { applyUpdate(); hideOverlay('overlay-settings'); }; }
                document.getElementById('update-banner').classList.remove('hidden');
            } else {
                _setUpdateStatus(L.upd_latest_v);
                _resetUpdateBtn();
            }
        }).catch(() => { _setUpdateStatus(L.upd_fail); _resetUpdateBtn(); });
    });
}

function _setUpdateStatus(msg) {
    const el = document.getElementById('update-status-text');
    if (el) el.textContent = msg;
}
function _resetUpdateBtn() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const btn = document.getElementById('btn-check-update');
    if (btn) { btn.disabled = false; btn.textContent = L.upd_btn; btn.onclick = checkUpdateManual; }
}

/* 업데이트 배너 → 새 SW 활성화 요청 */
function applyUpdate() {
    document.getElementById('update-banner').classList.add('hidden');
    _updateRequested = true;
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg && reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
        }).catch(()=>{});
    }
}
