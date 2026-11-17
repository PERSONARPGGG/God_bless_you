/* 밤의 목장 — js/premium.js : 프리미엄 자격 판정 · 안내 모달
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다)

   다른 파일은 isPremium() 하나만 묻는다. "왜 프리미엄인지"(서버 구독·시연 체험)는 이 파일만 안다.
   자격이 바뀌는 모든 경우(로그인·로그아웃·구독 확인·시연 토글)는 onPremiumChanged()를 거쳐
   화면을 한꺼번에 다시 맞춘다 — 결제를 붙일 때도 결제 완료 후 refreshEntitlement()만 부르면 된다. */

/* ═══════════════════════════════════════
   프리미엄 (무료/유료 경계)
   무료: 묵상 플로우 전체·보관함·스트릭·최근 60일 기록·한 달 전 회고
   유료(₩1,900/월): 프리미엄 테마·월간 리포트·PDF 일기장·3개월 이상 지난 회고
═══════════════════════════════════════ */
/* 프리미엄 자격의 기준은 서버(Supabase subscriptions 테이블, 본인 행 읽기 전용)다.
   결제 완료 웹훅만 그 행을 쓸 수 있으므로 브라우저에서 값을 바꿔서는 열리지 않는다.
   DEMO_UNLOCK: 시연용 비밀번호 체험 허용 — 실결제를 여는 날 false로 바꿀 것. */
const DEMO_UNLOCK = true;
let serverPremium = false;
function isPremium() { return serverPremium || (DEMO_UNLOCK && lsGet('premiumActive') === true); }

/* 구독 한 줄이 "지금 프리미엄인가"
   · active   : 이용 중 (기간 끝이 비어 있으면 운영자가 직접 준 무기한 이용권)
   · canceled : 해지했지만 이미 결제한 기간이 남아 있으면 그때까지 이용 */
function subscriptionIsActive(row, now) {
    if (!row) return false;
    const end = row.current_period_end ? new Date(row.current_period_end) : null;
    const inPeriod = !!end && !isNaN(end) && end > (now || new Date());
    if (row.status === 'active') return !end || inPeriod;
    if (row.status === 'canceled') return inPeriod;
    return false;
}

let _entSeq = 0;
async function refreshEntitlement() {
    const seq = ++_entSeq;
    let active = false;
    if (sbUser && sb) {
        try {
            const { data, error } = await sb.from('subscriptions')
                .select('status,current_period_end').eq('user_id', sbUser.id).maybeSingle();
            if (!error) active = subscriptionIsActive(data);
        } catch (e) { logErr('entitlement', e); }
    }
    if (seq !== _entSeq) return; // 더 최근 확인이 진행 중이면 그 결과에 맡김
    serverPremium = active;
    onPremiumChanged();
}

/* 프리미엄 여부에 따라 달라지는 화면을 모두 다시 맞춘다 */
function onPremiumChanged() {
    safe('premium.theme',   () => restoreTheme());        // 자격이 없으면 프리미엄 테마 → 기본, 있으면 저장된 테마로
    safe('premium.monthly', () => renderDbMonthly());     // 대시보드 월간 리포트 잠금/해제
    safe('premium.vault',   () => refreshVaultIfOpen());  // 보관함 상단 안내
    safe('premium.otd',     () => renderOnThisDay());     // 회고 카드 잠금/해제
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
