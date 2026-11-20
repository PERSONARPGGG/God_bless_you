/* 밤의 목장 — js/dashboard.js : 나의 이야기(이번 주) — 서사 카드 · 감정 막대 · 요일 흐름 · 패턴 · 이번 주 일기
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다)

   누구나(게스트 포함) 볼 수 있는 무료 화면. 같은 오버레이 아래쪽의 달력·월간/연간 리포트·PDF는 js/history.js.
   이번 주 기록은 기기 기록만 본다 (최근 62일은 로그인 때 클라우드와 맞춰져 있으므로 서버를 다시 묻지 않음). */

const DB_TEXT = {
    ko: {
        db_title:'📊 나의 이야기', db_btn:'📊 나의 이야기', db_icon_label:'내 이야기',
        db_sec_emo:'이번 주 감정', db_sec_flow:'요일별 감정 흐름', db_sec_pattern:'이런 때 이런 마음이었어요', db_sec_diary:'이번 주 일기',
        db_more:'상세히 보기 ▾', db_less:'간략히 보기 ▴',
        db_emo:['감사','평안','걱정','지침','아픔','기도'],
        db_when:['일할 때','가족과 함께일 때','공부할 때','사람들과 있을 때','건강을 생각할 때','자녀를 생각할 때','신앙을 생각할 때','무언가 있었을 때'],
        db_needing:['위로가 필요해서','힘이 필요해서','지혜가 필요해서','쉬고 싶어서'],
        db_nar_main:['이번 주, 감사가 넘쳤던 한 주를 보냈군요','이번 주, 마음이 평안했군요','이번 주, 걱정이 마음에 있었군요',
                     '이번 주, 많이 지치셨군요','이번 주, 마음이 많이 아팠군요','이번 주, 기도로 하루를 마쳤네요'],
        db_nar_sub:['감사한 마음이 하나님께 닿았을 거예요.','하나님의 평안이 함께했던 한 주예요.','그래도 여기 오셨네요. 그것만으로 충분해요.',
                    '정말 수고하셨어요. 오늘 밤은 푹 쉬세요.','그 아픔도 하나님이 아세요. 혼자가 아니에요.','하나님이 그 기도를 들으셨어요.'],
        db_nar_mix:'이번 주, 여러 마음이 오갔군요', db_nar_mix_sub:'어떤 마음이든 하나님 앞에 가져오신 것이 귀해요.',
        db_nar_none:'이번 주 아직 기록이 없어요', db_nar_none_sub:'오늘 하루를 남겨보세요 ✦',
        db_times:'{n}회',
        db_pat_combo:'{w} <strong style="color:{c}">{e}</strong>의 마음이 많았어요',
        db_pat_need:'이번 주 가장 많이 <strong>{n}</strong> 하나님 앞에 나왔어요',
        db_pat_empty:'기록이 쌓이면 패턴을 보여드려요',
        db_diary_empty:'이번 주 일기가 없어요<br>오늘 한 줄 남겨보세요 ✦',
    },
    en: {
        db_title:'📊 My Story', db_btn:'📊 My Story', db_icon_label:'My story',
        db_sec_emo:'This week', db_sec_flow:'Day by day', db_sec_pattern:'When you felt this way', db_sec_diary:'Notes this week',
        db_more:'Show details ▾', db_less:'Show less ▴',
        db_emo:['Grateful','At peace','Worried','Worn out','Hurting','Prayerful'],
        db_when:['At work,','With family,','While studying,','Around people,','Thinking of health,','Thinking of children,','In matters of faith,','On hard-to-name days,'],
        db_needing:['needing comfort','needing strength','needing wisdom','needing rest'],
        db_nar_main:['A week overflowing with thanks','A week of a quiet heart','A week with worry on your heart',
                     'A week that wore you out','A week when your heart hurt','A week you closed in prayer'],
        db_nar_sub:['Your thanks has reached God.','God\'s peace was with you this week.','And still you came here. That is enough.',
                    'You have done so much. Rest well tonight.','God knows that pain. You are not alone.','God has heard those prayers.'],
        db_nar_mix:'Many feelings passed through this week', db_nar_mix_sub:'Whatever you felt, bringing it here matters.',
        db_nar_none:'No records yet this week', db_nar_none_sub:'Leave a note about today ✦',
        db_times:'{n}×',
        db_pat_combo:'{w} you were often <strong style="color:{c}">{e}</strong>',
        db_pat_need:'This week you most often came before God <strong>{n}</strong>',
        db_pat_empty:'Patterns appear as your records grow',
        db_diary_empty:'No notes this week<br>Leave one line tonight ✦',
    },
    ja: {
        db_title:'📊 わたしの物語', db_btn:'📊 わたしの物語', db_icon_label:'物語',
        db_sec_emo:'今週の気持ち', db_sec_flow:'曜日ごとの流れ', db_sec_pattern:'こんなとき、こんな気持ちでした', db_sec_diary:'今週の日記',
        db_more:'くわしく見る ▾', db_less:'かんたんに見る ▴',
        db_emo:['感謝','平安','心配','疲れ','痛み','祈り'],
        db_when:['仕事のとき、','家族といるとき、','勉強のとき、','人といるとき、','健康を思うとき、','子どものことを思うとき、','信仰を思うとき、','言葉にしにくい日、'],
        db_needing:['慰めを求めて','力を求めて','知恵を求めて','休みを求めて'],
        db_nar_main:['今週は、感謝があふれた一週間でしたね','今週は、心が平安でしたね','今週は、心配が心にありましたね',
                     '今週は、とても疲れましたね','今週は、心がとても痛みましたね','今週は、祈りで一日を終えましたね'],
        db_nar_sub:['その感謝は神様に届いています。','神様の平安がともにあった一週間です。','それでもここに来ましたね。それだけで十分です。',
                    '本当におつかれさまでした。今夜はゆっくり休んでください。','その痛みも神様はご存じです。ひとりではありません。','神様はその祈りを聞いておられます。'],
        db_nar_mix:'今週はいろいろな気持ちがありましたね', db_nar_mix_sub:'どんな気持ちでも、ここに来たことが大切です。',
        db_nar_none:'今週はまだ記録がありません', db_nar_none_sub:'今日のことを残してみましょう ✦',
        db_times:'{n}回',
        db_pat_combo:'{w}<strong style="color:{c}">{e}</strong>の気持ちが多かったです',
        db_pat_need:'今週はいちばん多く<strong>{n}</strong>神様の前に来ました',
        db_pat_empty:'記録がたまるとパターンをお見せします',
        db_diary_empty:'今週の日記はありません<br>今夜ひとこと残してみましょう ✦',
    },
};
Object.keys(DB_TEXT).forEach(k => Object.assign(LANG_DATA[k], DB_TEXT[k]));

const DB_EMO_LIST = ['감사','평안','걱정','지침','아픔','기도'];
const DB_TOPIC_LIST = ['일','가족','공부','사람','건강','자녀','신앙','모름'];
const DB_NEED_LIST = ['위로','힘','지혜','쉼'];
const DB_EMO_COLORS = {감사:'#f59e0b',평안:'#10b981',걱정:'#6366f1',지침:'#8b5cf6',아픔:'#ef4444',기도:'#3b82f6'};
const HEAVY_EMOS = ['걱정', '지침', '아픔'];

/* 문구의 {이름} 자리에 값을 넣는다 */
function fillText(s, vars) { return String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)); }
/* 감정의 짧은 이름 (현재 언어) */
function emoShort(e) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko, i = DB_EMO_LIST.indexOf(e);
    return i >= 0 ? L.db_emo[i] : String(e || '');
}

/* ── 주간 범위 (일요일 시작). base가 있으면 그 날짜가 속한 주 ── */
function getWeekRange(base) {
    const now = base ? parseYmd(base) : new Date();
    const sun = addDays(now, -now.getDay());
    return { startStr: ymd(sun), endStr: ymd(addDays(sun, 6)) };
}

/* 이번 주 기록 (기기 기록, 날짜순) */
function getDashboardData() {
    const { startStr, endStr } = getWeekRange();
    return getMoods().filter(m => m.date >= startStr && m.date <= endStr)
                     .sort((a, b) => a.date.localeCompare(b.date));
}

/* ── 열기: focus === 'calendar' 이면 달력 위치로 내려감 ── */
function openDashboard(focus) {
    safe('db.labels', () => applyDbLabels());
    safe('db.persona', () => {
        const box = document.querySelector('.persona-demo');
        if (box) box.classList.toggle('hidden', !isDevMode());   // 체험 데이터 선택은 시연(개발자 모드)에서만
        document.querySelectorAll('.persona-btn').forEach(b => b.classList.remove('active'));
    });
    renderDashboard(getDashboardData());
    safe('db.history', () => openHistory());
    showOverlay('overlay-dashboard');
    if (focus === 'calendar') later('db.focus', () => {
        const sec = document.getElementById('hist-cal-sec');
        if (sec && sec.scrollIntoView) sec.scrollIntoView({ block: 'start' });
    }, 60);
}

/* 오버레이 안의 고정 글자를 현재 언어로 */
function applyDbLabels() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const s = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    s('db-title', L.db_title); s('db-back', L.policy_back);
    s('db-sec-emo', L.db_sec_emo); s('db-sec-flow', L.db_sec_flow);
    s('db-sec-pattern', L.db_sec_pattern); s('db-sec-diary', L.db_sec_diary);
    s('btn-dashboard', L.db_btn); s('db-icon-label', L.db_icon_label);
    const det = document.getElementById('db-detail');
    s('db-detail-btn', det && !det.classList.contains('hidden') ? L.db_less : L.db_more);
}

/* ── 그리기: 한 칸이 실패해도 나머지 칸은 그려지게 칸마다 따로 ──
   weekBase: 체험 데이터처럼 이번 주가 아닌 기록을 보여 줄 때 그 주의 아무 날짜 */
function renderDashboard(data, weekBase) {
    const range = getWeekRange(weekBase);
    safe('db.narrative', () => renderDbNarrative(data, range));
    safe('db.bars',      () => renderDbEmoBars(data));
    safe('db.flow',      () => renderDbDayFlow(data, range.startStr));
    safe('db.patterns',  () => renderDbPatterns(data));
    safe('db.diaries',   () => renderDbDiaries(data));
    const det = document.getElementById('db-detail');
    if (det) det.classList.add('hidden');
    safe('db.labels', () => applyDbLabels());
}

/* 서사 카드 */
function renderDbNarrative(data, range) {
    const el = document.getElementById('db-narrative');
    if (!el) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const md = s => s.slice(5).replace('-', '/');
    const wl = `${md(range.startStr)}(${L.day_names[0]}) ~ ${md(range.endStr)}(${L.day_names[6]})`;
    if (!data.length) {
        el.innerHTML = `<div class="db-narrative-week">${wl}</div>
            <div class="db-narrative-main">${L.db_nar_none}</div>
            <div class="db-narrative-sub">${L.db_nar_none_sub}</div>`;
        return;
    }
    const cnt = {};
    data.forEach(m => { cnt[m.emotion] = (cnt[m.emotion]||0)+1; });
    const ranked = Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
    const tied = ranked.length > 1 && ranked[0][1] === ranked[1][1];   // 동률이면 한 감정으로 단정하지 않는다
    const i = Math.max(0, DB_EMO_LIST.indexOf(ranked[0][0]));
    const main = tied ? L.db_nar_mix : L.db_nar_main[i];
    const sub  = tied ? L.db_nar_mix_sub : L.db_nar_sub[i];
    el.innerHTML = `<div class="db-narrative-week">${wl}</div>
        <div class="db-narrative-main">${main}</div>
        <div class="db-narrative-sub">${sub}</div>`;
}

/* 감정 막대 */
function renderDbEmoBars(data) {
    const el = document.getElementById('db-emo-bars');
    if (!el) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const cnt = {};
    DB_EMO_LIST.forEach(e => cnt[e] = 0);
    data.forEach(m => { if (cnt[m.emotion] !== undefined) cnt[m.emotion]++; });
    const max = Math.max(...Object.values(cnt), 1);
    // 먼저 width:0 으로 그린 뒤 transition으로 늘어남
    el.innerHTML = DB_EMO_LIST.map(e => {
        const c = cnt[e], pct = Math.round(c/max*100), col = DB_EMO_COLORS[e];
        return `<div class="db-emo-row">
            <span class="db-emo-lbl">${escHtml(emoShort(e))}</span>
            <div class="db-emo-track">
                <div class="db-emo-fill" data-pct="${pct}" style="width:0;${c === 0 ? 'padding:0;' : ''}background:linear-gradient(90deg,${col},${col}99);">
                    ${c > 0 ? `<span class="db-emo-cnt">${fillText(L.db_times, { n: c })}</span>` : ''}
                </div>
                ${c === 0 ? '<span class="db-emo-zero">-</span>' : ''}
            </div>
        </div>`;
    }).join('');
    requestAnimationFrame(() => {
        el.querySelectorAll('.db-emo-fill[data-pct]').forEach((bar, i) => {
            later('db.bar', () => { bar.style.width = bar.dataset.pct + '%'; }, i * 90);
        });
    });
}

/* 요일별 흐름 */
function renderDbDayFlow(data, startStr) {
    const el = document.getElementById('db-day-flow');
    if (!el) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const byDate = {};
    data.forEach(m => { byDate[m.date] = m; });
    const today = todayStr();
    const start = parseYmd(startStr);
    el.innerHTML = Array.from({length:7}, (_,i) => {
        const ds = ymd(addDays(start, i));
        const m = byDate[ds];
        const col = m ? (DB_EMO_COLORS[m.emotion] || '#888') : '';
        return `<div class="db-day-col${ds === today ? ' db-day-today' : ''}">
            <div class="db-day-dot${m?'':' empty'}"
                style="${m?`background:${col}22;border:2px solid ${col};`:''}">${m ? (E_EMOJI[m.emotion] || '·') : ''}</div>
            <div class="db-day-name">${L.day_names[i]}</div>
        </div>`;
    }).join('');
}

/* 패턴 */
function renderDbPatterns(data) {
    const el = document.getElementById('db-patterns');
    if (!el) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!data.length) { el.innerHTML = `<div class="db-empty">${L.db_pat_empty}</div>`; return; }
    const combos = {};
    data.forEach(m => {
        if (!DB_TOPIC_LIST.includes(m.topic) || !DB_EMO_LIST.includes(m.emotion)) return;
        const k = m.topic + '|' + m.emotion;
        combos[k] = (combos[k]||0) + 1;
    });
    let html = Object.entries(combos).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k, c]) => {
        const [topic, emo] = k.split('|');
        const line = fillText(L.db_pat_combo, { w: `<strong>${escHtml(L.db_when[DB_TOPIC_LIST.indexOf(topic)])}</strong>`,
                                                c: DB_EMO_COLORS[emo], e: escHtml(emoShort(emo)) });
        return `<div class="db-pattern">${line}
            <span style="float:right;font-size:var(--fs-2xs);opacity:.4">${fillText(L.db_times, { n: c })}</span></div>`;
    }).join('');
    const needCnt = {};
    data.forEach(m => { if (!m.skip && DB_NEED_LIST.includes(m.need)) needCnt[m.need] = (needCnt[m.need]||0)+1; });
    const topNeed = Object.entries(needCnt).sort((a,b)=>b[1]-a[1])[0];
    if (topNeed) html += `<div class="db-pattern">${fillText(L.db_pat_need, { n: escHtml(L.db_needing[DB_NEED_LIST.indexOf(topNeed[0])]) })}</div>`;
    el.innerHTML = html || `<div class="db-empty">${L.db_pat_empty}</div>`;
}

/* 이번 주 일기 */
function renderDbDiaries(data) {
    const el = document.getElementById('db-diaries');
    if (!el) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const withDiary = data.filter(m => m.diary).slice().reverse();
    if (!withDiary.length) { el.innerHTML = `<div class="db-empty">${L.db_diary_empty}</div>`; return; }
    el.innerHTML = withDiary.map(m => {
        const col = DB_EMO_COLORS[m.emotion] || 'rgba(255,255,255,.2)';
        return `<div class="db-diary-item" style="border-left-color:${col}">
            <div class="db-diary-date">${escHtml(m.date.slice(5).replace('-','/'))} · ${escHtml(emoShort(m.emotion))}</div>
            <div class="db-diary-txt">${escHtml(m.diary)}</div>
        </div>`;
    }).join('');
}

/* 상세 토글 */
function toggleDbDetail() {
    const det = document.getElementById('db-detail');
    if (!det) return;
    det.classList.toggle('hidden');
    applyDbLabels();
}
