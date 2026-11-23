/* 밤의 목장 — js/reflect.js : 회고 카드("N 전 오늘 밤") · 돌봄 안내 · 언어 변경 시 v2.7 화면 갱신 · 접근성(대화상자 역할·Esc)
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) — 문구는 care.js의 V27_TEXT 를 씀 */

/* ── 회고 카드: "N 전 오늘 밤" ──
   한 달 전 기록은 누구에게나, 3개월 이상 지난 기록은 프리미엄에게 보여준다 (평생 보관의 가치를 체감시키는 지점).
   기기에는 최근 30건만 남으므로 오래된 기록은 로그인 사용자의 서버 기록에서 찾는다. */
function otdTargets() {
    return [
        { key:'otd_y1', premium:true,  date: ymd(monthsAgo(12)) },
        { key:'otd_m6', premium:true,  date: ymd(monthsAgo(6)) },
        { key:'otd_m3', premium:true,  date: ymd(monthsAgo(3)) },
        { key:'otd_m1', premium:false, date: ymd(monthsAgo(1)) },
    ];
}
let _otdSeq = 0;
/* "한 달 전 오늘 밤" 회고 카드 (무료 3개월 이내, 프리미엄은 더 오래) */
async function renderOnThisDay() {
    const el = document.getElementById('otd-card');
    if (!el) return;
    const seq = ++_otdSeq;
    const hide = () => { el.classList.add('hidden'); el.innerHTML = ''; };
    if (lsGet('otdDismissed') === todayStr()) { hide(); return; }
    const targets = otdTargets();
    const byDate = {};
    getMoods().forEach(h => { if (!(h.date in byDate)) byDate[h.date] = h; });
    if (sbUser && sb) {
        try {
            const { data } = await sb.from('mood_history').select('date,emotion,topic,need,diary_text')
                .eq('user_id', sbUser.id).in('date', targets.map(t => t.date));
            if (seq !== _otdSeq) return; // 더 최근 호출이 있으면 그 결과에 맡김
            (data || []).forEach(r => {
                const cur = byDate[r.date];
                if (!cur || (!cur.diary && r.diary_text)) byDate[r.date] = { date:r.date, emotion:r.emotion, topic:r.topic, need:r.need, diary:r.diary_text };
            });
        } catch (e) {}
    }
    const t = targets.find(x => byDate[x.date]);
    if (!t) { hide(); return; }
    const h = byDate[t.date];
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const dateTxt = parseYmd(h.date).toLocaleDateString(L.locale||'ko-KR', { year:'numeric', month:'long', day:'numeric' });
    const head = `<button type="button" class="otd-close" onclick="dismissOnThisDay()" aria-label="${escHtml(L.otd_close)}">✕</button>
        <div class="otd-label">${escHtml(L[t.key])}</div>`;
    if (t.premium && !isPremium()) {
        el.innerHTML = head + `<div class="otd-meta">${escHtml(dateTxt)}</div>
            <div class="otd-msg">${escHtml(L.otd_locked)}</div>
            <button type="button" class="otd-btn" onclick="openPremiumModal()">${escHtml(L.otd_locked_btn)}</button>`;
    } else {
        const meta = [h.emotion && eLabel(h.emotion), h.topic && tLabel(h.topic), h.need && nLabel(h.need)].filter(Boolean).join(' · ');
        el.innerHTML = head + `<div class="otd-meta">${escHtml(dateTxt)} · ${escHtml(meta)}</div>
            ${h.diary ? `<div class="otd-diary">“${diaryHtml(h.diary)}”</div>` : ''}
            <div class="otd-msg">${escHtml(L.otd_msg)}</div>`;
    }
    el.classList.remove('hidden');
}
/* 회고 카드를 오늘은 다시 안 보이게 */
function dismissOnThisDay() {
    lsSet('otdDismissed', todayStr());
    const el = document.getElementById('otd-card');
    if (el) el.classList.add('hidden');
}

/* ── 돌봄 안내 카드: 무거운 마음(걱정·지침·아픔)이 오늘 포함 3일 이상 이어질 때만 ── */
function renderCareCard() {
    const el = document.getElementById('care-card');
    if (!el) return;
    el.classList.add('hidden');
    const run = calcEmotionRun();
    if (!run || run.cat !== 'neg' || run.n < 3) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    document.getElementById('care-title').textContent = L.care_title;
    document.getElementById('care-body').textContent = L.care_body;
    const tel = document.getElementById('care-tel');
    tel.textContent = L.care_tel; tel.setAttribute('href', L.care_href);
    document.getElementById('care-line').textContent = L.care_line;
    el.classList.remove('hidden');
}

/* ── 언어 변경 시 v2.7 UI 갱신 (applyLang 끝에서 호출) ── */
function applyLangV27() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const s = (id,t) => { const el = document.getElementById(id); if (el && t != null) el.textContent = t; };
    s('btn-policy-privacy', L.row_policy); s('btn-policy-terms', L.row_terms); s('btn-policy-standards', L.row_standards); s('policy-back', L.policy_back);
    s('row-logout-btn', L.row_logout_btn);
    s('row-delete-label', L.row_delete); s('row-delete-sub', L.row_delete_sub); s('row-delete-btn', L.row_delete_btn);
    const priv = document.getElementById('privacy-text');
    if (priv) priv.innerHTML = sbUser ? L.privacy_cloud : L.privacy;
    // 아이콘만 있는 버튼의 읽기용 이름
    const label = (sel, t) => document.querySelectorAll(sel).forEach(el => el.setAttribute('aria-label', t));
    label('.ib-close', L.a11y_close);
    label('.icon-btn[onclick="openVault()"]', L.a11y_vault);
    label('.icon-btn[onclick="openSettings()"]', L.a11y_settings);
    label('#btn-dashboard-top', L.a11y_dashboard);
    label('.font-btn[onclick="cycleFont(-1)"]', L.a11y_font_down);
    label('.font-btn[onclick="cycleFont(1)"]', L.a11y_font_up);
    label('#closing-timer', L.a11y_timer);
    if (sel && sel.emotion && !document.getElementById('step4').classList.contains('hidden')) renderCareCard();
    renderOnThisDay();
}

/* ── 접근성: 대화상자 역할, Esc로 닫기, 장식 요소 숨김 ── */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.overlay, #premium-modal, #devpw-modal, #consent-modal, #ai-modal, #sync-modal').forEach(el => {
        el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
        const title = el.querySelector('.overlay-title, .pm-title, .consent-title, .devpw-label');
        if (title) { if (!title.id) title.id = el.id + '-heading'; el.setAttribute('aria-labelledby', title.id); }
    });
    const toastEl = document.getElementById('toast');
    if (toastEl) { toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); }
    document.querySelectorAll('#stars, .aurora, #night-intro .ni-star, .moon-orbital').forEach(el => el.setAttribute('aria-hidden', 'true'));
    const timer = document.getElementById('closing-timer');
    if (timer) {
        timer.setAttribute('role', 'button'); timer.setAttribute('tabindex', '0');
        timer.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); extendClosingTimer(); } });
    }
    // Esc: 가장 위에 떠 있는 창 하나만 닫음 (첫 방문 이름 입력창은 제외 — 닫으면 시작할 방법이 없음)
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        const open = [...document.querySelectorAll('#ai-modal, #sync-modal, #consent-modal, #devpw-modal, #premium-modal, .overlay')]
            .filter(el => !el.classList.contains('hidden') && el.id !== 'overlay-name')
            .sort((a, b) => (parseInt(getComputedStyle(b).zIndex) || 0) - (parseInt(getComputedStyle(a).zIndex) || 0));
        if (open[0]) open[0].classList.add('hidden');
    });
});
