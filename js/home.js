/* 밤의 목장 — js/home.js : 홈 화면 · 이름·인사말·날짜 · 글자 크기 · 출석 스트릭 · 절기 · 히어로 묵상 · 연속 감정 인식
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   이름 설정
═══════════════════════════════════════ */
function checkFirstVisit() {
    if (localStorage.getItem('userName') === null) {
        showOverlay('overlay-name');
        later('startWelcomeParticles', () => startWelcomeParticles(), 600);
    }
}

/* 이름 저장 후 메인으로 */
function saveName() {
    const val = document.getElementById('name-input').value.trim();
    lsSet('userName', val || '');
    lsSet('appLang', appLang);
    hideOverlay('overlay-name');
    applyLang(appLang);
    setWelcome();
}

/* 이름 입력 건너뛰기 */
function skipName() {
    lsSet('userName', '');
    lsSet('appLang', appLang);
    hideOverlay('overlay-name');
    applyLang(appLang);
}

/* 설정에서 이름 바꾸기 화면 열기 */
function changeName() {
    hideOverlay('overlay-settings');
    document.getElementById('name-input').value = lsGet('userName') || '';
    setWelcomeLang(appLang);
    showOverlay('overlay-name');
    later('startWelcomeParticles', () => startWelcomeParticles(), 400);
}

/* ── 환영 문구 ── */
/* 인사말. 마음이 무거운 감정(걱정·지침·아픔, HEAVY_EMOS)을 고른 결과 화면에서는 "좋은 하루였죠" 같은 말을 피하고 위로하는 말만 쓴다 */
function setWelcome(emotion) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const name = lsGet('userName');
    const base = rand(HEAVY_EMOS.includes(emotion) && L.welcome_heavy ? L.welcome_heavy : L.welcome_msgs);
    let text;
    if (name) {
        text = appLang==='en' ? `${name}, ${base}` : appLang==='ja' ? `${name}さん、${base}` : `${name}님, ${base}`;
    } else {
        text = base;
    }
    const el = document.getElementById('welcome-text');
    el.textContent = text;
    el.classList.remove('welcome-bloom');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('welcome-bloom');
}

/* 오늘 날짜·요일 표시 */
function setDate() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const now = new Date();
    document.getElementById('date-text').textContent =
        now.toLocaleDateString(L.locale||'ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
}

/* ═══════════════════════════════════════
   글자 크기
═══════════════════════════════════════ */
function applyFont(level) {
    document.body.classList.remove('sz-lg','sz-xl');
    if (level===1) document.body.classList.add('sz-lg');
    if (level===2) document.body.classList.add('sz-xl');
    const ind = document.getElementById('fs-indicator');
    if (ind) ind.textContent = ['●','●●','●●●'][level] || '●';
    // 설정 버튼 active 상태
    ['fo-sm','fo-md','fo-lg'].forEach((id,i)=>{
        const el=document.getElementById(id);
        if(el) el.classList.toggle('active', i===level);
    });
}

/* 글자 크기 설정(0~2) 저장·적용 */
function setFont(level) { fontLevel=level; applyFont(level); lsSet('fontLevel',level); }

/* 글자 크기를 한 단계 키우기/줄이기 */
function cycleFont(dir) {
    fontLevel = Math.max(0, Math.min(2, fontLevel + dir));
    applyFont(fontLevel); lsSet('fontLevel',fontLevel);
}

/* ═══════════════════════════════════════
   스트릭 (컴팩트 체크인)
═══════════════════════════════════════ */
function updateStreak() {
    const today = todayStr();
    let dates = getVisits();
    if (!dates.includes(today)) {
        dates.push(today);
        if (sbUser && sb) sb.from('visit_dates').upsert({user_id:sbUser.id, visit_date:today},{onConflict:'user_id,visit_date'})
            .then(r => { if (r && r.error) logErr('visit.upsert', r.error); }, e => logErr('visit.upsert', e));
    }
    const cutoff = ymd(addDays(new Date(), -LOCAL_KEEP_DAYS));
    dates = dates.filter(d => d >= cutoff).sort();
    lsSet('visitDates', dates);

    const streak = calcStreak(dates);
    const pill = document.getElementById('checkin-pill');
    if (!pill) return;

    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const icon = streak >= 7 ? '🔥' : streak >= 3 ? '🌟' : '🌱';
    document.getElementById('cp-icon').textContent   = icon;
    document.getElementById('cp-text').textContent   = L.cp_text;
    document.getElementById('cp-streak').textContent = streak + L.streak_unit;
    pill.classList.remove('hidden');

    checkInstallNudge(streak);
}

/* 가장 최근 방문일부터 거슬러 올라가며 하루도 빠지지 않은 날 수 */
function calcStreak(dates) {
    const sorted = [...new Set((dates || []).filter(isYmd))].sort().reverse();
    if (!sorted.length) return 0;
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === ymd(addDays(parseYmd(sorted[i-1]), -1))) streak++; else break;
    }
    return streak;
}

/* ═══════════════════════════════════════
   절기 감지
═══════════════════════════════════════ */
function checkSeason() {
    const now=new Date(), m=now.getMonth()+1, d=now.getDate();
    let season=null, icon='';
    if (m===12&&d>=20&&d<=26)              { season='christmas'; icon='⭐'; }
    else if (m===1&&d<=5)                  { season='newyear';   icon='🌟'; }
    else if ((m===3&&d>=28)||(m===4&&d<=10)){ season='easter';   icon='🌸'; }
    else if (m===9&&d>=14&&d<=17)          { season='chuseok';   icon='🌕'; }
    if (season) {
        document.body.classList.add('season-'+season);
        document.getElementById('main-icon').textContent = icon;
        const L = LANG_DATA[appLang]||LANG_DATA.ko;
        const msg = (L.season_msg||LANG_DATA.ko.season_msg)[season]||'';
        const banner = document.getElementById('season-banner');
        banner.innerHTML = msg.replace('\n','<br>');
        banner.classList.add('visible');
    }
}


/* ── 히어로 묵상 초기화 ── */
const TEASER_POOL = [
    { t:'여호와는 나의 목자시니 내게 부족함이 없으리로다', r:'시편 23:1', te:'The LORD is my shepherd; I shall not want.', re:'Psalm 23:1' },
    { t:'수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라', r:'마태복음 11:28', te:'Come to me, all who labor and are heavy laden, and I will give you rest.', re:'Matthew 11:28' },
    { t:'내가 너희에게 평안을 끼치노니 곧 나의 평안을 너희에게 주노라', r:'요한복음 14:27', te:'Peace I leave with you; my peace I give to you.', re:'John 14:27' },
    { t:'모든 것이 협력하여 선을 이루느니라', r:'로마서 8:28', te:'All things work together for good for those who love God.', re:'Romans 8:28' },
    { t:'하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라', r:'시편 46:1', te:'God is our refuge and strength, a very present help in trouble.', re:'Psalm 46:1' },
    { t:'내가 세상 끝날까지 너희와 항상 함께 있으리라', r:'마태복음 28:20', te:'I am with you always, to the end of the age.', re:'Matthew 28:20' },
    { t:'주님의 인자하심이 영원하시며 그의 진실하심이 대대에 이르리로다', r:'시편 100:5', te:'The LORD is good; his steadfast love endures forever, and his faithfulness to all generations.', re:'Psalm 100:5' },
    { t:'너희는 마음에 근심하지 말라 하나님을 믿으니 또 나를 믿으라', r:'요한복음 14:1', te:'Let not your hearts be troubled. Believe in God; believe also in me.', re:'John 14:1' },
    { t:'여호와를 앙망하는 자는 새 힘을 얻으리니', r:'이사야 40:31', te:'They who wait for the LORD shall renew their strength.', re:'Isaiah 40:31' },
    { t:'주의 말씀은 내 발에 등이요 내 길에 빛이니이다', r:'시편 119:105', te:'Your word is a lamp to my feet and a light to my path.', re:'Psalm 119:105' },
    { t:'사랑은 오래 참고 사랑은 온유하며 시기하지 아니하며', r:'고린도전서 13:4', te:'Love is patient and kind; love does not envy or boast', re:'1 Corinthians 13:4' },
    { t:'항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라', r:'데살로니가전서 5:16-18', te:'Rejoice always, pray without ceasing, give thanks in all circumstances.', re:'1 Thessalonians 5:16-18' },
];

/* 메인의 "오늘의 묵상" 한 구절 고르기 (돌아가며 중복 없이) */
function initHeroTeaser() {
    const storeKey = 'shownTeaser';
    let shown = lsArr(storeKey);
    const allIdx = TEASER_POOL.map((_,i)=>i);
    let avail = allIdx.filter(i=>!shown.includes(i));
    if (!avail.length) { shown=[]; avail=allIdx; lsSet(storeKey,[]); }
    const picked = avail[Math.floor(Math.random()*avail.length)];
    lsSet(storeKey, [...shown, picked]);
    const item = TEASER_POOL[picked];
    const tEl = document.getElementById('ht-text');
    const rEl = document.getElementById('ht-ref');
    const useEn = appLang==='en' && item.te;
    if (tEl) tEl.textContent = `"${useEn ? item.te : item.t}"`;
    if (rEl) rEl.textContent = `— ${useEn ? item.re : item.r}`;
}

/* ═══════════════════════════════════════
   연속 감정 인식 — moodHistory 기반, AI 없이 "나를 아는" 문장
═══════════════════════════════════════ */
const EMO_CATEGORY = { 걱정:'neg', 지침:'neg', 아픔:'neg', 감사:'pos', 평안:'pos', 기도:'pray' };

/* 오늘 감정과 같은 결(카테고리)이 며칠째 이어지는지 (오늘 포함) */
function calcEmotionRun() {
    const hist = getMoods();
    if (!hist.length) return null;
    const today = todayStr();
    if (hist[0].date !== today) return null;
    const cat = EMO_CATEGORY[hist[0].emotion];
    if (!cat) return null;
    // 날짜별 최신 감정 (hist는 최신순)
    const byDay = {};
    hist.forEach(h => { if (!(h.date in byDay)) byDay[h.date] = EMO_CATEGORY[h.emotion]; });
    let n = 0;
    for (let d = new Date(); n <= LOCAL_KEEP_DAYS && byDay[ymd(d)] === cat; d = addDays(d, -1)) n++;
    return { cat, n };
}

/* 같은 계열 감정이 이어지면 결과 화면에 "n일째 …" 한 줄 */
function renderEmotionPattern() {
    const el = document.getElementById('r-pattern');
    if (!el) return;
    el.classList.add('hidden');
    const run = calcEmotionRun();
    if (!run || run.n < 2) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    let msg = null;
    if (run.cat === 'neg')  msg = run.n === 2 ? L.pat_neg_2 : L.pat_neg_n;
    if (run.cat === 'pos')  msg = L.pat_pos_n;
    if (run.cat === 'pray') msg = L.pat_pray_n;
    if (!msg) return;
    el.textContent = msg.replace('{n}', run.n);
    el.classList.remove('hidden');
}
