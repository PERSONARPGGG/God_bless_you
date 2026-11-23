/* 밤의 목장 — js/devboard.js : 개발자 보드 (개발자 모드에서만 설정에 나타남)
   이 기기에 쌓인 기록으로 방문 추이·감정 분포·시스템 상태를 한눈에 본다. 전체 사용자 집계(방문자 수·가입 추이)는 Supabase를 연결한 뒤 서버에서 집계해 붙일 자리 */

/* 최근 n일 날짜 목록 (오래된 날 → 오늘) */
function recentDays(n) {
    const out = [], t = parseYmd(todayStr());
    for (let i = n - 1; i >= 0; i--) out.push(ymd(addDays(t, -i)));
    return out;
}

/* 막대 그래프 한 줄 묶음 HTML (items: [{label, n, color?}]) */
function dbBars(items) {
    const max = Math.max(1, ...items.map(i => i.n));
    return items.map(i => `<div class="dv-row"><span class="dv-lb">${escHtml(i.label)}</span><span class="dv-bar"><i style="width:${Math.round(i.n / max * 100)}%;${i.color ? 'background:' + i.color : ''}"></i></span><span class="dv-n">${i.n}</span></div>`).join('') || '<div class="dv-empty">기록이 없어요</div>';
}

/* 개발자 보드 화면(오버레이)을 만들고 최신 값으로 채워서 연다 */
function openDevBoard() {
    let ov = document.getElementById('overlay-devboard');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'overlay-devboard'; ov.className = 'overlay hidden';
        ov.innerHTML = '<div class="overlay-inner"><button class="overlay-back" onclick="hideOverlay(\'overlay-devboard\')">← 돌아가기</button><div class="overlay-title">개발자 보드</div><div id="dv-body"></div></div>';
        document.body.appendChild(ov);
    }
    document.getElementById('dv-body').innerHTML = devBoardHtml();
    showOverlay('overlay-devboard');
    safe('dv.cache', () => { if (window.caches) caches.keys().then(k => { const e = document.getElementById('dv-cache'); if (e) e.textContent = k.join(', ') || '없음'; }); });
}

/* 보드 내용 만들기 */
function devBoardHtml() {
    const visits = getVisits(), moods = getMoods(), saved = getSaved();
    const days = recentDays(30), vset = new Set(visits);
    const trend = days.map(d => `<i class="dv-col${vset.has(d) ? ' on' : ''}" title="${d}"></i>`).join('');
    const last30 = moods.filter(m => days.includes(m.date));
    const count = (arr, key) => { const c = {}; arr.forEach(m => { if (m[key]) c[m[key]] = (c[m[key]] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1]); };
    const dow = [0, 0, 0, 0, 0, 0, 0]; visits.forEach(d => { dow[parseYmd(d).getDay()]++; });
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const withDiary = moods.filter(m => m.diary).length;
    const errs = errLog();
    let bytes = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); bytes += k.length + (localStorage.getItem(k) || '').length; } } catch (e) {}
    const premiumSrc = serverPremium ? '서버 구독' : (lsGet('premiumActive') === true ? '시연 체험' : (isDevMode() ? '개발자 모드' : '무료'));
    const card = (n, l) => `<div class="dv-card"><b>${n}</b><span>${l}</span></div>`;
    const seasons = [['auto', '자동'], ['spring', '봄'], ['summer', '여름'], ['autumn', '가을'], ['winter', '겨울']];
    const curPv = sessionStorage.getItem('seasonPreview') || 'auto';
    return `
    <div class="dv-sec">방문 추이 · 최근 30일 <small>(이 기기)</small></div>
    <div class="dv-trend">${trend}</div>
    <div class="dv-cards">${card(visits.length, '기록된 방문일')}${card(calcStreak(visits), '연속')}${card(moods.length, '감정 기록')}${card(withDiary, '일기 쓴 날')}${card(saved.length, '저장한 말씀')}${card(moods.length ? Math.round(withDiary / moods.length * 100) + '%' : '-', '일기 작성률')}</div>
    <div class="dv-sec">요일별 방문</div>${dbBars(dow.map((n, i) => ({ label: dayNames[i], n })))}
    <div class="dv-sec">감정 분포 · 최근 30일</div>${dbBars(count(last30, 'emotion').map(([k, n]) => ({ label: k, n, color: DB_EMO_COLORS[k] })))}
    <div class="dv-sec">주제 · 필요 분포</div>${dbBars(count(last30, 'topic').map(([k, n]) => ({ label: k, n })))}${dbBars(count(last30, 'need').map(([k, n]) => ({ label: k, n })))}
    <div class="dv-sec">계절 배경 미리보기 <small>(새로고침하면 원래대로)</small></div>
    <div class="dv-seasons">${seasons.map(([k, l]) => `<button type="button" class="${curPv === k ? 'on' : ''}" onclick="previewSeason('${k}')">${l}</button>`).join('')}</div>
    <div class="dv-sec">시스템</div>
    <div class="dv-kv"><span>앱 버전</span><b>v${escHtml(APP_VERSION)}</b></div>
    <div class="dv-kv"><span>캐시</span><b id="dv-cache">…</b></div>
    <div class="dv-kv"><span>프리미엄 판정</span><b>${premiumSrc}</b></div>
    <div class="dv-kv"><span>로그인</span><b>${sbUser ? '로그인됨' : '게스트'}</b></div>
    <div class="dv-kv"><span>기기 저장소</span><b>${(bytes / 1024).toFixed(1)} KB</b></div>
    <div class="dv-kv"><span>화면 · 언어</span><b>${innerWidth}×${innerHeight} · ${escHtml(appLang)}</b></div>
    <div class="dv-kv"><span>오류 기록</span><b>${errs.length}건</b></div>
    ${errs.slice(-3).reverse().map(e => `<div class="dv-err">${escHtml(JSON.stringify(e)).slice(0, 160)}</div>`).join('')}
    <div class="dv-note">전체 사용자의 방문자 수·가입 추이·유료 전환은 Supabase 연결 뒤 서버에서 집계해 이곳에 붙입니다(<code>visit_dates</code>·<code>subscriptions</code> 테이블 기준).</div>`;
}

/* 계절 배경 미리보기 (auto = 오늘 날짜대로) */
function previewSeason(k) {
    if (k === 'auto') sessionStorage.removeItem('seasonPreview'); else sessionStorage.setItem('seasonPreview', k);
    applyDeco();
    openDevBoard();
}
