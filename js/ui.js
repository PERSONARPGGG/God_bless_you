/* 밤의 목장 — js/ui.js : 설정 · 언어/테마 · 내보내기/초기화 · 오버레이 · 토스트 · 다시 시작 · 마무리(클로징)
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   설정
═══════════════════════════════════════ */
function openSettings() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const name = lsGet('userName');
    document.getElementById('current-name-display').textContent = name ? `${L.name_prefix}${name}` : L.name_none;
    applyFont(fontLevel);
    // 언어 버튼 active 동기화
    ['lo-ko','lo-en','lo-ja'].forEach(id => {
        const lang = id.replace('lo-','');
        document.getElementById(id).classList.toggle('active', lang === appLang);
    });
    // 테마 버튼 active 동기화 (저장값이 아니라 지금 화면에 적용된 테마 기준)
    markActiveTheme(currentTheme());
    updateThemeLocks();
    // 전체화면 버튼 상태 동기화
    const L2 = LANG_DATA[appLang]||LANG_DATA.ko;
    const fbtn = document.getElementById('btn-fullscreen');
    if (fbtn) fbtn.textContent = document.fullscreenElement ? L2.fullscreen_off : L2.fullscreen_on;
    // 설치 버튼 상태 동기화
    const instBtn = document.getElementById('btn-install');
    if (instBtn) {
        if (isStandalone()) { instBtn.textContent = L2.already_installed; instBtn.disabled = true; }
        else { instBtn.textContent = L2.row_install_btn; instBtn.disabled = false; }
    }
    // 업데이트 상태 초기화
    const btn = document.getElementById('btn-check-update');
    if (btn) { btn.disabled = false; btn.textContent = L.upd_btn; btn.onclick = checkUpdateManual; }
    // 대기 중인 SW 상태 표시 (http/https 환경에서만)
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg && reg.waiting) {
                _setUpdateStatus(L.upd_ready);
                if (btn) { btn.textContent = L.upd_btn_apply; btn.onclick = () => { applyUpdate(); hideOverlay('overlay-settings'); }; }
            } else {
                _setUpdateStatus(L.upd_latest);
            }
        }).catch(()=>{ _setUpdateStatus(L.upd_click); });
    } else {
        _setUpdateStatus(location.protocol === 'file:' ? L.upd_file : L.upd_click);
    }
    showOverlay('overlay-settings');
}

/* 언어 변경 */
function setLang(lang) {
    if (!LANG_DATA[lang] || !langEnabled(lang)) return;   // 닫혀 있는 언어는 선택되지 않음 (core.js ENABLED_LANGS)
    appLang = lang;
    lsSet('appLang', lang);
    applyLang(lang);
    ['lo-ko','lo-en','lo-ja'].forEach(id => {
        document.getElementById(id).classList.toggle('active', id.replace('lo-','') === lang);
    });
    toast({ ko:'언어가 변경되었습니다', en:'Language changed', ja:'言語を変更しました' }[lang] || '');
}

/* 배경 테마 — 밤하늘(night)만 무료, 나머지 4종은 프리미엄 */
const THEMES = ['night', 'dawn', 'forest', 'ocean', 'ember'];
const PREMIUM_THEMES = ['dawn', 'forest', 'ocean', 'ember'];
function applyTheme(theme) {
    THEMES.forEach(t => document.body.classList.toggle('theme-' + t, t === theme && t !== 'night'));
}
function currentTheme() { return THEMES.find(t => document.body.classList.contains('theme-' + t)) || 'night'; }
function markActiveTheme(theme) {
    THEMES.forEach(t => { const b = document.getElementById('th-' + t); if (b) b.classList.toggle('active', t === theme); });
}
/* 저장된 테마를 화면에 적용. 프리미엄 테마인데 지금 자격이 없으면 화면만 기본으로 돌린다
   (저장값은 그대로 두어, 자격이 확인되면 다시 그 테마로 돌아옴).
   앱 시작·자격 확인 직후·체험 토글 때 호출 */
function restoreTheme() {
    let t = lsGet('appTheme');
    if (!THEMES.includes(t)) t = 'night';
    if (PREMIUM_THEMES.includes(t) && !isPremium()) t = 'night';
    applyTheme(t);
    markActiveTheme(t);
    updateThemeLocks();
}
function setTheme(theme) {
    if (!THEMES.includes(theme)) return;
    if (PREMIUM_THEMES.includes(theme) && !isPremium()) {
        openPremiumModal();
        return;
    }
    applyTheme(theme);
    lsSet('appTheme', theme);
    markActiveTheme(theme);
}

/* 프리미엄 테마 잠금 배지 갱신 — 설정 열 때, 프리미엄 체험 토글 시 호출 */
function updateThemeLocks() {
    const premium = isPremium();
    PREMIUM_THEMES.forEach(t => {
        const btn = document.getElementById('th-' + t);
        if (btn) btn.classList.toggle('locked', !premium);
    });
}

/* 전체화면 */
function toggleFullscreen() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (location.protocol === 'file:' || !document.fullscreenEnabled) {
        toast(L.fullscreen_unsupported); return;
    }
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(()=>{});
    } else {
        document.exitFullscreen();
    }
}
document.addEventListener('fullscreenchange', () => {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const btn = document.getElementById('btn-fullscreen');
    if (btn) btn.textContent = document.fullscreenElement ? L.fullscreen_off : L.fullscreen_on;
});

/* 데이터 내보내기 */
function exportData() {
    const hist   = getMoods();
    const saved  = getSaved();
    const lines  = ['=== 밤의 목장 데이터 내보내기 ===',''];

    if (saved.length) {
        lines.push('[ 저장된 말씀 ]');
        saved.forEach(s => {
            lines.push([savedDateText(s), savedContext(s)].filter(Boolean).join(' · '));
            lines.push(`"${s.verse}"`);
            lines.push(`— ${s.ref}`);
            lines.push('');
        });
    }
    if (hist.length) {
        lines.push('[ 감정 기록 · 감사 일기 ]');
        hist.forEach(h => {
            lines.push(`${h.date}  ${h.emoji||''} ${h.emotion||''} · ${h.topic||''} · ${h.need||''}`);
            if (h.diary) lines.push(`    일기: ${h.diary}`);
        });
    }
    const text = lines.join('\n');
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(()=>toast(L.toast_exported))
            .catch(()=>legacyCopy(text));
    } else {
        legacyCopy(text);
    }
}

async function clearData() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!confirm(L.confirm_reset)) return;
    // 서버 삭제가 실패하면 "초기화됐다"고 말하지 않는다 (로컬만 지워지면 다음 로그인 때 기록이 되살아남)
    if (sbUser && sb) {
        try {
            for (const t of ['mood_history','saved_verses','visit_dates']) {
                const { error } = await sb.from(t).delete().eq('user_id', sbUser.id);
                if (error) throw error;
            }
        } catch (e) {
            toast(L.reset_fail);
            return;
        }
    }
    ['savedVerses','moodHistory','visitDates','resumeSel'].forEach(k=>localStorage.removeItem(k));
    safe('reset.render', () => { updateStreak(); renderOnThisDay(); refreshVaultIfOpen(); });
    toast(L.toast_reset);
    hideOverlay('overlay-settings');
}

/* ═══════════════════════════════════════
   오버레이 열기/닫기
═══════════════════════════════════════ */
function showOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    safe('nudge.hide', () => dismissNudge());   // 창이 열리면 설치 안내는 내린다
    el.classList.add('overlay-anim');
    setTimeout(() => el.classList.remove('overlay-anim'), 500);
}
function hideOverlay(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }

/* ═══════════════════════════════════════
   Toast
═══════════════════════════════════════ */
let toastTimer;
function toast(msg) {
    const el=document.getElementById('toast'); if (!el || !msg) return; el.textContent=msg;
    el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>el.classList.remove('show'),2200);
}

/* ═══════════════════════════════════════
   다시 시작
═══════════════════════════════════════ */
function restart() {
    sel={emotion:null,topic:null,need:null}; curVerse=null; verseSaved=false;
    stopClosingTimer();
    document.body.classList.remove('closing-sky');
    document.body.classList.remove('emo-tinted');
    ['btn-vault-closing', 'btn-dashboard'].forEach(id => { const b = document.getElementById(id); if (b) b.classList.add('hidden'); });
    document.getElementById('step4').classList.remove('closing');
    document.querySelectorAll('#step4 .card').forEach(c=>c.classList.remove('closing-collapsed'));
    safe('setWelcome', () => setWelcome());
    safe('renderOnThisDay', () => renderOnThisDay());
    safe('clearResume', () => clearResume());
    go('step4','step1');
}

/* ═══════════════════════════════════════
   결과화면 마무리(클로징)
   트리거 2종: "오늘 묵상 마치기" 버튼 / 5분 무활동 (일기는 이때 자동 저장)
═══════════════════════════════════════ */
function startClosingTimer() {
    closingTriggered = false;
    closingCountdown = CLOSING_TIMEOUT;
    closingWarned = false;
    const el = document.getElementById('closing-timer');
    if (el) el.classList.remove('hidden','warning');
    renderClosingTimer();
    if (closingTimerId) clearInterval(closingTimerId);
    closingTimerId = setInterval(tickClosingTimer, 1000);
}

function stopClosingTimer() {
    if (closingTimerId) { clearInterval(closingTimerId); closingTimerId = null; }
    const el = document.getElementById('closing-timer');
    if (el) el.classList.add('hidden');
}

function resetClosingActivity() {
    if (closingTriggered || !closingTimerId) return;
    closingCountdown = CLOSING_TIMEOUT;
    closingWarned = false;
    const el = document.getElementById('closing-timer');
    if (el) el.classList.remove('warning');
    renderClosingTimer();
}

function tickClosingTimer() {
    closingCountdown--;
    if (closingCountdown <= CLOSING_WARN_AT && !closingWarned) {
        closingWarned = true;
        const el = document.getElementById('closing-timer');
        if (el) el.classList.add('warning');
    }
    renderClosingTimer();
    if (closingCountdown <= 0) triggerClosing();
}

function renderClosingTimer() {
    const el = document.getElementById('closing-timer');
    if (!el || el.classList.contains('hidden')) return;
    const t = Math.max(closingCountdown, 0);
    const timeStr = Math.floor(t/60) + ':' + String(t%60).padStart(2,'0');
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    el.textContent = closingWarned ? `${timeStr} ${L.closing_extend_hint}` : timeStr;
}

function extendClosingTimer() {
    if (closingTriggered || !closingWarned) return;
    resetClosingActivity();
    toast((LANG_DATA[appLang]||LANG_DATA.ko).closing_extended);
}

function triggerClosing() {
    if (closingTriggered) return;
    closingTriggered = true;
    stopClosingTimer();
    safe('autoSaveDiary', () => autoSaveDiary());
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const step4 = document.getElementById('step4');
    step4.classList.add('closing');
    safe('blessingStreak', () => {
        const streak = calcStreak(getVisits());
        const streakEl = document.getElementById('blessing-streak');
        if (streakEl) streakEl.textContent = streak>0 ? `🔥 ${streak}${L.streak_unit}` : '';
    });
    setTimeout(() => {
        document.querySelectorAll('#step4 .card:not(.card-blessing)').forEach(c=>c.classList.add('closing-collapsed'));
    }, 520);
    // 밤하늘 밝아짐 + 별똥별 하나 (마무리 순간 연출)
    document.body.classList.add('closing-sky');
    later('spawnShootingStar', () => spawnShootingStar(), 900);
    const br = document.querySelector('.btn-restart');
    if (br) br.textContent = L.btn_restart;
    // 마무리 후 동선: 보관함 진입 버튼 노출
    const bv = document.getElementById('btn-vault-closing');
    if (bv) { bv.textContent = L.btn_vault_closing; bv.classList.remove('hidden'); }
    const bd = document.getElementById('btn-dashboard');
    if (bd) { bd.textContent = L.db_btn; bd.classList.remove('hidden'); }
}

function onFinishClick() {
    if (!closingTriggered) triggerClosing();
    else restart();
}

/* 결과화면에서의 사용자 활동 → 타이머 리셋 (실질적 자동 연장) */
(function(){
    const onActivity = () => {
        const s4 = document.getElementById('step4');
        if (s4 && !s4.classList.contains('hidden')) resetClosingActivity();
    };
    ['click','input','keydown','touchstart'].forEach(evt => document.addEventListener(evt, onActivity, { passive:true }));
    window.addEventListener('scroll', onActivity, { passive:true });
})();

