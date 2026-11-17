/* 밤의 목장 — js/vault.js : 보관함 · 주간 감정 차트
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   보관함
═══════════════════════════════════════ */
let moodPage = 0, savedPage = 0;
const MOOD_PER_PAGE = 4, SAVED_PER_PAGE = 5;

function renderPagination(containerId, cur, total, onChange) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    if (total <= 1) return;
    const prev = document.createElement('button');
    prev.className = 'vpag-btn'; prev.textContent = L.pag_prev; prev.disabled = cur === 0;
    prev.onclick = () => onChange(cur - 1);
    const info = document.createElement('span');
    info.className = 'vpag-info'; info.textContent = `${cur + 1} / ${total}`;
    const next = document.createElement('button');
    next.className = 'vpag-btn'; next.textContent = L.pag_next; next.disabled = cur >= total - 1;
    next.onclick = () => onChange(cur + 1);
    el.append(prev, info, next);
}

function openVault() {
    moodPage = 0; savedPage = 0;
    safe('vault.tab', () => switchTab('mood'));
    safe('vault.banner', () => renderVaultBanner());
    showOverlay('overlay-vault');
}

/* 보관함이 열려 있을 때만 다시 그린다 (기록 맞추기·프리미엄 변경·초기화 뒤에 호출) */
function refreshVaultIfOpen() {
    const ov = document.getElementById('overlay-vault');
    if (!ov || ov.classList.contains('hidden')) return;
    renderVaultBanner();
    const savedOn = document.getElementById('vault-saved').classList.contains('active');
    if (savedOn) renderSaved(); else { renderStats(); renderMood(); }
}

/* 즐겨찾기 한 건의 표시용 글 — 저장된 원래 값(감정·필요·시각)으로 현재 언어에 맞춰 만든다.
   예전 방식으로 저장된 것(표시용 글이 통째로 들어 있음)은 그 글을 그대로 쓴다. */
const SAVED_MAX = 200;
function savedContext(v) {
    if (v.emotion && _EMO_IDX[v.emotion] != null) return eLabel(v.emotion) + (v.need ? ' · ' + nLabel(v.need) : '');
    return v.context || '';
}
function savedDateText(v) {
    if (v.savedAt) {
        const d = new Date(v.savedAt);
        if (!isNaN(d)) return d.toLocaleDateString((LANG_DATA[appLang]||LANG_DATA.ko).locale || 'ko-KR', { month:'long', day:'numeric' });
    }
    return v.date || '';
}

/* 보관함 상단 안내 — 로그인/프리미엄을 명확히 구분해 각자의 메리트만 전달 */
function renderVaultBanner() {
    const el = document.getElementById('vault-banner');
    if (!el) return;
    const L = LANG_DATA[appLang] || LANG_DATA.ko;
    if (!sbUser && !isDevMode()) {
        el.innerHTML = `<div class="vault-banner guest">
            <div class="vb-title">${L.vb_guest_title}</div>
            <div class="vb-desc">${L.vb_guest_desc}</div>
            <button class="vb-btn" type="button" onclick="loginWithGoogle()">${L.vb_guest_btn}</button>
        </div>`;
    } else if (!isPremium()) {
        el.innerHTML = `<div class="vault-banner free">
            <div class="vb-title">${L.vb_free_title}</div>
            <div class="vb-desc">${L.vb_free_desc}</div>
            <button class="vb-btn" type="button" onclick="openPremiumModal()">${L.vb_free_btn}</button>
        </div>`;
    } else {
        el.innerHTML = `<div class="vault-banner premium">${L.vb_premium_badge}
            <button class="vb-btn" type="button" onclick="hideOverlay('overlay-vault');openDashboard('calendar')">${L.vb_cal_btn}</button></div>`;
    }
}

function switchTab(tab) {
    document.querySelectorAll('.vault-tab').forEach((t,i)=>t.classList.toggle('active',
        (i===0&&tab==='mood')||(i===1&&tab==='saved')));
    document.getElementById('vault-mood').classList.toggle('active',  tab==='mood');
    document.getElementById('vault-saved').classList.toggle('active', tab==='saved');
    if (tab==='saved') { savedPage=0; renderSaved(); }
    if (tab==='mood')  { moodPage=0; safe('renderStats', () => renderStats()); renderMood(); }
}

function renderSaved() {
    const list = getSaved();
    const el   = document.getElementById('saved-list');
    el.innerHTML = '';
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!list.length) {
        el.innerHTML = `<div class="vault-empty">${L.vault_empty_saved}</div>`;
        renderPagination('saved-pagination', 0, 0, ()=>{});
        return;
    }
    const EMO_BORDER = { '😊':'rgba(240,190,60,.65)', '😌':'rgba(80,200,160,.55)', '😔':'rgba(120,150,255,.6)', '😞':'rgba(160,130,255,.6)', '😢':'rgba(255,120,150,.55)', '🙏':'rgba(80,210,200,.55)' };
    const totalPages = Math.ceil(list.length / SAVED_PER_PAGE);
    if (savedPage >= totalPages) savedPage = 0;
    const start = savedPage * SAVED_PER_PAGE;

    list.slice(start, start + SAVED_PER_PAGE).forEach((v, pi) => {
        const idx = start + pi;
        const item = document.createElement('div');
        item.className = 'saved-verse-item';
        const context = savedContext(v);
        const emoKey = Object.keys(EMO_BORDER).find(em => context.includes(em));
        if (emoKey) item.style.borderLeftColor = EMO_BORDER[emoKey];

        const del = document.createElement('button');
        del.className = 'svi-del'; del.textContent = '×';
        del.addEventListener('click', () => deleteSaved(idx));

        const date = document.createElement('div'); date.className = 'svi-date'; date.textContent = savedDateText(v);
        const ctx  = document.createElement('div'); ctx.className  = 'svi-context'; ctx.textContent = context;
        const verse = document.createElement('div'); verse.className = 'svi-verse'; verse.textContent = v.verse;
        const ref   = document.createElement('div'); ref.className   = 'svi-ref'; ref.textContent = '— ' + v.ref;

        item.append(del, date, ctx, verse, ref);
        if (v.sentence) {
            const sent = document.createElement('div');
            sent.className = 'svi-sentence';
            sent.textContent = '"' + v.sentence + '"';
            item.appendChild(sent);
        }
        el.appendChild(item);
    });
    renderPagination('saved-pagination', savedPage, totalPages, p => { savedPage = p; renderSaved(); });
}

function deleteSaved(idx) {
    const list = getSaved();
    const [gone] = list.splice(idx,1); lsSet('savedVerses',list);
    // 클라우드에서도 지운다 (안 지우면 다음에 기록을 맞출 때 되살아남)
    if (gone && sbUser && sb) sb.from('saved_verses').delete().eq('user_id', sbUser.id).eq('verse_ref', gone.ref).eq('verse_text', gone.verse)
        .then(r => { if (r && r.error) logErr('saved.delete', r.error); }, e => logErr('saved.delete', e));
    if (savedPage > 0 && savedPage >= Math.ceil(list.length / SAVED_PER_PAGE)) savedPage--;
    renderSaved();
}

function renderMood() {
    const hist = getMoods();
    const el   = document.getElementById('mood-list');
    const jumpEl = document.getElementById('mood-month-jump');
    el.innerHTML = '';

    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const dn = L.day_names, mn = L.month_names;
    const fmtDate = str => {
        const d = parseYmd(str);
        if (appLang==='en') return `${mn[d.getMonth()]} ${d.getDate()} (${dn[d.getDay()]})`;
        if (appLang==='ja') return `${mn[d.getMonth()]}${d.getDate()}日 (${dn[d.getDay()]})`;
        return `${d.getMonth()+1}월 ${d.getDate()}일 (${dn[d.getDay()]})`;
    };
    const fmtMonth = str => {
        const d = parseYmd(str);
        if (appLang==='en') return `${mn[d.getMonth()]} ${d.getFullYear()}`;
        if (appLang==='ja') return `${d.getFullYear()}年 ${mn[d.getMonth()]}`;
        return `${d.getFullYear()}년 ${d.getMonth()+1}월`;
    };

    if (!hist.length) {
        el.innerHTML = `<div class="vault-empty">${L.vault_empty_mood}</div>`;
        if (jumpEl) jumpEl.innerHTML = '';
        renderPagination('mood-pagination', 0, 0, ()=>{});
        return;
    }

    // 월별 빠른 이동 버튼
    const months = [...new Set(hist.map(h => fmtMonth(h.date)))];
    if (jumpEl) {
        jumpEl.innerHTML = '';
        months.forEach(m => {
            const btn = document.createElement('button');
            btn.className = 'mmj-btn';
            btn.textContent = m.replace(/^\d{4}년 /, '');
            btn.onclick = () => {
                const firstIdx = hist.findIndex(h => fmtMonth(h.date) === m);
                moodPage = Math.floor(firstIdx / MOOD_PER_PAGE);
                renderMood();
            };
            jumpEl.appendChild(btn);
        });
    }

    // 페이지네이션
    const totalPages = Math.ceil(hist.length / MOOD_PER_PAGE);
    if (moodPage >= totalPages) moodPage = 0;
    const start = moodPage * MOOD_PER_PAGE;
    const pageItems = hist.slice(start, start + MOOD_PER_PAGE);

    // 현재 페이지 기록 렌더링 (월 헤더 포함)
    let curMonth = null;
    pageItems.forEach(h => {
        const month = fmtMonth(h.date);
        if (month !== curMonth) {
            curMonth = month;
            const header = document.createElement('div');
            header.className = 'mood-month-header';
            header.textContent = month;
            el.appendChild(header);
        }
        const item = document.createElement('div'); item.className = 'mood-item';
        const emoji = document.createElement('div'); emoji.className = 'mood-emoji'; emoji.textContent = h.emoji;
        const info  = document.createElement('div'); info.className  = 'mood-info';
        const date  = document.createElement('div'); date.className  = 'mood-date'; date.textContent = fmtDate(h.date);
        const emoTag  = document.createElement('div'); emoTag.className  = 'mood-emo-tag';  emoTag.textContent  = eLabel(h.emotion);
        const needTag = document.createElement('div'); needTag.className = 'mood-need-tag'; needTag.textContent = nLabel(h.need);
        const topicTag= document.createElement('div'); topicTag.className= 'mood-topic-tag';topicTag.textContent= tLabel(h.topic);
        info.append(date, emoTag, needTag, topicTag);
        if (h.diary) {
            const diary = document.createElement('div');
            diary.className = 'mood-diary'; diary.textContent = '"' + h.diary + '"';
            info.appendChild(diary);
        }
        item.append(emoji, info);
        el.appendChild(item);
    });

    // 월 버튼 active 표시 (현재 페이지에 보이는 월들)
    if (jumpEl) {
        const visible = new Set(pageItems.map(h => fmtMonth(h.date)));
        jumpEl.querySelectorAll('.mmj-btn').forEach((btn, i) => btn.classList.toggle('active', visible.has(months[i])));
    }

    renderPagination('mood-pagination', moodPage, totalPages, p => { moodPage = p; renderMood(); });
}

/* ═══════════════════════════════════════
   주간 감정 차트 (기기 기록 — 누구나)
═══════════════════════════════════════ */
function renderStats() {
    const el = document.getElementById('stats-content');
    el.innerHTML = '';
    const L = LANG_DATA[appLang] || LANG_DATA.ko;

    const hist = getMoods();
    const EMO_BG = {
        '감사':'rgba(240,190,60,.85)', '평안':'rgba(80,200,160,.85)',
        '걱정':'rgba(120,150,255,.85)', '지침':'rgba(160,130,255,.85)',
        '아픔':'rgba(255,120,150,.85)', '기도':'rgba(80,210,200,.85)',
    };
    const DAY_NAMES = {
        ko:['일','월','화','수','목','금','토'],
        en:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
        ja:['日','月','火','水','木','金','土'],
    };
    const dayNames = DAY_NAMES[appLang] || DAY_NAMES.ko;

    /* 최근 7일 데이터 구성 */
    const todayD = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = addDays(todayD, -i);
        const ds = ymd(d);
        const entry = hist.find(h => h.date === ds) || null;
        days.push({ ds, dayName: dayNames[d.getDay()], dateNum: d.getDate(), entry, isToday: i === 0 });
    }

    /* 헤더 */
    const titles = { ko:'이번 주 감정 흐름', en:"This Week's Emotions", ja:'今週の感情の流れ' };
    const subs   = { ko:'최근 7일', en:'Last 7 days', ja:'直近7日間' };
    const hdr = document.createElement('div');
    hdr.className = 'wc-header';
    hdr.innerHTML = `<div class="wc-title">${titles[appLang]||titles.ko}</div><div class="wc-subtitle">${subs[appLang]||subs.ko}</div>`;
    el.appendChild(hdr);

    /* 7일 그리드 */
    const grid = document.createElement('div');
    grid.className = 'wc-grid';
    days.forEach(day => {
        const col = document.createElement('div');
        col.className = 'wc-col' + (day.isToday ? ' today' : '');
        const lbl = document.createElement('div'); lbl.className = 'wc-day-lbl'; lbl.textContent = day.dayName;
        const num = document.createElement('div'); num.className = 'wc-date-num'; num.textContent = day.dateNum;
        const circle = document.createElement('div');
        circle.className = 'wc-circle' + (day.entry ? ' has-data' : '');
        if (day.entry) {
            circle.textContent = day.entry.emoji || '';
            circle.style.background = EMO_BG[day.entry.emotion] || 'rgba(255,255,255,.18)';
        }
        const dot = document.createElement('div');
        dot.className = 'wc-dot' + (day.entry ? ' has-data' : '');
        if (day.entry) dot.style.background = EMO_BG[day.entry.emotion] || 'rgba(255,255,255,.3)';
        col.append(lbl, num, circle, dot);
        grid.appendChild(col);
    });
    el.appendChild(grid);

    /* 구분선 */
    const hr = document.createElement('hr'); hr.className = 'wc-divider';
    el.appendChild(hr);

    /* 이번 주 감정 분포 */
    const weekEntries = days.filter(d => d.entry);
    if (!weekEntries.length) {
        const nd = document.createElement('div'); nd.className = 'wc-no-data';
        nd.innerHTML = { ko:'이번 주 기록이 없어요.<br>매일 감정을 기록해보세요.',
                         en:'No records this week.<br>Come back daily!',
                         ja:'今週はまだ記録がありません。<br>毎日記録しましょう。' }[appLang] || '이번 주 기록이 없어요.';
        el.appendChild(nd);
    } else {
        const summaryLbl = document.createElement('div'); summaryLbl.className = 'wc-summary-label';
        summaryLbl.textContent = { ko:'이번 주 감정', en:'THIS WEEK', ja:'今週のまとめ' }[appLang] || '이번 주 감정';
        el.appendChild(summaryLbl);

        const emoCounts = {};
        weekEntries.forEach(d => { const e = d.entry.emotion; emoCounts[e] = (emoCounts[e] || 0) + 1; });
        const sorted = Object.entries(emoCounts).sort((a, b) => b[1] - a[1]);

        const emoGrid = document.createElement('div'); emoGrid.className = 'wc-emo-grid';
        sorted.forEach(([emo, cnt]) => {
            const emoji = E_EMOJI[emo] || '💭';
            const idx = _EMO_IDX[emo];
            const emoName = (idx != null) ? (LANG_DATA[appLang] || LANG_DATA.ko).emo[idx] : emo;
            const cntText = appLang === 'en' ? `${cnt} ${cnt === 1 ? 'day' : 'days'}` :
                            appLang === 'ja' ? `${cnt}回` : `${cnt}회`;
            const item = document.createElement('div');
            item.className = 'wc-emo-item';
            item.style.borderLeftColor = EMO_BG[emo] || 'rgba(255,255,255,.2)';
            item.innerHTML = `<div class="wc-emo-icon">${emoji}</div>
                <div class="wc-emo-info">
                    <div class="wc-emo-name">${escHtml(emoName)}</div>
                    <div class="wc-emo-cnt">${cntText}</div>
                </div>`;
            emoGrid.appendChild(item);
        });
        el.appendChild(emoGrid);
    }

    /* 연속 방문 스트릭 */
    const streak = calcStreak(getVisits());
    const streakUnit = L.streak_unit || '일 연속';
    const streakEl = document.createElement('div'); streakEl.className = 'wc-streak';
    streakEl.innerHTML = `<div class="wc-streak-num">${streak}</div><div class="wc-streak-lbl">🔥 ${streak}${streakUnit}</div>`;
    el.appendChild(streakEl);
}
