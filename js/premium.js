/* 밤의 목장 — js/premium.js : 개발자 모드 · 대시보드 · 연속 감정 인식 · 프리미엄 경계
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ══════════════════════════════════════════
   개발자 모드 + 감정 통계 대시보드
   isDevMode() = 로그인 게이트 전부 스킵 (테스트용), localStorage 영속
══════════════════════════════════════════ */
function isDevMode() {
    // lsGet은 JSON.parse라 '1'이 숫자 1로 돌아옴 — String으로 비교
    return String(lsGet('devMode')) === '1' || sessionStorage.getItem('devMode') === '1';
}

/* 달 5번 탭 → 비밀번호 모달 (개발자 모드 중이면 해제) */
(function(){
    let tapCount = 0, tapTimer;
    document.addEventListener('DOMContentLoaded', () => {
        const moon = document.getElementById('main-icon');
        if (!moon) return;
        moon.addEventListener('click', () => {
            tapCount++;
            clearTimeout(tapTimer);
            tapTimer = setTimeout(() => { tapCount = 0; }, 3000);
            if (tapCount >= 5) {
                tapCount = 0;
                clearTimeout(tapTimer);
                if (isDevMode()) { lsSet('devMode', null); sessionStorage.removeItem('devMode'); toast('🔒 개발자 모드 해제됨'); return; }
                openDevPwModal('dev');
            }
        });
    });
})();

/* 비밀번호 모달 열기 — purpose: 'dev'(개발자 모드) | 'premium'(프리미엄 체험) */
let _devPwPurpose = 'dev';
function openDevPwModal(purpose) {
    _devPwPurpose = purpose;
    const labels = {
        dev: '🔒 개발자 모드<br>비밀번호를 입력하세요',
        premium: '💎 프리미엄 체험 모드<br>비밀번호를 입력하세요',
    };
    document.getElementById('devpw-label').innerHTML = labels[purpose] || labels.dev;
    const m = document.getElementById('devpw-modal');
    const inp = document.getElementById('devpw-input');
    m.classList.remove('hidden');
    inp.value = '';
    setTimeout(() => inp.focus(), 100);
}

function checkDevPw() {
    const inp = document.getElementById('devpw-input');
    if (inp.value !== '7501') {
        inp.value = '';
        inp.placeholder = '다시 입력하세요';
        inp.focus();
        return;
    }
    document.getElementById('devpw-modal').classList.add('hidden');
    if (_devPwPurpose === 'premium') {
        lsSet('premiumActive', true);
        toast('💎 프리미엄 체험 모드 ON');
        renderDbMonthly();
        updateThemeLocks();
        renderOnThisDay();
        return;
    }
    lsSet('devMode', '1'); // 영속 — 새 세션에도 유지, 로그인 게이트 스킵
    sessionStorage.setItem('devMode', '1');
    const btn = document.getElementById('btn-dashboard');
    if (btn) btn.classList.remove('hidden');
    const btnTop = document.getElementById('btn-dashboard-top');
    if (btnTop) btnTop.classList.remove('hidden');
    injectDemoData();
    // 개발자 모드 진입 시 배경 음악 자동 재생 (30%)
    const mt = document.getElementById('music-toggle-input');
    if (mt && !mt.checked) { mt.checked = true; toggleBgMusic(true); }
    toast('🔓 개발자 모드 + 데모 데이터 적용');
}

/* ═══════════════════════════════════════
   연속 감정 인식 — moodHistory 기반, AI 없이 "나를 아는" 문장
═══════════════════════════════════════ */
const EMO_CATEGORY = { 걱정:'neg', 지침:'neg', 아픔:'neg', 감사:'pos', 평안:'pos', 기도:'pray' };

/* 오늘 감정과 같은 결(카테고리)이 며칠째 이어지는지 (오늘 포함) */
function calcEmotionRun() {
    const hist = lsGet('moodHistory') || [];
    if (!hist.length) return null;
    const today = todayStr();
    if (hist[0].date !== today) return null;
    const cat = EMO_CATEGORY[hist[0].emotion];
    if (!cat) return null;
    // 날짜별 최신 감정 (hist는 최신순)
    const byDay = {};
    hist.forEach(h => { if (!(h.date in byDay)) byDay[h.date] = EMO_CATEGORY[h.emotion]; });
    let n = 0;
    const d = new Date(today);
    for (;;) {
        const ds = d.toISOString().slice(0,10);
        if (byDay[ds] === cat) { n++; d.setDate(d.getDate()-1); }
        else break;
    }
    return { cat, n };
}

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

/* ═══════════════════════════════════════
   프리미엄 (무료/유료 경계)
   무료: 묵상 플로우 전체·보관함·스트릭·기록 최근 30일
   유료(₩1,900/월): 무제한 보관·PDF 내보내기·월간 리포트·묵상 캘린더
═══════════════════════════════════════ */
/* 프리미엄 자격의 기준은 서버(Supabase subscriptions 테이블, 본인 행 읽기 전용)다.
   결제 완료 웹훅만 그 행을 쓸 수 있으므로 브라우저에서 값을 바꿔서는 열리지 않는다.
   DEMO_UNLOCK: 시연용 비밀번호 체험 허용 — 실결제를 여는 날 false로 바꿀 것. */
const DEMO_UNLOCK = true;
let serverPremium = false;
function isPremium() { return serverPremium || (DEMO_UNLOCK && lsGet('premiumActive') === true); }

async function refreshEntitlement() {
    let active = false;
    if (sbUser && sb) {
        try {
            const { data, error } = await sb.from('subscriptions')
                .select('status,current_period_end').eq('user_id', sbUser.id).maybeSingle();
            if (!error && data && data.status === 'active' &&
                (!data.current_period_end || new Date(data.current_period_end) > new Date())) active = true;
        } catch (e) {}
    }
    serverPremium = active;
    // 시작 시점에는 자격 확인 전이라 프리미엄 테마가 기본으로 돌아가 있음 → 확인되면 저장된 테마 복원
    if (active) { const t = lsGet('appTheme'); if (t) applyTheme(t); }
    updateThemeLocks();
    renderOnThisDay();
}

/* 자물쇠 아이콘 탭 → 프리미엄 체험 토글 (개발자 비밀번호 7501, 시연용·결제 미연동)
   이미 체험 중이면 비번 없이 바로 해제 (달 아이콘 devMode 토글과 동일 패턴) */
function devPremiumTap(ev) {
    if (!DEMO_UNLOCK) return; // 체험 비활성화 시 일반 탭처럼 프리미엄 안내 모달이 열림
    ev.stopPropagation();
    if (lsGet('premiumActive') === true) {
        lsSet('premiumActive', false);
        toast('🔒 프리미엄 체험 모드 OFF');
        renderDbMonthly();
        updateThemeLocks();
        renderOnThisDay();
        return;
    }
    openDevPwModal('premium');
}

function openPremiumModal() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    document.getElementById('pm-title').textContent = L.pm_title;
    document.getElementById('pm-desc').innerHTML = L.pm_desc.replace(/\n/g,'<br>');
    document.getElementById('pm-feats').innerHTML = [L.pm_f1,L.pm_f2,L.pm_f3,L.pm_f4,L.pm_f5,L.pm_f6].map(f=>`<li>${f}</li>`).join('');
    document.getElementById('pm-price').textContent = L.pm_price;
    document.getElementById('pm-cta').textContent = lsGet('premiumInterest') ? '✓ ' + L.pm_cta : L.pm_cta;
    document.getElementById('pm-close').textContent = L.pm_close;
    document.getElementById('premium-modal').classList.remove('hidden');
}
function closePremiumModal() { document.getElementById('premium-modal').classList.add('hidden'); }
function premiumInterest() {
    lsSet('premiumInterest', true);
    toast((LANG_DATA[appLang]||LANG_DATA.ko).pm_cta_done);
    closePremiumModal();
}

/* ── 별똥별 연출 ── */
function spawnShootingStar() {
    const s = document.createElement('div');
    s.className = 'shooting-star';
    s.style.top  = (4 + Math.random()*28) + '%';
    s.style.left = (5 + Math.random()*40) + '%';
    s.style.setProperty('--ang', (18 + Math.random()*16) + 'deg');
    s.style.setProperty('--sdur', (1 + Math.random()*0.8) + 's');
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 2200);
}
/* 배경 앰비언트: 20~50초 간격으로 하나씩 */
(function(){
    const loop = () => setTimeout(() => {
        if (!document.hidden) spawnShootingStar();
        loop();
    }, 20000 + Math.random()*30000);
    loop();
})();

/* ── 만년필 타이핑 효과 ── */
function typewriterVerse(text) {
    const el = document.getElementById('r-verse');
    if (!el) return;
    el.textContent = '';
    el.classList.add('typing');
    const chars = [...text];
    chars.forEach((char, i) => {
        setTimeout(() => {
            el.textContent += char;
            if (char !== ' ' && i % 3 === 0) playSfx('write'); // 글씨 쓰는 사각임
            if (i === chars.length - 1) {
                el.classList.remove('typing');
                const card = el.closest('.card');
                if (card) { card.classList.add('verse-glow'); setTimeout(() => card.classList.remove('verse-glow'), 2300); }
            }
        }, 500 + i * 26);
    });
}

/* ── 밤의 목장 오프닝: 양이 걸어와 달빛 아래 잠들다 (탭하면 스킵) ── */
function playIntro() {
    const intro = document.getElementById('night-intro');
    if (!intro || sessionStorage.getItem('coverShown') ||
        matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (intro) intro.classList.add('gone');
        return;
    }
    sessionStorage.setItem('coverShown', '1');
    const sheep = document.getElementById('intro-sheep');
    const timers = [];
    let ended = false;
    const done = () => {
        if (ended) return; ended = true;
        timers.forEach(clearTimeout);
        intro.classList.add('fading');
        setTimeout(() => intro.classList.add('gone'), 900);
    };
    intro.addEventListener('pointerdown', done);
    sheep.classList.add('walking');
    requestAnimationFrame(() => intro.classList.add('walkin'));   // 걸어 들어옴
    timers.push(setTimeout(() => sheep.classList.remove('walking'), 2150)); // 달빛 아래 멈춤
    timers.push(setTimeout(() => intro.classList.add('lit'), 2250));        // 달빛이 비춤
    timers.push(setTimeout(() => { sheep.classList.add('sitting'); intro.classList.add('asleep'); }, 2750)); // 앉아 잠듦
    timers.push(setTimeout(() => intro.classList.add('brand'), 3300));      // 밤의 목장 · 오늘은 어땠나요?
    timers.push(setTimeout(done, 5100));
}
