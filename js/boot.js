/* 밤의 목장 — js/boot.js : 앱 시작 (맨 마지막에 불러옴)
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다)
   여기서는 "무엇을 어떤 순서로 켜는가"만 정합니다. 각 단계는 safe()로 감싸서,
   한 단계가 실패해도 다음 단계는 그대로 진행됩니다 (예: 절기 배너가 고장 나도 로그인·언어는 켜짐). */

function init() {
    safe('manifest', () => {
        // file:// 환경에서 manifest CORS 오류 방지: http/https일 때만 동적 추가
        if (location.protocol === 'file:' || document.querySelector('link[rel="manifest"]')) return;
        const ml = document.createElement('link');
        ml.rel = 'manifest'; ml.href = 'manifest.json';
        document.head.appendChild(ml);
    });
    safe('settings', () => {
        const lang = lsGet('appLang');
        appLang = LANG_DATA[lang] ? lang : 'ko';
        fontLevel = lsInt('fontLevel', 0, 2, 0);
        const verEl = document.getElementById('app-version');
        if (verEl) verEl.textContent = 'v' + APP_VERSION;
    });
    safe('generateStars', () => generateStars());
    safe('applyFont', () => applyFont(fontLevel));
    safe('theme', () => restoreTheme());
    safe('checkFirstVisit', () => checkFirstVisit());
    safe('updateStreak', () => updateStreak());
    safe('initHeroTeaser', () => initHeroTeaser());
    safe('checkSeason', () => checkSeason());
    safe('applyLang', () => applyLang(appLang));
    safe('registerSW', () => registerSW());
    safe('installBanner', () => { if (isIOS() && !isStandalone()) scheduleInstallBanner(); });
    safe('billingReturn', () => captureBillingReturn());   // 결제창에서 돌아온 주소 정리 — 반드시 Supabase 시작보다 먼저
    safe('initSupabase', () => initSupabase());
    safe('billing.resume', () => resumeBilling());           // 결제 실패·취소 안내 (성공은 로그인 확인 뒤 auth.js에서)
}

document.addEventListener('DOMContentLoaded', () => {
    safe('init', init);
    safe('playIntro', () => playIntro());
    // 어떤 이유로든 오프닝이 끝나지 못했으면 화면을 가린 채 두지 않는다
    later('introGuard', () => { const i = document.getElementById('night-intro'); if (i) i.classList.add('gone'); }, 9000);
    safe('restoreBgMusic', () => restoreBgMusic());
    safe('nameEnter', () => {
        document.getElementById('name-input').addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });
    });
    safe('restoreDevMode', () => restoreDevMode());
    // "출시 알림 받기"를 눌렀던 사람에게는 판매가 열린 뒤 한 번 프리미엄 안내를 보여 준다 (약속한 알림)
    later('launchNotice', () => {
        if (paymentsOn() && lsGet('premiumInterest') === true && !lsGet('premiumNotified') && !isPremium()) {
            lsSet('premiumNotified', true); openPremiumModal();
        }
    }, 9500);
    // Supabase 라이브러리는 따로(async) 받는다. init() 때 아직 안 왔으면, 도착했을 때 스스로 initSupabase()를 부른다 (index.html 맨 아래)
    window.__booted = true;
});
