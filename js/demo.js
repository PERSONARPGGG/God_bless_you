/* 밤의 목장 — js/demo.js : 시연·개발자 전용 (개발자 모드 · 프리미엄 체험 · 체험 페르소나 · 데모 데이터)
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

function loadPersona(type, btn) {
    const data = PERSONA_DATA[type];
    if (!data) return;
    renderDashboard(data, data[0].date);   // 체험 데이터가 속한 주를 기준으로 그림 (달력·리포트는 실제 기록 그대로)
    document.querySelectorAll('.persona-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const names = {male:'직장인 준호',female:'워킹맘 수진',housewife:'주부 은혜',pastor:'김요한 목사',foreigner:'유학생 안나'};
    toast(`✦ ${names[type]||type} 체험 데이터`);
}

/* 데모 데이터 주입 (실제 데이터 있으면 건너뜀) */
function injectDemoData() {
    if (getMoods().length > 0) return;
    const weekStart = parseYmd(getWeekRange().startStr);
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
    // 목록은 최신순이어야 하므로 토요일부터 거꾸로
    const demo = allDays.map(d => ({ date: ymd(addDays(weekStart, d.dow)), emotion: d.emotion,
                 topic: d.topic, need: d.need, emoji: E_EMOJI[d.emotion] || '', diary: d.diary })).reverse();
    // 회고 카드("1년 전 오늘 밤") 시연용 — 목록은 최신순이므로 맨 뒤에 붙임
    demo.push({ date: ymd(monthsAgo(1)), emotion:'감사', topic:'가족', need:'쉼', emoji:E_EMOJI['감사'],
                diary:'아이가 먼저 손을 잡아주었다. 그걸로 충분한 하루.' });
    demo.push({ date: ymd(monthsAgo(12)), emotion:'걱정', topic:'일', need:'힘', emoji:E_EMOJI['걱정'],
                diary:'내일 일이 두렵지만, 오늘 밤은 맡겨드리고 잔다.' });
    lsSet('moodHistory', demo);
}

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
                if (isDevMode()) { localStorage.removeItem('devMode'); sessionStorage.removeItem('devMode'); setDevUI(false); toast('🔒 개발자 모드 해제됨'); return; }
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
        onPremiumChanged();
        return;
    }
    lsSet('devMode', '1'); // 영속 — 새 세션에도 유지, 로그인 게이트 스킵
    sessionStorage.setItem('devMode', '1');
    setDevUI(true);
    injectDemoData();
    safe('demo.render', () => { renderOnThisDay(); refreshVaultIfOpen(); });
    // 개발자 모드 진입 시 배경 음악 자동 재생 (30%)
    const mt = document.getElementById('music-toggle-input');
    if (mt && !mt.checked) { mt.checked = true; toggleBgMusic(true); }
    toast('🔓 개발자 모드 + 데모 데이터 적용');
}

/* 자물쇠 아이콘 탭 → 프리미엄 체험 토글 (개발자 비밀번호 7501, 시연용·결제 미연동)
   이미 체험 중이면 비번 없이 바로 해제 (달 아이콘 devMode 토글과 동일 패턴) */
function devPremiumTap(ev) {
    if (!DEMO_UNLOCK) return; // 체험 비활성화 시 일반 탭처럼 프리미엄 안내 모달이 열림
    ev.stopPropagation();
    if (lsGet('premiumActive') === true) {
        lsSet('premiumActive', false);
        toast('🔒 프리미엄 체험 모드 OFF');
        onPremiumChanged();
        return;
    }
    openDevPwModal('premium');
}

/* 개발자 모드에서만 보이는 것(나의 이야기의 체험 데이터 선택) 표시/숨김 */
function setDevUI(on) {
    const box = document.querySelector('.persona-demo');
    if (box) box.classList.toggle('hidden', !on);
}
/* 앱 시작 시: 개발자 모드였으면 복원 (매번 비밀번호 입력 불필요) */
function restoreDevMode() { setDevUI(isDevMode()); }
