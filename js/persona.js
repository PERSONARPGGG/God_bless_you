/* 밤의 목장 — js/persona.js : 체험 페르소나 데이터
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   체험 페르소나 데이터
═══════════════════════════════════════ */
const PERSONA_DATA = {
    male: [
        {date:'2026-06-28',emotion:'감사',topic:'모름',need:'위로',emoji:'😊',diary:'주일 예배 마치고 한 주를 정리했다. 바쁜 와중에도 여기 올 수 있어 감사하다.'},
        {date:'2026-06-29',emotion:'걱정',topic:'일', need:'지혜',emoji:'😔',diary:'내일 중요한 발표가 있다. 마음이 무거운데 말씀 하나가 붙잡혔다.'},
        {date:'2026-06-30',emotion:'지침',topic:'일', need:'쉼',  emoji:'😞',diary:'오늘도 야근. 몸이 한계다. 퇴근길 말씀이 유일한 위로였다.'},
        {date:'2026-07-01',emotion:'지침',topic:'일', need:'쉼',  emoji:'😞',diary:'정말 지쳤다. 회사 일이 너무 많아. 주님, 이 지침에도 뜻이 있겠지요.'},
        {date:'2026-07-02',emotion:'걱정',topic:'사람',need:'지혜',emoji:'😔',diary:'팀장과의 관계가 영 불편하다. 어떻게 해야 할지 기도했다.'},
        {date:'2026-07-03',emotion:'평안',topic:'모름',need:'쉼',  emoji:'😌',diary:'금요일, 드디어 주말이다. 마음이 한결 가벼워졌다.'},
        {date:'2026-07-04',emotion:'감사',topic:'모름',need:'위로',emoji:'😊',diary:'주말에 잘 쉬었다. 이 쉼도 하나님의 선물임을 안다.'},
    ],
    female: [
        {date:'2026-06-28',emotion:'아픔', topic:'가족',need:'위로',emoji:'😢',diary:'남편과 다퉜다. 마음이 많이 무겁다. 그냥 주님 앞에 다 내려놓는다.'},
        {date:'2026-06-29',emotion:'감사', topic:'모름',need:'위로',emoji:'😊',diary:'출근길에 예쁜 꽃을 봤다. 작은 것에서도 감사를 찾으려 했다.'},
        {date:'2026-06-30',emotion:'걱정', topic:'사람',need:'지혜',emoji:'😔',diary:'직장 동료와의 관계가 불편하다. 지혜롭게 대처할 수 있기를.'},
        {date:'2026-07-01',emotion:'평안', topic:'모름',need:'쉼',  emoji:'😌',diary:'퇴근 후 좋아하는 카페에 잠깐 앉아있었다. 이 작은 쉼이 감사하다.'},
        {date:'2026-07-02',emotion:'감사', topic:'가족',need:'위로',emoji:'😊',diary:'아이가 오늘 처음으로 "사랑해요"를 했다. 눈물이 났다. 감사하다.'},
        {date:'2026-07-03',emotion:'아픔', topic:'사람',need:'위로',emoji:'😢',diary:'친한 친구와 오해가 생겼다. 상처받은 마음을 주님께 가져간다.'},
        {date:'2026-07-04',emotion:'감사', topic:'모름',need:'위로',emoji:'😊',diary:'주말 아침 가족과 함께 산책. 이 순간이 정말 감사하다.'},
    ],
    housewife: [
        {date:'2026-06-28',emotion:'감사',topic:'가족',need:'위로',emoji:'😊',diary:'온 가족이 예배 드리고 함께 밥을 먹었다. 이게 행복이다.'},
        {date:'2026-06-29',emotion:'평안',topic:'가족',need:'쉼',  emoji:'😌',diary:'집안일을 하면서 찬양을 불렀다. 마음이 참 평안했다.'},
        {date:'2026-06-30',emotion:'감사',topic:'가족',need:'위로',emoji:'😊',diary:'아이들이 건강하게 잘 있어줘서 감사하다. 일상의 감사.'},
        {date:'2026-07-01',emotion:'걱정',topic:'가족',need:'지혜',emoji:'😔',diary:'큰 아이 성적이 걱정된다. 하나님이 이끌어주시길.'},
        {date:'2026-07-02',emotion:'평안',topic:'모름',need:'쉼',  emoji:'😌',diary:'날씨 좋은 날 빨래를 널면서 감사했다. 소소하지만 예쁜 하루.'},
        {date:'2026-07-03',emotion:'감사',topic:'가족',need:'위로',emoji:'😊',diary:'남편이 수고한다고 칭찬해줬다. 알아주는 사람이 있어 감사하다.'},
        {date:'2026-07-04',emotion:'기도', topic:'가족',need:'힘',  emoji:'🙏',diary:'가족 모두를 위해 길게 기도했다. 이 가정을 지켜달라고.'},
    ],
    pastor: [
        {date:'2026-06-28',emotion:'기도', topic:'사람',need:'힘',  emoji:'🙏',diary:'오늘 예배에서 성령이 임하셨다. 성도들의 눈물이 내 눈물이었다.'},
        {date:'2026-06-29',emotion:'기도', topic:'일', need:'지혜',emoji:'🙏',diary:'소그룹 갈등 문제로 기도했다. 주님, 이 공동체를 하나 되게 하소서.'},
        {date:'2026-06-30',emotion:'지침', topic:'일', need:'쉼',  emoji:'😞',diary:'사역이 많아 몸이 피곤하다. 그래도 이 일이 귀한 줄 안다.'},
        {date:'2026-07-01',emotion:'기도', topic:'사람',need:'힘',  emoji:'🙏',diary:'아픈 성도를 심방했다. 그 분의 믿음에 내가 오히려 위로받았다.'},
        {date:'2026-07-02',emotion:'기도', topic:'사람',need:'위로',emoji:'🙏',diary:'상담하면서 함께 울었다. 그 눈물이 기도가 되었다.'},
        {date:'2026-07-03',emotion:'평안', topic:'모름',need:'쉼',  emoji:'😌',diary:'기도실에서 혼자 조용히 있었다. 주님과 단둘이 있는 시간.'},
        {date:'2026-07-04',emotion:'감사', topic:'모름',need:'위로',emoji:'😊',diary:'하나님의 은혜로 이 한 주도 마쳤다. 성도들에게 감사하다.'},
    ],
    foreigner: [
        {date:'2026-06-28',emotion:'아픔', topic:'가족',need:'위로',emoji:'😢',diary:'고향이 그립다. 가족과 함께 예배드리고 싶다. 주님이 아신다.'},
        {date:'2026-06-29',emotion:'기도', topic:'모름',need:'힘',  emoji:'🙏',diary:'낯선 언어, 낯선 문화. 적응이 쉽지 않다. 힘을 주세요, 주님.'},
        {date:'2026-06-30',emotion:'평안', topic:'모름',need:'쉼',  emoji:'😌',diary:'한국 교회에서 따뜻한 인사를 받았다. 언어가 달라도 사랑은 통했다.'},
        {date:'2026-07-01',emotion:'감사', topic:'사람',need:'위로',emoji:'😊',diary:'교회 집사님이 밥을 해주셨다. 이런 사랑이 복음이구나.'},
        {date:'2026-07-02',emotion:'걱정', topic:'일', need:'지혜',emoji:'😔',diary:'비자 문제가 생겼다. 하나님이 길을 열어주실 것을 믿는다.'},
        {date:'2026-07-03',emotion:'기도', topic:'가족',need:'위로',emoji:'🙏',diary:'고향 가족에게 전화했다. 이 말씀을 함께 나누고 싶다.'},
        {date:'2026-07-04',emotion:'평안', topic:'모름',need:'쉼',  emoji:'😌',diary:'주일 예배 후 귀가길, 마음이 평안하다. 낯선 땅에도 하나님이 계신다.'},
    ],
};

let _activePersonaData = null;
function loadPersona(type, btn) {
    const data = PERSONA_DATA[type];
    if (!data) return;
    _activePersonaData = data;
    renderDashboard(data);
    document.querySelectorAll('.persona-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const names = {male:'직장인 준호',female:'워킹맘 수진',housewife:'주부 은혜',pastor:'김요한 목사',foreigner:'유학생 안나'};
    toast(`✦ ${names[type]||type} 체험 데이터`);
}

/* 데모 데이터 주입 (실제 데이터 있으면 건너뜀) */
function injectDemoData() {
    const existing = lsGet('moodHistory') || [];
    if (existing.length > 0) return;
    const { startStr } = getWeekRange();
    const weekStart = new Date(startStr + 'T21:00:00');
    const allDays = [
        { dow:0, emotion:'감사', topic:'가족',  need:'위로', diary:'주일 예배 후 가족과 함께한 점심이 따뜻했다. 이런 일상이 은혜다.' },
        { dow:1, emotion:'걱정', topic:'일',    need:'지혜', diary:'이번 주가 시작됐다. 결정해야 할 일이 많아 막막했지만 말씀으로 마음을 붙잡았다.' },
        { dow:2, emotion:'평안', topic:'모름',  need:'쉼',   diary:'딱히 이유 없이 오늘은 마음이 차분했다. 그냥 이 평안함이 감사했다.' },
        { dow:3, emotion:'기도', topic:'사람',  need:'힘',   diary:'어려운 관계로 마음이 무거웠는데 기도하고 나니 조금 가벼워졌다.' },
        { dow:4, emotion:'지침', topic:'일',    need:'쉼',   diary:'정말 지친 하루. 퇴근길 말씀 한 구절이 유일한 위로였다. 주님, 쉬게 해주세요.' },
        { dow:5, emotion:'아픔', topic:'가족',  need:'위로', diary:'가족 일로 마음이 많이 아팠다. 용서가 먼저라는 걸 알면서도 쉽지 않다.' },
        { dow:6, emotion:'감사', topic:'모름',  need:'위로', diary:'주말 아침, 커피 한 잔과 함께 말씀을 읽었다. 작은 것에도 감사하는 하루.' },
    ];
    // 데모 목적: 이번 주 전체(일~토)에 걸쳐 데이터 삽입 (대시보드 week 필터에 모두 포함)
    const demo = allDays.map(d => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d.dow);
        return { date: date.toISOString().slice(0,10), emotion: d.emotion,
                 topic: d.topic, need: d.need, emoji: E_EMOJI[d.emotion] || '', diary: d.diary };
    });
    // 회고 카드("1년 전 오늘 밤") 시연용 — 목록은 최신순이므로 맨 뒤에 붙임
    const ago = fn => { const x = new Date(); fn(x); return x.toISOString().slice(0,10); };
    demo.push({ date: ago(x => x.setMonth(x.getMonth()-1)), emotion:'감사', topic:'가족', need:'쉼', emoji:E_EMOJI['감사'],
                diary:'아이가 먼저 손을 잡아주었다. 그걸로 충분한 하루.' });
    demo.push({ date: ago(x => x.setFullYear(x.getFullYear()-1)), emotion:'걱정', topic:'일', need:'힘', emoji:E_EMOJI['걱정'],
                diary:'내일 일이 두렵지만, 오늘 밤은 맡겨드리고 잔다.' });
    lsSet('moodHistory', demo);
}

/* ── 주간 범위 계산 (일요일 시작) ── */
function getWeekRange() {
    const now = new Date();
    const sun = new Date(now);
    sun.setDate(now.getDate() - now.getDay());
    sun.setHours(0,0,0,0);
    const sat = new Date(sun);
    sat.setDate(sun.getDate() + 6);
    const fmt = d => d.toISOString().slice(0,10);
    return { startStr: fmt(sun), endStr: fmt(sat) };
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
    const hist = lsGet('moodHistory') || [];
    return hist.filter(m => m.date >= startStr && m.date <= endStr)
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
    const ym = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    const hist = lsGet('moodHistory') || [];
    return hist.filter(m => m.date && m.date.startsWith(ym))
               .sort((a, b) => a.date.localeCompare(b.date));
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
function escHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function exportDiaryPdf() {
    const entries = getMonthEntries();
    if (!entries.length) { toast('이번 달 기록이 아직 없어요'); return; }
    const pd = document.getElementById('print-diary');
    const now = new Date();
    const ymLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    const fmtDate = ds => {
        const d = new Date(ds + 'T12:00:00');
        const dow = ['일','월','화','수','목','금','토'][d.getDay()];
        return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dow})`;
    };
    const entryHtml = entries.map(m => {
        const pool = VERSE_POOL[`${m.emotion}_${m.need}`];
        const verse = pool && pool[0];
        return `<div class="pd-entry">
            <div class="pd-date">${fmtDate(m.date)}</div>
            <div class="pd-emo">${m.emoji || ''} ${escHtml(m.emotion)}</div>
            ${verse ? `<div class="pd-verse">“${verse.v}” <span class="pd-ref">— ${verse.r}</span></div>` : ''}
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
    const start = new Date(startStr + 'T00:00:00');
    el.innerHTML = Array.from({length:7}, (_,i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const ds = d.toISOString().slice(0,10);
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
        return `<div class="db-pattern"><strong>${tl}</strong>
            <strong style="color:${DB_EMO_COLORS[emo]}">${emo}</strong>한 감정이 많았어요
            <span style="float:right;font-size:var(--fs-2xs);opacity:.4">${c}회</span></div>`;
    }).join('');
    const needCnt = {};
    data.forEach(m => { if(m.need) needCnt[m.need] = (needCnt[m.need]||0)+1; });
    const topNeed = Object.entries(needCnt).sort((a,b)=>b[1]-a[1])[0];
    if (topNeed) {
        const nl = DB_NEED_LBL[topNeed[0]] || topNeed[0];
        html += `<div class="db-pattern">이번 주 가장 많이 <strong>${nl}</strong> 하나님 앞에 나왔어요</div>`;
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
            <div class="db-diary-date">${m.date.slice(5).replace('-','/')} · ${m.emotion}</div>
            <div class="db-diary-txt">${m.diary}</div>
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
