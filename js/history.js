/* 밤의 목장 — js/history.js : 기록 달력 · 월간/연간 리포트 · PDF 일기장
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다)

   무료/프리미엄 경계가 이 파일에 모여 있다.
   · 무료     : 달력은 이번 달과 지난달까지 (기기에 남아 있는 기록). 리포트·PDF는 잠금
   · 프리미엄 : 달력은 모든 달 (로그인 중이면 클라우드에서 그 해 기록을 불러옴). 월간·연간 리포트, PDF
   기록을 어디서 읽는지는 loadYear() 하나만 안다. */

const HIST_TEXT = {
    ko: {
        hs_cal:'기록 달력', hs_month:'이 달 돌보심의 기록', hs_year:'한 해 돌보심의 기록',
        hc_prev:'이전 달', hc_next:'다음 달', hc_ym:'{y}년 {m}월', hc_y:'{y}년',
        hc_pick:'기록이 있는 날을 누르면 그날 밤을 다시 볼 수 있어요',
        hc_note_free:'무료는 지난달까지 볼 수 있어요. 그 이전의 밤은 프리미엄에서 다시 만나요.',
        hc_note_guest:'로그인하지 않으면 기록은 이 기기에 최근 두 달만 남아요.',
        hc_loading:'기록을 불러오는 중…', hc_fail:'클라우드 기록을 불러오지 못해 이 기기의 기록만 보여드려요.',
        hm_none:'{m}의 기록이 아직 없어요.',
        hm_total:'{m}, <b>{n}일 밤</b>을 목장에서 보내셨어요.',
        hm_heavy:'마음이 무거웠던 <b>{n}일</b>에도, 매일 말씀이 함께했어요.',
        hm_top:'가장 자주 머문 마음은 <b>‘{e}’</b>({n}일)이었어요.',
        hm_diary:'감사 일기를 <b>{n}편</b> 남기셨어요.',
        hm_pdf:'📄 PDF로 내보내기 — 나의 신앙 일기장', hm_pdf_none:'이 달의 기록이 아직 없어요',
        hy_none:'{y}년의 기록이 아직 없어요.',
        hy_total:'{y}년, <b>{n}일 밤</b>을 함께했어요.',
        hy_best:'가장 자주 찾은 달은 <b>{m}</b>({n}일)이었어요.',
        pd_title:'나의 신앙 일기장', pd_sub:'밤의 목장', pd_range:'{ym} · {n}일의 기록',
        pd_foot:'밤의 목장 — 오늘 밤, 주님이 누이시는 곳',
    },
    en: {
        hs_cal:'Calendar', hs_month:'This month in His care', hs_year:'This year in His care',
        hc_prev:'Previous month', hc_next:'Next month', hc_ym:'{m} {y}', hc_y:'{y}',
        hc_pick:'Tap a day with a record to revisit that night',
        hc_note_free:'Free shows this month and last month. Earlier nights open again with Premium.',
        hc_note_guest:'Without signing in, only the last two months stay on this device.',
        hc_loading:'Loading your records…', hc_fail:'Could not load cloud records, so only this device\'s records are shown.',
        hm_none:'No records yet for {m}.',
        hm_total:'In {m}, you spent <b>{n} nights</b> at the pasture.',
        hm_heavy:'Even on the <b>{n} heavy days</b>, the Word was with you.',
        hm_top:'The heart you stayed in most was <b>{e}</b> ({n} days).',
        hm_diary:'You left <b>{n}</b> gratitude notes.',
        hm_pdf:'📄 Export as PDF — My Faith Journal', hm_pdf_none:'No records for this month yet',
        hy_none:'No records yet for {y}.',
        hy_total:'In {y}, we spent <b>{n} nights</b> together.',
        hy_best:'The month you came most was <b>{m}</b> ({n} days).',
        pd_title:'My Faith Journal', pd_sub:'Night Pasture', pd_range:'{ym} · {n} days recorded',
        pd_foot:'Night Pasture — where the Lord lets you lie down tonight',
    },
    ja: {
        hs_cal:'記録カレンダー', hs_month:'この月の守りの記録', hs_year:'この一年の守りの記録',
        hc_prev:'前の月', hc_next:'次の月', hc_ym:'{y}年{m}', hc_y:'{y}年',
        hc_pick:'記録のある日を押すと、その夜をもう一度見られます',
        hc_note_free:'無料は先月まで見られます。それ以前の夜はプレミアムでまた会えます。',
        hc_note_guest:'ログインしない場合、記録はこの端末に直近2か月分だけ残ります。',
        hc_loading:'記録を読み込み中…', hc_fail:'クラウドの記録を読み込めなかったため、この端末の記録だけを表示しています。',
        hm_none:'{m}の記録はまだありません。',
        hm_total:'{m}、<b>{n}日の夜</b>を牧場で過ごしました。',
        hm_heavy:'心が重かった<b>{n}日</b>にも、毎日みことばがともにありました。',
        hm_top:'いちばん多かった気持ちは<b>「{e}」</b>（{n}日）でした。',
        hm_diary:'感謝日記を<b>{n}件</b>残しました。',
        hm_pdf:'📄 PDFで書き出す — 私の信仰日記', hm_pdf_none:'この月の記録はまだありません',
        hy_none:'{y}年の記録はまだありません。',
        hy_total:'{y}年、<b>{n}日の夜</b>をともに過ごしました。',
        hy_best:'いちばん多く訪れた月は<b>{m}</b>（{n}日）でした。',
        pd_title:'私の信仰日記', pd_sub:'夜の牧場', pd_range:'{ym} · {n}日の記録',
        pd_foot:'夜の牧場 — 今夜、主が伏させてくださるところ',
    },
};
Object.keys(HIST_TEXT).forEach(k => Object.assign(LANG_DATA[k], HIST_TEXT[k]));

/* ═══════════════════════════════════════
   기록 불러오기
═══════════════════════════════════════ */
/* 서버의 한 줄 → 앱이 쓰는 기록 모양 */
function moodFromRow(r) {
    const h = { date: r.date, emotion: r.emotion, topic: r.topic, need: r.need, emoji: E_EMOJI[r.emotion] || '' };
    if (r.diary_text) h.diary = r.diary_text;
    if (r.verse_ref) h.ref = r.verse_ref;
    return h;
}
const moodKey = h => [h.date, h.emotion, h.topic, h.need].join('|');

/* 그 해의 기록 (날짜순). 프리미엄 + 로그인이면 클라우드 기록에 기기 기록을 합치고, 아니면 기기 기록만.
   돌려주는 값: { list, failed } — failed는 클라우드를 읽지 못해 기기 기록으로 대신했다는 뜻 */
const _histCache = new Map();
function clearHistoryCache() { _histCache.clear(); }
async function loadYear(y) {
    const pre = String(y) + '-';
    const local = getMoods().filter(h => h.date.startsWith(pre));
    const asc = list => list.slice().sort((a, b) => a.date.localeCompare(b.date));
    if (!(isPremium() && sbUser && sb)) return { list: asc(local), failed: false };
    const uid = sbUser.id, ck = uid + ':' + y;
    let rows = _histCache.get(ck);
    if (!rows) {
        try {
            const { data, error } = await sb.from('mood_history').select('*').eq('user_id', uid)
                .gte('date', pre + '01-01').lte('date', pre + '12-31').order('date', { ascending: true }).limit(1000);
            if (error) throw error;
            rows = (data || []).filter(r => r && isYmd(r.date) && r.emotion).map(moodFromRow);
            _histCache.set(ck, rows);
        } catch (e) {
            logErr('history.load', e);
            return { list: asc(local), failed: true };
        }
    }
    // 같은 기록은 한 건으로 (일기·말씀 출처는 있는 쪽을 살림). 아직 올라가지 않은 기기 기록도 포함
    const byKey = new Map();
    rows.forEach(h => { const o = byKey.get(moodKey(h)); if (!o || (!o.diary && h.diary)) byKey.set(moodKey(h), { ...h }); });
    local.forEach(h => {
        const o = byKey.get(moodKey(h));
        if (!o) byKey.set(moodKey(h), h);
        else { if (!o.diary && h.diary) o.diary = h.diary; if (!o.ref && h.ref) o.ref = h.ref; }
    });
    return { list: asc([...byKey.values()]), failed: false };
}

/* 하루에 여러 번 기록했으면 그날을 대표하는 한 건 (일기가 있는 것 우선, 없으면 마지막 것) */
function onePerDay(list) {
    const byDay = new Map();
    list.forEach(h => { const o = byDay.get(h.date); if (!o || h.diary || !o.diary) byDay.set(h.date, h); });
    return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/* 그날 본 말씀: 기록에 남긴 출처(ref)로 본문을 찾는다. 출처가 없던 예전 기록은 말씀을 넣지 않는다
   (다른 구절을 그날의 말씀처럼 보여 주지 않기 위함) */
function verseByRef(h) {
    if (!h || !h.ref) return null;
    const key = `${h.emotion}_${h.need}`;
    const pools = appLang === 'en' ? [VERSE_POOL_EN, VERSE_POOL] : [VERSE_POOL, VERSE_POOL_EN];
    for (const P of pools) {
        const hit = (Array.isArray(P[key]) ? P[key] : []).find(x => x && x.r === h.ref);
        if (hit) return hit;
    }
    return { v: '', r: h.ref };
}

/* ═══════════════════════════════════════
   달력 상태 · 이동
═══════════════════════════════════════ */
let histY = 0, histM = 0;          // 보고 있는 달 (histM: 1~12)
let histSel = null;                // 달력에서 고른 날짜
let _histSeq = 0, _histList = [];  // 지금 보고 있는 해의 기록

const ymNum = (y, m) => y * 12 + (m - 1);
function histNowNum() { const n = new Date(); return ymNum(n.getFullYear(), n.getMonth() + 1); }
/* 무료가 볼 수 있는 가장 이른 달 = 지난달 */
function histFreeFloor() { return histNowNum() - 1; }

function histIsOpen() {
    const ov = document.getElementById('overlay-dashboard');
    return !!ov && !ov.classList.contains('hidden');
}
function openHistory() {
    const n = new Date();
    histY = n.getFullYear(); histM = n.getMonth() + 1; histSel = null;
    renderHistory();
}
/* 프리미엄 여부·기록이 바뀌었을 때: 열려 있으면 다시 그림 */
function refreshHistoryIfOpen() {
    clearHistoryCache();
    if (!histIsOpen() || !histY) return;
    if (!isPremium() && ymNum(histY, histM) < histFreeFloor()) { openHistory(); return; } // 자격이 사라졌으면 볼 수 있는 달로
    renderHistory();
}
function histMove(step) {
    const next = ymNum(histY, histM) + step;
    if (next > histNowNum()) return;
    if (!isPremium() && next < histFreeFloor()) { openPremiumModal(); return; }
    histY = Math.floor(next / 12); histM = next % 12 + 1; histSel = null;
    renderHistory();
}
function histPick(ds) {
    histSel = histSel === ds ? null : ds;
    safe('hist.calendar', () => renderHistCalendar());
}

async function renderHistory() {
    const seq = ++_histSeq, y = histY;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    safe('hist.labels', () => {
        const s = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
        s('hist-sec-cal', L.hs_cal); s('hist-sec-month', L.hs_month); s('hist-sec-year', L.hs_year);
        s('pm-lock-title', L.pm_lock_title); s('pm-lock-sub', L.pm_lock_sub);
        const lock = document.getElementById('pm-lock-card');
        // 아래쪽 자물쇠 카드는 시연용 프리미엄 체험 토글 — 개발자 모드에서만 보인다 (평소 안내는 월간 리포트 위의 자물쇠가 맡음)
        if (lock) lock.classList.toggle('hidden', !(DEMO_UNLOCK && isDevMode()));
    });
    const note = document.getElementById('hist-note');
    const slow = later('hist.loading', () => { if (seq === _histSeq && note) note.textContent = L.hc_loading; }, 400);
    let res;
    try { res = await loadYear(y); }
    catch (e) { logErr('history', e); res = { list: [], failed: true }; }
    clearTimeout(slow);
    if (seq !== _histSeq) return; // 그 사이 다른 달로 넘어갔으면 그쪽 결과에 맡김
    _histList = res.list;
    safe('hist.calendar', () => renderHistCalendar());
    safe('hist.monthly',  () => renderHistMonthly());
    safe('hist.yearly',   () => renderHistYearly());
    if (note) note.textContent = res.failed ? L.hc_fail
        : isPremium() ? '' : (sbUser ? L.hc_note_free : L.hc_note_guest);
}

function histMonthList() {
    const pre = histY + '-' + String(histM).padStart(2, '0');
    return _histList.filter(h => h.date.startsWith(pre));
}

/* ═══════════════════════════════════════
   달력
═══════════════════════════════════════ */
function renderHistCalendar() {
    const el = document.getElementById('hist-cal');
    if (!el) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const byDay = new Map();
    histMonthList().forEach(h => { if (!byDay.has(h.date)) byDay.set(h.date, []); byDay.get(h.date).push(h); });
    const first = new Date(histY, histM - 1, 1), days = new Date(histY, histM, 0).getDate();
    const today = todayStr(), cur = ymNum(histY, histM);
    const title = fillText(L.hc_ym, { y: histY, m: appLang === 'ko' ? histM : L.month_names[histM - 1] });
    let cells = L.day_names.map(d => `<div class="hc-dow">${d}</div>`).join('');
    for (let i = 0; i < first.getDay(); i++) cells += '<div class="hc-day blank"></div>';
    for (let d = 1; d <= days; d++) {
        const ds = ymd(new Date(histY, histM - 1, d)), list = byDay.get(ds);
        const cls = 'hc-day' + (ds === today ? ' today' : '') + (ds === histSel ? ' sel' : '');
        if (list) {
            const rep = onePerDay(list)[0], col = DB_EMO_COLORS[rep.emotion] || '#999';
            cells += `<button type="button" class="${cls} has" style="--c:${col}" onclick="histPick('${ds}')"
                aria-label="${d} ${escHtml(emoShort(rep.emotion))}"><span class="hc-num">${d}</span><span class="hc-dot"></span></button>`;
        } else cells += `<div class="${cls}"><span class="hc-num">${d}</span></div>`;
    }
    const sel = histSel && byDay.get(histSel);
    const detail = sel ? `<div class="hc-detail">${sel.map(h => {
        const meta = [h.emotion && eLabel(h.emotion), h.topic && tLabel(h.topic), h.need && nLabel(h.need)].filter(Boolean).join(' · ');
        const v = verseByRef(h);
        const dateTxt = parseYmd(h.date).toLocaleDateString(L.locale || 'ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
        return `<div class="hc-entry" style="border-left-color:${DB_EMO_COLORS[h.emotion] || 'rgba(255,255,255,.2)'}">
            <div class="hc-entry-date">${escHtml(dateTxt)}</div>
            <div class="hc-entry-meta">${escHtml(meta)}</div>
            ${v ? `<div class="hc-entry-verse">${v.v ? '“' + escHtml(v.v) + '” ' : ''}<span>— ${escHtml(v.r)}</span></div>` : ''}
            ${h.diary ? `<div class="hc-entry-diary">${escHtml(h.diary)}</div>` : ''}
        </div>`;
    }).join('')}</div>` : (byDay.size ? `<div class="hc-hint">${L.hc_pick}</div>` : '');
    el.innerHTML = `<div class="hc-nav">
            <button type="button" class="hc-arrow" onclick="histMove(-1)" aria-label="${escHtml(L.hc_prev)}">‹</button>
            <div class="hc-title">${escHtml(title)}</div>
            <button type="button" class="hc-arrow" onclick="histMove(1)" aria-label="${escHtml(L.hc_next)}"${cur >= histNowNum() ? ' disabled' : ''}>›</button>
        </div>
        <div class="hc-grid">${cells}</div>${detail}`;
}

/* ═══════════════════════════════════════
   월간 리포트 — 숫자가 아니라 문장으로. 프리미엄이 아니면 흐리게 + 자물쇠
═══════════════════════════════════════ */
function histSummary(list) {
    const days = onePerDay(list);
    const cnt = {};
    DB_EMO_LIST.forEach(e => cnt[e] = 0);
    days.forEach(m => { if (cnt[m.emotion] !== undefined) cnt[m.emotion]++; });
    return { total: days.length, heavy: days.filter(m => HEAVY_EMOS.includes(m.emotion)).length,
             top: Object.entries(cnt).sort((a, b) => b[1] - a[1])[0], diaries: list.filter(m => m.diary).length };
}
function renderHistMonthly() {
    const el = document.getElementById('hist-monthly');
    if (!el) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const list = histMonthList(), s = histSummary(list);
    const mName = L.month_names[histM - 1];
    const lines = [];
    if (!s.total) lines.push(fillText(L.hm_none, { m: mName }));
    else {
        lines.push(fillText(L.hm_total, { m: mName, n: s.total }));
        if (s.heavy > 0) lines.push(fillText(L.hm_heavy, { n: s.heavy }));
        if (s.top && s.top[1] > 0) lines.push(fillText(L.hm_top, { e: escHtml(emoShort(s.top[0])), n: s.top[1] }));
        if (s.diaries > 0) lines.push(fillText(L.hm_diary, { n: s.diaries }));
    }
    const body = `<div class="db-month-body">${lines.map(l => `<div class="db-month-line">${l}</div>`).join('')}</div>`;
    if (isPremium()) {
        el.innerHTML = `<div class="db-month-wrap">${body}</div>
            <button class="db-pdf-btn" type="button" onclick="exportDiaryPdf()">${L.hm_pdf}</button>` + safe('ai.button', () => aiReportButtonHtml(), '');
    } else {
        el.innerHTML = `<div class="db-month-wrap locked">${body}
            <button class="db-month-lock" type="button" onclick="openPremiumModal()">
                <span class="lk-ic">🔒</span>
                <span class="lk-tx"><b>${escHtml(L.pm_lock_title)}</b><br>${escHtml(L.pm_lock_sub)}</span>
            </button>
        </div>`;
    }
}

/* ═══════════════════════════════════════
   연간 리포트 (프리미엄에게만 보임)
═══════════════════════════════════════ */
function renderHistYearly() {
    const sec = document.getElementById('hist-year-sec'), el = document.getElementById('hist-yearly');
    if (!sec || !el) return;
    sec.classList.toggle('hidden', !isPremium());
    if (!isPremium()) { el.innerHTML = ''; return; }
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const s = histSummary(_histList);
    const perMonth = Array.from({ length: 12 }, () => new Set());
    _histList.forEach(h => { const m = Number(h.date.slice(5, 7)) - 1; if (perMonth[m]) perMonth[m].add(h.date); });
    const counts = perMonth.map(x => x.size), max = Math.max(...counts, 1);
    const yTxt = fillText(L.hc_y, { y: histY });
    const lines = [];
    if (!s.total) lines.push(fillText(L.hy_none, { y: histY }));
    else {
        lines.push(fillText(L.hy_total, { y: histY, n: s.total }));
        if (s.top && s.top[1] > 0) lines.push(fillText(L.hm_top, { e: escHtml(emoShort(s.top[0])), n: s.top[1] }));
        const best = counts.indexOf(max);
        if (counts.filter(c => c > 0).length > 1) lines.push(fillText(L.hy_best, { m: L.month_names[best], n: max }));
        if (s.heavy > 0) lines.push(fillText(L.hm_heavy, { n: s.heavy }));
    }
    el.innerHTML = `<div class="hy-year">${escHtml(yTxt)}</div>
        <div class="hy-bars">${counts.map((c, i) => `<div class="hy-col${i + 1 === histM ? ' cur' : ''}">
            <div class="hy-track"><div class="hy-fill" style="height:${Math.round(c / max * 100)}%"></div></div>
            <div class="hy-m">${i + 1}</div></div>`).join('')}</div>
        <div class="db-month-body">${lines.map(l => `<div class="db-month-line">${l}</div>`).join('')}</div>`;
}

/* ═══════════════════════════════════════
   PDF 일기장: 보고 있는 달의 기록 → 인쇄 창 (PDF로 저장)
═══════════════════════════════════════ */
function exportDiaryPdf() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!isPremium()) { openPremiumModal(); return; }
    const list = histMonthList();
    if (!list.length) { toast(L.hm_pdf_none); return; }
    const pd = document.getElementById('print-diary');
    if (!pd) return;
    const ymLabel = fillText(L.hc_ym, { y: histY, m: appLang === 'ko' ? histM : L.month_names[histM - 1] });
    const fmtDate = ds => parseYmd(ds).toLocaleDateString(L.locale || 'ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    const entryHtml = list.map(m => {
        const v = verseByRef(m);
        return `<div class="pd-entry">
            <div class="pd-date">${escHtml(fmtDate(m.date))}</div>
            <div class="pd-emo">${m.emoji || E_EMOJI[m.emotion] || ''} ${escHtml(emoShort(m.emotion))}</div>
            ${v ? `<div class="pd-verse">${v.v ? '“' + escHtml(v.v) + '” ' : ''}<span class="pd-ref">— ${escHtml(v.r)}</span></div>` : ''}
            ${m.diary ? `<div class="pd-diary">${escHtml(m.diary)}</div>` : ''}
        </div>`;
    }).join('');
    pd.innerHTML = `
        <div class="pd-cover">
            <div class="pd-moon">✦</div>
            <h1>${escHtml(L.pd_title)}</h1>
            <div class="pd-sub">${escHtml(L.pd_sub)}</div>
            <div class="pd-range">${escHtml(fillText(L.pd_range, { ym: ymLabel, n: onePerDay(list).length }))}</div>
        </div>
        ${entryHtml}
        <div class="pd-foot">${escHtml(L.pd_foot)}</div>`;
    window.print();
}
