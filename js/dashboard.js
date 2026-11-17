/* 밤의 목장 — js/dashboard.js : 이번 주 나의 이야기(대시보드) · 월간 리포트 · PDF 일기장
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ── 주간 범위 계산 (일요일 시작) ── */
function getWeekRange() {
    const now = new Date();
    const sun = addDays(now, -now.getDay());
    return { startStr: ymd(sun), endStr: ymd(addDays(sun, 6)) };
}

/* ── 대시보드 열기 ── */
async function openDashboard() {
    if (!isDevMode()) { toast('🔒 준비 중인 기능입니다'); return; }
    _activePersonaData = null;
    const data = await getDashboardData();
    renderDashboard(data);
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const lt = document.getElementById('pm-lock-title'), ls = document.getElementById('pm-lock-sub');
    if (lt) lt.textContent = L.pm_lock_title;
    if (ls) ls.textContent = L.pm_lock_sub;
    showOverlay('overlay-dashboard');
}

/* ── 데이터 (Supabase 우선, localStorage 폴백) ── */
async function getDashboardData() {
    const { startStr, endStr } = getWeekRange();
    if (sbUser && sb) {
        try {
            const { data } = await sb.from('mood_history')
                .select('*').eq('user_id', sbUser.id)
                .gte('date', startStr).lte('date', endStr)
                .order('date', { ascending: true });
            if (data && data.length > 0) return data.map(r => ({
                date: r.date, emotion: r.emotion, topic: r.topic,
                need: r.need, diary: r.diary_text, emoji: E_EMOJI[r.emotion]
            }));
        } catch(e) {}
    }
    return getMoods().filter(m => m.date >= startStr && m.date <= endStr)
               .sort((a,b) => a.date.localeCompare(b.date));
}

/* ── 렌더링 ── */
function renderDashboard(data) {
    const { startStr } = getWeekRange();
    renderDbNarrative(data);
    renderDbEmoBars(data);
    renderDbDayFlow(data, startStr);
    renderDbPatterns(data);
    renderDbDiaries(data);
    renderDbMonthly();
    const det = document.getElementById('db-detail');
    const btn = document.getElementById('db-detail-btn');
    if (det) det.classList.add('hidden');
    if (btn) btn.textContent = '상세히 보기 ▾';
}

/* ── 이번 달 기록 (localStorage 기준 — 시연 목적, Supabase 월간 조회는 v3.0 본구현에서) ── */
function getMonthEntries() {
    const ym = todayStr().slice(0, 7); // 'YYYY-MM'
    // 하루에 여러 번 기록했으면 그날의 마지막 기록 하나만 (목록은 최신순이라 먼저 나온 것이 마지막 기록)
    const byDay = new Map();
    getMoods().forEach(m => { if (m.date.startsWith(ym) && !byDay.has(m.date)) byDay.set(m.date, m); });
    return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/* ── 월간 리포트: 프리미엄이면 실데이터, 아니면 블러+자물쇠 ── */
const HEAVY_EMOS = ['걱정', '지침', '아픔'];
function renderDbMonthly() {
    const el = document.getElementById('db-monthly');
    if (!el) return;
    const entries = _activePersonaData || getMonthEntries();
    const cnt = {};
    DB_EMO_LIST.forEach(e => cnt[e] = 0);
    entries.forEach(m => { if (cnt[m.emotion] !== undefined) cnt[m.emotion]++; });
    const total = entries.length;
    const heavy = entries.filter(m => HEAVY_EMOS.includes(m.emotion)).length;
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
    const monthNum = new Date().getMonth() + 1;

    /* 돌보심의 기록 — 숫자가 아니라 문장으로 */
    const lines = [];
    if (!total) {
        lines.push(`${monthNum}월의 기록이 아직 없어요. 오늘 밤부터 시작해보세요 ✦`);
    } else {
        lines.push(`${monthNum}월, <b>${total}일 밤</b>을 목장에서 보내셨어요.`);
        if (heavy > 0) lines.push(`마음이 무거웠던 <b>${heavy}일</b>에도, 매일 말씀이 함께했어요.`);
        if (top && top[1] > 0) lines.push(`가장 자주 머문 마음은 <b>‘${top[0]}’</b>(${top[1]}일)이었어요.`);
    }
    const bodyHtml = `<div class="db-month-body">
        ${lines.map(l => `<div class="db-month-line">${l}</div>`).join('')}
    </div>`;

    if (isPremium()) {
        el.innerHTML = `<div class="db-month-wrap">${bodyHtml}</div>
            <button class="db-pdf-btn" type="button" onclick="exportDiaryPdf()">📄 PDF로 내보내기 — 나의 신앙 일기장</button>`;
    } else {
        el.innerHTML = `<div class="db-month-wrap locked">${bodyHtml}
            <button class="db-month-lock" type="button" onclick="openPremiumModal()">
                <span class="lk-ic">🔒</span>
                <span class="lk-tx"><b>월간 리포트 &amp; PDF 일기장</b><br>프리미엄에서 만나요 · ₩1,900/월</span>
            </button>
        </div>`;
    }
}

/* ── PDF 내보내기: 이번 달 기록 → 인쇄 다이얼로그 (PDF로 저장) ── */
function exportDiaryPdf() {
    const entries = getMonthEntries();
    if (!entries.length) { toast('이번 달 기록이 아직 없어요'); return; }
    const pd = document.getElementById('print-diary');
    const now = new Date();
    const ymLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    const fmtDate = ds => {
        const d = parseYmd(ds);
        const dow = ['일','월','화','수','목','금','토'][d.getDay()];
        return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dow})`;
    };
    const entryHtml = entries.map(m => {
        const pool = VERSE_POOL[`${m.emotion}_${m.need}`];
        const verse = pool && pool[0];
        return `<div class="pd-entry">
            <div class="pd-date">${fmtDate(m.date)}</div>
            <div class="pd-emo">${m.emoji || ''} ${escHtml(m.emotion)}</div>
            ${verse ? `<div class="pd-verse">“${escHtml(verse.v)}” <span class="pd-ref">— ${escHtml(verse.r)}</span></div>` : ''}
            ${m.diary ? `<div class="pd-diary">${escHtml(m.diary)}</div>` : ''}
        </div>`;
    }).join('');
    pd.innerHTML = `
        <div class="pd-cover">
            <div class="pd-moon">🌙</div>
            <h1>나의 신앙 일기장</h1>
            <div class="pd-sub">밤 의 목 장</div>
            <div class="pd-range">${ymLabel} · ${entries.length}일의 기록</div>
        </div>
        ${entryHtml}
        <div class="pd-foot">🐑 밤의 목장 — 오늘 밤, 주님이 누이시는 곳</div>`;
    window.print();
}

/* 서사 카드 */
const DB_NARRATIVES = {
    감사: { main:'이번 주, 감사가 넘쳤던 한 주를 보냈군요 🙏', sub:'감사한 마음이 하나님께 닿았을 거예요.' },
    평안: { main:'이번 주, 마음이 평안했군요 🍃', sub:'하나님의 평안이 함께했던 한 주예요.' },
    걱정: { main:'이번 주, 걱정이 마음에 있었군요 💙', sub:'그래도 여기 오셨네요. 그것만으로 충분해요.' },
    지침: { main:'이번 주, 많이 지치셨군요 🌙', sub:'정말 수고하셨어요. 오늘 밤은 푹 쉬세요.' },
    아픔: { main:'이번 주, 마음이 많이 아팠군요 🌷', sub:'그 아픔도 하나님이 아세요. 혼자가 아니에요.' },
    기도: { main:'이번 주, 기도로 하루를 마쳤네요 ✨', sub:'하나님이 그 기도를 들으셨어요.' }
};
function renderDbNarrative(data) {
    const el = document.getElementById('db-narrative');
    if (!el) return;
    const { startStr, endStr } = getWeekRange();
    const wl = `${startStr.slice(5).replace('-','/')}(일) ~ ${endStr.slice(5).replace('-','/')}(토)`;
    if (!data.length) {
        el.innerHTML = `<div class="db-narrative-week">${wl}</div>
            <div class="db-narrative-main">이번 주 아직 기록이 없어요</div>
            <div class="db-narrative-sub">오늘 하루를 남겨보세요 ✦</div>`;
        return;
    }
    const cnt = {};
    data.forEach(m => { cnt[m.emotion] = (cnt[m.emotion]||0)+1; });
    const top = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];
    const n = DB_NARRATIVES[top] || { main:'이번 주를 함께해주셨어요', sub:'하나님이 함께하셨어요.' };
    el.innerHTML = `<div class="db-narrative-week">${wl}</div>
        <div class="db-narrative-main">${n.main}</div>
        <div class="db-narrative-sub">${n.sub}</div>`;
}

/* 감정 바 */
const DB_EMO_COLORS = {감사:'#f59e0b',평안:'#10b981',걱정:'#6366f1',지침:'#8b5cf6',아픔:'#ef4444',기도:'#3b82f6'};
const DB_EMO_LIST = ['감사','평안','걱정','지침','아픔','기도'];
function renderDbEmoBars(data) {
    const el = document.getElementById('db-emo-bars');
    if (!el) return;
    const cnt = {};
    DB_EMO_LIST.forEach(e => cnt[e] = 0);
    data.forEach(m => { if (cnt[m.emotion] !== undefined) cnt[m.emotion]++; });
    const max = Math.max(...Object.values(cnt), 1);
    // 먼저 width:0 으로 렌더링 후 transition으로 늘어남
    el.innerHTML = DB_EMO_LIST.map((e, i) => {
        const c = cnt[e], pct = Math.round(c/max*100), col = DB_EMO_COLORS[e];
        return `<div class="db-emo-row">
            <span class="db-emo-lbl">${e}</span>
            <div class="db-emo-track">
                <div class="db-emo-fill" data-pct="${pct}" style="width:0;background:linear-gradient(90deg,${col},${col}99);">
                    ${c > 0 ? `<span class="db-emo-cnt">${c}회</span>` : ''}
                </div>
                ${c === 0 ? '<span class="db-emo-zero">-</span>' : ''}
            </div>
        </div>`;
    }).join('');
    // 한 프레임 후 실제 너비로 transition
    requestAnimationFrame(() => {
        el.querySelectorAll('.db-emo-fill[data-pct]').forEach((bar, i) => {
            setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, i * 90);
        });
    });
}

/* 요일별 흐름 */
const DB_DAY_NAMES = ['일','월','화','수','목','금','토'];
const DB_EMO_EMOJI = {감사:'🙏',평안:'😌',걱정:'😔',지침:'😞',아픔:'😢',기도:'✨'};
function renderDbDayFlow(data, startStr) {
    const el = document.getElementById('db-day-flow');
    if (!el) return;
    const byDate = {};
    data.forEach(m => { byDate[m.date] = m; });
    const today = todayStr();
    const start = parseYmd(startStr);
    el.innerHTML = Array.from({length:7}, (_,i) => {
        const ds = ymd(addDays(start, i));
        const m = byDate[ds];
        const isToday = ds === today;
        const col = m ? DB_EMO_COLORS[m.emotion] : '';
        const emoji = m ? (DB_EMO_EMOJI[m.emotion]||'·') : '';
        return `<div class="db-day-col${isToday?' db-day-today':''}">
            <div class="db-day-dot${m?'':' empty'}"
                style="${m?`background:${col}22;border:2px solid ${col};`:''}">${emoji}</div>
            <div class="db-day-name">${DB_DAY_NAMES[i]}</div>
        </div>`;
    }).join('');
}

/* 패턴 인사이트 */
const DB_TOPIC_LBL = {일:'일할 때',가족:'가족과 함께일 때',공부:'공부할 때',사람:'사람들과 있을 때',모름:'무언가 있었을 때'};
const DB_NEED_LBL = {위로:'위로가 필요했고',힘:'힘이 필요했고',지혜:'지혜가 필요했고',쉼:'쉬고 싶었고'};
function renderDbPatterns(data) {
    const el = document.getElementById('db-patterns');
    if (!el) return;
    if (!data.length) { el.innerHTML = '<div class="db-empty">기록이 쌓이면 패턴을 보여드려요</div>'; return; }
    const combos = {};
    data.forEach(m => {
        if (!m.topic || !m.emotion) return;
        const k = m.topic + '|' + m.emotion;
        combos[k] = (combos[k]||0) + 1;
    });
    const sorted = Object.entries(combos).sort((a,b)=>b[1]-a[1]).slice(0,2);
    let html = sorted.map(([k, c]) => {
        const [topic, emo] = k.split('|');
        const tl = DB_TOPIC_LBL[topic] || topic;
        return `<div class="db-pattern"><strong>${escHtml(tl)}</strong>
            <strong style="color:${DB_EMO_COLORS[emo] || 'inherit'}">${escHtml(emo)}</strong>한 감정이 많았어요
            <span style="float:right;font-size:var(--fs-2xs);opacity:.4">${c}회</span></div>`;
    }).join('');
    const needCnt = {};
    data.forEach(m => { if(m.need) needCnt[m.need] = (needCnt[m.need]||0)+1; });
    const topNeed = Object.entries(needCnt).sort((a,b)=>b[1]-a[1])[0];
    if (topNeed) {
        const nl = DB_NEED_LBL[topNeed[0]] || topNeed[0];
        html += `<div class="db-pattern">이번 주 가장 많이 <strong>${escHtml(nl)}</strong> 하나님 앞에 나왔어요</div>`;
    }
    el.innerHTML = html || '<div class="db-empty">패턴 분석을 위해 더 많은 기록이 필요해요</div>';
}

/* 이번 주 일기 */
function renderDbDiaries(data) {
    const el = document.getElementById('db-diaries');
    if (!el) return;
    const withDiary = data.filter(m => m.diary).slice().reverse();
    if (!withDiary.length) {
        el.innerHTML = '<div class="db-empty">이번 주 일기가 없어요<br>오늘 한 줄 남겨보세요 ✦</div>';
        return;
    }
    el.innerHTML = withDiary.map(m => {
        const col = DB_EMO_COLORS[m.emotion] || 'rgba(255,255,255,.2)';
        return `<div class="db-diary-item" style="border-left-color:${col}">
            <div class="db-diary-date">${escHtml(m.date.slice(5).replace('-','/'))} · ${escHtml(m.emotion)}</div>
            <div class="db-diary-txt">${escHtml(m.diary)}</div>
        </div>`;
    }).join('');
}

/* 상세 토글 */
function toggleDbDetail() {
    const det = document.getElementById('db-detail');
    const btn = document.getElementById('db-detail-btn');
    if (!det) return;
    const open = !det.classList.contains('hidden');
    det.classList.toggle('hidden', open);
    if (btn) btn.textContent = open ? '상세히 보기 ▾' : '간략히 보기 ▴';
}
