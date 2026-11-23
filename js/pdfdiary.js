/* 밤의 목장 — js/pdfdiary.js : PDF 일기장(월간·연간) · CSV 내보내기 (프리미엄)
   PDF = 표지 → 한눈에 보기(숫자·분포·감정 달력·자주 만난 말씀) → 기록 표(날짜·감정·주제·필요·말씀·일기) → 일기 상세.
   CSV = 같은 기록을 엑셀·스프레드시트에서 바로 다룰 수 있게(UTF-8, 한글 깨지지 않음). 기록은 history.js의 loadYear()가 준 것(histMonthList / _histList)을 씀 */

const PDF_TEXT = {
    ko: { sec_sum: '한눈에 보기', sec_tbl: '기록 표', sec_diary: '일기 상세', days: '기록한 날', diaries: '일기 쓴 날', streak: '이 기간 최장 연속', topEmo: '가장 많은 마음', chars: '쓴 글자 수',
          emo: '감정 분포', topic: '주제 분포', need: '필요 분포', dow: '요일별 기록', weeks: '주차별 기록', months: '월별 기록', cal: '감정 달력', verses: '자주 만난 말씀',
          colDate: '날짜', colDow: '요일', colEmo: '감정', colTopic: '주제', colNeed: '필요', colVerse: '말씀', colDiary: '일기', yes: '○', times: '회', week: '주',
          dows: ['일', '월', '화', '수', '목', '금', '토'], none: '기록이 없어요', by: '기록자', made: '만든 날', note: '이 자료는 이 기기에 저장된 기록을 바탕으로 합니다. 엑셀로 분석하려면 CSV로 내보내세요.',
          yearRange: '{y}년 한 해의 기록 · {n}일', fileM: '일기장', fileY: '일기장-연간' },
    en: { sec_sum: 'At a glance', sec_tbl: 'Record table', sec_diary: 'Diary entries', days: 'Days recorded', diaries: 'Days with diary', streak: 'Longest streak', topEmo: 'Most frequent', chars: 'Characters written',
          emo: 'Feelings', topic: 'Topics', need: 'Needs', dow: 'By weekday', weeks: 'By week', months: 'By month', cal: 'Feeling calendar', verses: 'Verses met most often',
          colDate: 'Date', colDow: 'Day', colEmo: 'Feeling', colTopic: 'Topic', colNeed: 'Need', colVerse: 'Verse', colDiary: 'Diary', yes: '●', times: '×', week: 'wk',
          dows: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], none: 'No records', by: 'By', made: 'Created', note: 'Based on records stored on this device. Export CSV to analyze in a spreadsheet.',
          yearRange: '{y} · {n} days recorded', fileM: 'journal', fileY: 'journal-year' },
    ja: { sec_sum: '一目で見る', sec_tbl: '記録表', sec_diary: '日記の詳細', days: '記録した日', diaries: '日記を書いた日', streak: '最長連続', topEmo: '最も多い気持ち', chars: '書いた文字数',
          emo: '気持ちの分布', topic: 'テーマの分布', need: '必要の分布', dow: '曜日別', weeks: '週別', months: '月別', cal: '気持ちカレンダー', verses: 'よく出会ったみ言葉',
          colDate: '日付', colDow: '曜日', colEmo: '気持ち', colTopic: 'テーマ', colNeed: '必要', colVerse: 'み言葉', colDiary: '日記', yes: '○', times: '回', week: '週',
          dows: ['日', '月', '火', '水', '木', '金', '土'], none: '記録がありません', by: '記録者', made: '作成日', note: 'この端末に保存された記録に基づきます。表計算で分析するにはCSVで書き出してください。',
          yearRange: '{y}年の記録 · {n}日', fileM: '日記', fileY: '日記-年間' },
};

/* 연속으로 이어진 날의 가장 긴 길이 (날짜 목록) */
function longestRun(dates) {
    const s = [...new Set(dates)].sort();
    let best = 0, run = 0, prev = null;
    s.forEach(d => { run = prev && ymd(addDays(parseYmd(prev), 1)) === d ? run + 1 : 1; best = Math.max(best, run); prev = d; });
    return best;
}

/* 기록 목록에서 숫자들을 뽑는다 (scope: 'month' | 'year') */
function pdfStats(list, scope) {
    const days = onePerDay(list), count = (arr, key) => { const c = {}; arr.forEach(m => { if (m[key]) c[m[key]] = (c[m[key]] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1]); };
    const dow = [0, 0, 0, 0, 0, 0, 0], trend = scope === 'year' ? new Array(12).fill(0) : new Array(5).fill(0);
    days.forEach(m => { const d = parseYmd(m.date); dow[d.getDay()]++; if (scope === 'year') trend[d.getMonth()]++; else trend[Math.min(4, Math.floor((d.getDate() - 1) / 7))]++; });
    const verses = {};
    list.forEach(m => { const v = verseByRef(m); if (v && v.r) verses[v.r] = (verses[v.r] || 0) + 1; });
    return { days, emo: count(days, 'emotion'), topic: count(days, 'topic'), need: count(days, 'need'), dow, trend,
             diaries: new Set(list.filter(m => m.diary).map(m => m.date)).size, chars: list.reduce((n, m) => n + (m.diary ? m.diary.length : 0), 0),
             streak: longestRun(days.map(m => m.date)), verses: Object.entries(verses).sort((a, b) => b[1] - a[1]).slice(0, 5) };
}

/* 가로 막대 묶음 (인쇄용: 색을 그대로 찍도록 .pdb-bar i 에 배경색) */
function pdfBars(items, T) {
    const max = Math.max(1, ...items.map(i => i.n)), tot = items.reduce((a, i) => a + i.n, 0) || 1;
    if (!items.length) return `<div class="pdb-none">${escHtml(T.none)}</div>`;
    return items.map(i => `<div class="pdb-row"><span class="pdb-lb">${escHtml(i.label)}</span><span class="pdb-bar"><i style="width:${Math.round(i.n / max * 100)}%;background:${i.color || '#9aa8d8'}"></i></span><span class="pdb-n">${i.n}${escHtml(T.times)} · ${Math.round(i.n / tot * 100)}%</span></div>`).join('');
}

/* 감정 달력: 그 달의 날짜 칸마다 감정 색 점 (월간 PDF) */
function pdfCalendar(list, T) {
    const ym = list.length ? list[0].date.slice(0, 7) : '';
    if (!ym) return '';
    const first = parseYmd(ym + '-01'), last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const byDate = {}; onePerDay(list).forEach(m => { byDate[m.date] = m; });
    let cells = T.dows.map(d => `<div class="pdc-h">${escHtml(d)}</div>`).join('') + '<div></div>'.repeat(first.getDay());
    for (let d = 1; d <= last; d++) {
        const ds = ym + '-' + String(d).padStart(2, '0'), m = byDate[ds];
        cells += `<div class="pdc-d"><span class="pdc-n">${d}</span>${m ? `<i style="background:${DB_EMO_COLORS[m.emotion] || '#999'}"></i>` : ''}</div>`;
    }
    const legend = DB_EMO_LIST.map(e => `<span class="pdc-lg"><i style="background:${DB_EMO_COLORS[e]}"></i>${escHtml(emoShort(e))}</span>`).join('');
    return `<div class="pdc-grid">${cells}</div><div class="pdc-legend">${legend}</div>`;
}

/* PDF 일기장 만들기 → 인쇄 창 (PDF로 저장). scope = 'month'(보고 있는 달) | 'year'(보고 있는 해 전체) */
function exportDiaryPdf(scope) {
    const L = LANG_DATA[appLang] || LANG_DATA.ko, T = PDF_TEXT[appLang] || PDF_TEXT.ko;
    if (!isPremium()) { openPremiumModal(); return; }
    scope = scope === 'year' ? 'year' : 'month';
    const list = (scope === 'year' ? _histList.slice() : histMonthList()).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    if (!list.length) { toast(L.hm_pdf_none); return; }
    const pd = document.getElementById('print-diary');
    if (!pd) return;
    const st = pdfStats(list, scope);
    const ymLabel = scope === 'year' ? fillText(T.yearRange, { y: histY, n: st.days.length })
        : fillText(L.pd_range, { ym: fillText(L.hc_ym, { y: histY, m: appLang === 'ko' ? histM : L.month_names[histM - 1] }), n: st.days.length });
    const fmtDate = ds => parseYmd(ds).toLocaleDateString(L.locale || 'ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    const name = lsGet('userName') || '';
    const topEmo = st.emo[0] ? emoShort(st.emo[0][0]) : '-';
    const card = (n, l) => `<div class="pds-card"><b>${escHtml(String(n))}</b><span>${escHtml(l)}</span></div>`;
    const trendLabels = scope === 'year' ? L.month_names : st.trend.map((_, i) => (i + 1) + T.week);
    const summary = `
        <section class="pd-sum">
            <h2>${escHtml(T.sec_sum)}</h2>
            <div class="pds-cards">${card(st.days.length, T.days)}${card(st.diaries, T.diaries)}${card(st.streak, T.streak)}${card(topEmo, T.topEmo)}${card(st.chars, T.chars)}</div>
            <div class="pds-cols">
                <div><h3>${escHtml(T.emo)}</h3>${pdfBars(st.emo.map(([k, n]) => ({ label: emoShort(k), n, color: DB_EMO_COLORS[k] })), T)}</div>
                <div><h3>${escHtml(scope === 'year' ? T.months : T.weeks)}</h3>${pdfBars(st.trend.map((n, i) => ({ label: trendLabels[i], n, color: '#c8a86b' })), T)}</div>
            </div>
            <div class="pds-cols">
                <div><h3>${escHtml(T.topic)}</h3>${pdfBars(st.topic.map(([k, n]) => ({ label: tLabel(k), n })), T)}</div>
                <div><h3>${escHtml(T.need)}</h3>${pdfBars(st.need.map(([k, n]) => ({ label: nLabel(k), n })), T)}</div>
            </div>
            <div class="pds-cols">
                <div><h3>${escHtml(T.dow)}</h3>${pdfBars(st.dow.map((n, i) => ({ label: T.dows[i], n, color: '#8fb0a0' })), T)}</div>
                <div><h3>${escHtml(T.verses)}</h3>${st.verses.length ? st.verses.map(([r, n]) => `<div class="pdv-row"><span>${escHtml(r)}</span><b>${n}${escHtml(T.times)}</b></div>`).join('') : `<div class="pdb-none">${escHtml(T.none)}</div>`}</div>
            </div>
            ${scope === 'month' ? `<h3>${escHtml(T.cal)}</h3>${pdfCalendar(list, T)}` : ''}
        </section>`;
    const rows = list.map(m => {
        const v = verseByRef(m);
        return `<tr><td>${escHtml(m.date)}</td><td>${escHtml(T.dows[parseYmd(m.date).getDay()])}</td><td>${escHtml(emoShort(m.emotion))}</td><td>${escHtml(tLabel(m.topic))}</td><td>${escHtml(nLabel(m.need))}</td><td>${escHtml(v ? v.r : '')}</td><td>${m.diary ? escHtml(T.yes) : ''}</td></tr>`;
    }).join('');
    const table = `<section class="pd-tbl"><h2>${escHtml(T.sec_tbl)}</h2><table><thead><tr><th>${escHtml(T.colDate)}</th><th>${escHtml(T.colDow)}</th><th>${escHtml(T.colEmo)}</th><th>${escHtml(T.colTopic)}</th><th>${escHtml(T.colNeed)}</th><th>${escHtml(T.colVerse)}</th><th>${escHtml(T.colDiary)}</th></tr></thead><tbody>${rows}</tbody></table></section>`;
    const entryHtml = list.map(m => {
        const v = verseByRef(m);
        return `<div class="pd-entry">
            <div class="pd-date">${escHtml(fmtDate(m.date))}</div>
            <div class="pd-emo">${iconHtml('emo', m.emotion)} ${escHtml(emoShort(m.emotion))}</div>
            ${v ? `<div class="pd-verse">${v.v ? '“' + escHtml(v.v) + '” ' : ''}<span class="pd-ref">— ${escHtml(v.r)}</span></div>` : ''}
            ${m.diary ? `<div class="pd-diary">${diaryHtml(m.diary)}</div>` : ''}
        </div>`;
    }).join('');
    pd.innerHTML = `
        <div class="pd-cover">
            <div class="pd-moon">${iconHtml('ui', 'sheep')}</div>
            <h1>${escHtml(L.pd_title)}</h1>
            <div class="pd-sub">${escHtml(L.pd_sub)}</div>
            <div class="pd-range">${escHtml(ymLabel)}</div>
            <div class="pd-meta">${name ? escHtml(T.by) + ' · ' + escHtml(name) + '<br>' : ''}${escHtml(T.made)} · ${escHtml(todayStr())}</div>
        </div>
        ${summary}
        ${table}
        <h2 class="pd-h2">${escHtml(T.sec_diary)}</h2>
        ${entryHtml}
        <div class="pd-note">${escHtml(T.note)}</div>
        <div class="pd-foot">${escHtml(L.pd_foot)}</div>`;
    window.print();
}

/* CSV 한 칸 만들기: 따옴표 처리 + 엑셀이 수식으로 읽지 않도록 =,+,-,@ 로 시작하면 앞에 ' */
function csvCell(v) {
    let s = String(v == null ? '' : v).replace(/\r?\n/g, ' ');
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
}

/* 같은 기록을 CSV로 저장 (scope: 'month' | 'year'). 첫 줄에 BOM을 붙여 엑셀에서 한글이 안 깨짐 */
function exportDiaryCsv(scope) {
    const L = LANG_DATA[appLang] || LANG_DATA.ko, T = PDF_TEXT[appLang] || PDF_TEXT.ko;
    if (!isPremium()) { openPremiumModal(); return; }
    scope = scope === 'year' ? 'year' : 'month';
    const list = (scope === 'year' ? _histList.slice() : histMonthList()).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    if (!list.length) { toast(L.hm_pdf_none); return; }
    const head = ['date', 'weekday', 'emotion', 'topic', 'need', 'verse_ref', 'verse_text', 'diary', 'diary_chars'];
    const rows = list.map(m => {
        const v = verseByRef(m) || {};
        return [m.date, T.dows[parseYmd(m.date).getDay()], m.emotion, m.topic, m.need, v.r || '', v.v || '', m.diary || '', m.diary ? m.diary.length : 0].map(csvCell).join(',');
    });
    const blob = new Blob(['﻿' + head.join(',') + '\r\n' + rows.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (scope === 'year' ? histY : histY + '-' + String(histM).padStart(2, '0')) + '-' + (scope === 'year' ? T.fileY : T.fileM) + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
