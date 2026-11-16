/* 밤의 목장 — js/auth.js : 앱 초기화 · Supabase 인증/동기화
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   초기화
═══════════════════════════════════════ */
function init() {
    // file:// 환경에서 manifest CORS 오류 방지: http/https일 때만 동적 추가
    if (location.protocol !== 'file:') {
        const ml = document.createElement('link');
        ml.rel = 'manifest'; ml.href = 'manifest.json';
        document.head.appendChild(ml);
    }
    generateStars();
    const verEl = document.getElementById('app-version');
    if (verEl) verEl.textContent = 'v' + APP_VERSION;
    appLang  = lsGet('appLang')  || 'ko';
    fontLevel = parseInt(lsGet('fontLevel') || '0');
    applyFont(fontLevel);
    { let t0 = lsGet('appTheme') || 'night';
      if (PREMIUM_THEMES.includes(t0) && !isPremium()) t0 = 'night';
      applyTheme(t0);
      updateThemeLocks(); }
    checkFirstVisit();
    updateStreak();
    initHeroTeaser();
    checkSeason();
    applyLang(appLang);
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        navigator.serviceWorker.register('sw.js').then(reg => {
            // 페이지 로드 시 즉시 업데이트 확인 (기본 24시간 간격 보완)
            reg.update();
            reg.addEventListener('updatefound', () => {
                const newSW = reg.installing;
                newSW.addEventListener('statechange', () => {
                    // 기존 SW 위에 새 SW가 설치 완료된 경우에만 배너 표시
                    if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                        document.getElementById('update-banner').classList.remove('hidden');
                    }
                });
            });
        }).catch(()=>{});
        // SKIP_WAITING 후 새 SW가 활성화되면 자동 새로고침
        // 단, 첫 설치(controller 없던 상태)에서는 리로드하지 않음 — 인트로가 끊기고 불필요한 재로딩
        let refreshing = false, hadController = !!navigator.serviceWorker.controller;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!hadController) { hadController = true; return; }
            if (!refreshing) { refreshing = true; location.reload(); }
        });
    }
    if (isIOS() && !isStandalone()) scheduleInstallBanner();
    initSupabase();
}

/* ═══════════════════════════════════════
   Supabase 인증 / 동기화
═══════════════════════════════════════ */
function initSupabase() {
    if (location.protocol === 'file:' || typeof supabase === 'undefined') return;
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    sb.auth.onAuthStateChange((event, session) => {
        sbUser = session?.user || null;
        updateAuthUI();
        if (event === 'SIGNED_IN') migrateLocalToServer();
    });
    sb.auth.getSession().then(({data:{session}}) => {
        sbUser = session?.user || null;
        updateAuthUI();
    });
}

/* 로그인 = 기록이 서버로 올라가는 시점 → 처음 한 번은 동의(처리방침·민감정보·만 14세 이상)를 먼저 받는다 */
async function loginWithGoogle() {
    if (!sb) return;
    if (!hasConsent()) { openConsent(); return; }
    await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: location.origin + location.pathname }
    });
}

async function sbLogout() {
    if (!sb) return;
    await sb.auth.signOut();
    sbUser = null;
    updateAuthUI();
    toast((LANG_DATA[appLang]||LANG_DATA.ko).logout_done);
}

function updateAuthUI() {
    const rowLogin  = document.getElementById('row-login');
    const rowLogout = document.getElementById('row-logout');
    const rowDelete = document.getElementById('row-delete');
    const emailEl   = document.getElementById('auth-email');
    const privEl    = document.getElementById('privacy-text');
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!rowLogin) return;
    if (sbUser) {
        rowLogin.style.display  = 'none';
        rowLogout.style.display = 'flex';
        if (rowDelete) rowDelete.style.display = 'flex';
        if (emailEl) emailEl.textContent = sbUser.email;
        if (privEl) privEl.innerHTML = L.privacy_cloud;
    } else {
        rowLogin.style.display  = 'flex';
        rowLogout.style.display = 'none';
        if (rowDelete) rowDelete.style.display = 'none';
        if (privEl) privEl.innerHTML = L.privacy;
    }
    // 로그인 상태가 바뀌면 프리미엄 자격과 회고 카드를 다시 확인
    refreshEntitlement();
}

async function migrateLocalToServer() {
    if (!sbUser || !sb) return;
    const {data: existing} = await sb.from('mood_history').select('id').limit(1);
    if (existing && existing.length > 0) {
        toast('클라우드 데이터를 불러왔어요 ☁️');
        return;
    }
    const moods = lsGet('moodHistory') || [];
    if (moods.length) {
        const rows = moods.map(m => ({
            user_id: sbUser.id, date: m.date,
            emotion: m.emotion, topic: m.topic,
            need: m.need, diary_text: m.diary || null
        }));
        await sb.from('mood_history').insert(rows);
    }
    const verses = lsGet('savedVerses') || [];
    if (verses.length) {
        const rows = verses.map(v => ({
            user_id: sbUser.id, verse_text: v.verse,
            verse_ref: v.ref, emotion: v.context
        }));
        await sb.from('saved_verses').insert(rows);
    }
    const dates = lsGet('visitDates') || [];
    if (dates.length) {
        const rows = dates.map(d => ({user_id: sbUser.id, visit_date: d}));
        await sb.from('visit_dates').upsert(rows, {onConflict: 'user_id,visit_date'});
    }
    await sb.from('profiles').upsert({
        id: sbUser.id, name: lsGet('userName') || '',
        lang: lsGet('appLang') || 'ko',
        theme: lsGet('appTheme') || 'night',
        font_level: parseInt(lsGet('fontLevel') || '0')
    });
    toast('기존 데이터를 클라우드에 저장했어요 ☁️');
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

function initHeroTeaser() {
    const storeKey = 'shownTeaser';
    let shown = lsGet(storeKey) || [];
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

/* ── 별 생성 ── */
function generateStars() {
    const frag = document.createDocumentFragment();
    for (let i=0;i<65;i++) {
        const el=document.createElement('div'); el.className='star';
        const big=Math.random()<.12, sz=big?(Math.random()*1.8+2.4):(Math.random()*1.4+0.5);
        el.style.cssText=`left:${(Math.random()*100).toFixed(2)}%;top:${(Math.random()*100).toFixed(2)}%;width:${sz.toFixed(2)}px;height:${sz.toFixed(2)}px;--dur:${(Math.random()*3+2).toFixed(1)}s;--delay:${(Math.random()*5).toFixed(1)}s;--mop:${(Math.random()*.45+.5).toFixed(2)};`;
        frag.appendChild(el);
    }
    document.getElementById('stars').appendChild(frag);
}
