/* 밤의 목장 — js/billing.js : 프리미엄 구독 결제 (토스페이먼츠 자동결제) · 해지 · 유료 약관
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다)

   브라우저가 하는 일은 두 가지뿐이다: ① 토스 결제창을 띄워 카드를 등록받고 ② 돌아온 인증값을 우리 서버(/api/billing-confirm)에 넘긴다.
   금액을 정하고 실제로 결제하고 구독을 기록하는 일은 전부 서버가 한다 (lib/server.mjs). 비밀 키는 여기에 없다.
   PAYMENTS.on 이 false 인 동안에는 이 파일의 화면이 전혀 나타나지 않고, 프리미엄 안내는 "출시 알림 받기" 그대로다. */

const BILL_TEXT = {
    ko: {
        bl_monthly:'월간 · ₩1,900', bl_yearly:'연간 · ₩19,000 (2달 무료)',
        bl_notice:'해지하기 전까지 같은 요금으로 자동 결제돼요. 언제든 해지할 수 있고, 해지해도 결제한 기간이 끝날 때까지 이용할 수 있어요.',
        bl_agree:'이용약관의 유료 서비스 조건(자동 갱신·해지·환불)을 확인했고 동의합니다',
        bl_terms:'약관 보기', bl_start:'구독 시작하기', bl_login:'로그인하고 구독하기',
        bl_active:'프리미엄 이용 중', bl_next:'다음 결제일 {d}', bl_until:'{d}까지 이용할 수 있어요 (해지됨)',
        bl_forever:'기간 제한 없는 이용권', bl_cancel:'구독 해지', bl_resume:'다시 구독하기',
        bl_cancel_confirm:'구독을 해지할까요? 다음 결제부터 청구되지 않고, {d}까지는 계속 이용할 수 있어요.',
        bl_canceled:'해지됐어요. {d}까지는 그대로 이용할 수 있어요.',
        bl_started:'프리미엄이 시작됐어요. 함께해 주셔서 감사해요 🙏', bl_resumed:'구독이 다시 이어져요.',
        bl_working:'결제를 확인하는 중…', bl_fail:'결제가 완료되지 않았어요. 카드를 확인하고 다시 시도해 주세요.',
        bl_user_cancel:'결제를 취소했어요.', bl_error:'잠시 후 다시 시도해 주세요.',
        bl_need_login:'결제를 마치려면 같은 계정으로 로그인해 주세요.',
        row_sub:'프리미엄 구독', row_sub_btn:'관리', row_sub_none:'구독하지 않음',
    },
    en: {
        bl_monthly:'Monthly · ₩1,900', bl_yearly:'Yearly · ₩19,000 (2 months free)',
        bl_notice:'You are charged the same price automatically until you cancel. Cancel anytime; you keep access until the paid period ends.',
        bl_agree:'I have read and agree to the paid service terms (auto-renewal, cancellation, refunds)',
        bl_terms:'View terms', bl_start:'Start subscription', bl_login:'Sign in to subscribe',
        bl_active:'Premium active', bl_next:'Next charge on {d}', bl_until:'Access until {d} (canceled)',
        bl_forever:'Access with no end date', bl_cancel:'Cancel subscription', bl_resume:'Subscribe again',
        bl_cancel_confirm:'Cancel your subscription? You will not be charged again and keep access until {d}.',
        bl_canceled:'Canceled. You keep access until {d}.',
        bl_started:'Premium has started. Thank you for being here 🙏', bl_resumed:'Your subscription continues.',
        bl_working:'Confirming payment…', bl_fail:'The payment was not completed. Please check your card and try again.',
        bl_user_cancel:'Payment canceled.', bl_error:'Please try again in a moment.',
        bl_need_login:'Please sign in with the same account to finish the payment.',
        row_sub:'Premium subscription', row_sub_btn:'Manage', row_sub_none:'Not subscribed',
    },
    ja: {
        bl_monthly:'月額 · ₩1,900', bl_yearly:'年額 · ₩19,000（2か月無料）',
        bl_notice:'解約するまで同じ料金で自動的に決済されます。いつでも解約でき、解約後も支払い済みの期間が終わるまでご利用いただけます。',
        bl_agree:'利用規約の有料サービス条件（自動更新・解約・返金）を確認し、同意します',
        bl_terms:'規約を見る', bl_start:'購読を始める', bl_login:'ログインして購読する',
        bl_active:'プレミアム利用中', bl_next:'次回決済日 {d}', bl_until:'{d}までご利用いただけます（解約済み）',
        bl_forever:'期限のない利用権', bl_cancel:'購読を解約', bl_resume:'もう一度購読する',
        bl_cancel_confirm:'購読を解約しますか？次回から請求されず、{d}まではそのままご利用いただけます。',
        bl_canceled:'解約しました。{d}まではそのままご利用いただけます。',
        bl_started:'プレミアムが始まりました。ともにいてくださり感謝します 🙏', bl_resumed:'購読が続きます。',
        bl_working:'決済を確認しています…', bl_fail:'決済が完了しませんでした。カードを確認してもう一度お試しください。',
        bl_user_cancel:'決済をキャンセルしました。', bl_error:'しばらくしてからもう一度お試しください。',
        bl_need_login:'決済を完了するには同じアカウントでログインしてください。',
        row_sub:'プレミアム購読', row_sub_btn:'管理', row_sub_none:'未購読',
    },
};
Object.keys(BILL_TEXT).forEach(k => Object.assign(LANG_DATA[k], BILL_TEXT[k]));

const TOSS_SDK_URL = 'https://js.tosspayments.com/v2/standard';

/* 결제를 실제로 쓸 수 있는 상태인가 (스위치가 켜져 있고, 클라이언트 키가 있고, 웹에서 열었을 때) */
function paymentsOn() { return !!(PAYMENTS.on && PAYMENTS.clientKey && location.protocol !== 'file:'); }

/* 우리 서버 함수 부르기. 돌려주는 값: { ok, status, code, message, …서버가 준 값 } — 절대 예외를 던지지 않는다 */
async function apiPost(name, body) {
    try {
        if (!sb || !sbUser) return { ok: false, status: 401, code: 'NO_LOGIN' };
        const { data } = await sb.auth.getSession();
        const token = data && data.session && data.session.access_token;
        if (!token) return { ok: false, status: 401, code: 'NO_LOGIN' };
        const res = await fetch('/api/' + name, { method: 'POST',
            headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify(body || {}) });
        const out = await res.json().catch(() => null);
        return { ...(out || {}), ok: res.ok && !!(out && out.ok), status: res.status };
    } catch (e) {
        logErr('api.' + name, e);
        return { ok: false, status: 0, code: 'NETWORK' };
    }
}

function billDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString((LANG_DATA[appLang]||LANG_DATA.ko).locale || 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ═══════════════════════════════════════
   프리미엄 안내 모달 안의 결제 영역 (openPremiumModal이 부름)
═══════════════════════════════════════ */
let _billPlan = 'monthly', _billBusy = false;
function renderPayBox() {
    const box = document.getElementById('pm-pay'), cta = document.getElementById('pm-cta');
    if (!box || !cta) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!paymentsOn()) {   // 판매 전: "출시 알림 받기" 그대로
        box.classList.add('hidden'); box.innerHTML = '';
        cta.classList.remove('hidden'); cta.onclick = premiumInterest;
        return;
    }
    const sub = serverSub, active = subscriptionIsActive(sub);
    const terms = `<button type="button" class="bl-link" onclick="openPolicy('terms')">${escHtml(L.bl_terms)}</button>`;
    box.classList.remove('hidden');
    if (active) {
        const end = sub.current_period_end;
        const line = !end ? L.bl_forever : fillText(sub.status === 'canceled' ? L.bl_until : L.bl_next, { d: billDate(end) });
        box.innerHTML = `<div class="bl-status"><b>${escHtml(L.bl_active)}</b><br>${escHtml(line)}</div>` +
            (sub.status === 'canceled'
                ? billPlanHtml(L) + `<label class="bl-agree"><input type="checkbox" id="bl-agree" onchange="updatePayBtn()"><span>${escHtml(L.bl_agree)}</span></label>${terms}`
                : (end ? `<button type="button" class="bl-cancel" id="bl-cancel" onclick="cancelSubscription()">${escHtml(L.bl_cancel)}</button>` : ''));
        cta.classList.toggle('hidden', sub.status !== 'canceled');
        cta.textContent = L.bl_resume; cta.onclick = startSubscribe;
    } else {
        box.innerHTML = billPlanHtml(L) + `<div class="bl-notice">${escHtml(L.bl_notice)}</div>
            <label class="bl-agree"><input type="checkbox" id="bl-agree" onchange="updatePayBtn()"><span>${escHtml(L.bl_agree)}</span></label>${terms}`;
        cta.classList.remove('hidden');
        cta.textContent = sbUser ? L.bl_start : L.bl_login; cta.onclick = startSubscribe;
    }
    updatePayBtn();
}
function billPlanHtml(L) {
    return `<div class="bl-plans" role="radiogroup">${['monthly', 'yearly'].map(p =>
        `<button type="button" role="radio" aria-checked="${p === _billPlan}" class="bl-plan${p === _billPlan ? ' on' : ''}" onclick="pickPlan('${p}')">${escHtml(L['bl_' + p])}</button>`).join('')}</div>`;
}
function pickPlan(p) {
    _billPlan = p === 'yearly' ? 'yearly' : 'monthly';
    document.querySelectorAll('#pm-pay .bl-plan').forEach((b, i) => {
        const on = (i === 0) === (_billPlan === 'monthly');
        b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on));
    });
}
/* 로그인 전에는 버튼이 로그인으로 이어지므로 켜 두고, 로그인 후에는 동의에 체크해야 켜진다 */
function updatePayBtn() {
    const cta = document.getElementById('pm-cta'), ag = document.getElementById('bl-agree');
    if (!cta || !paymentsOn()) return;
    cta.disabled = _billBusy || (!!sbUser && !!ag && !ag.checked);
}

/* ═══════════════════════════════════════
   구독 시작: 토스 결제창(카드 등록)으로 이동 → 끝나면 이 앱 주소로 돌아옴
═══════════════════════════════════════ */
function loadTossSdk() {
    if (typeof TossPayments === 'function') return Promise.resolve();
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = TOSS_SDK_URL; s.async = true;
        s.onload = () => (typeof TossPayments === 'function' ? resolve() : reject(new Error('TossPayments 없음')));
        s.onerror = () => reject(new Error('결제 모듈을 불러오지 못함'));
        document.head.appendChild(s);
    });
}
async function startSubscribe() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!paymentsOn() || _billBusy) return;
    if (!sbUser) { closePremiumModal(); loginWithGoogle(); return; }
    const ag = document.getElementById('bl-agree');
    if (ag && !ag.checked) return;
    _billBusy = true; updatePayBtn();
    try {
        await loadTossSdk();
        const base = location.origin + location.pathname;
        // customerKey = 로그인 계정의 고유 번호(UUID). 서버도 같은 값으로만 결제한다
        await TossPayments(PAYMENTS.clientKey).payment({ customerKey: sbUser.id }).requestBillingAuth({
            method: 'CARD',
            successUrl: base + '?billing=success&plan=' + _billPlan,
            failUrl: base + '?billing=fail',
        });
    } catch (e) {
        // 결제창을 그냥 닫은 경우는 오류가 아니다
        const code = String((e && e.code) || '');
        if (!/CANCEL/i.test(code)) { logErr('billing.start', e); toast(L.bl_error); }
    } finally {
        _billBusy = false; updatePayBtn();
    }
}

/* 앱이 켜질 때: 결제창에서 돌아온 주소(?billing=…)면 값을 챙겨 두고 주소를 깨끗하게 되돌린다.
   (Supabase 로그인 처리보다 먼저 해야 함 — 주소에 남은 값이 로그인 값으로 오해되지 않게) */
function captureBillingReturn() {
    const p = new URLSearchParams(location.search);
    const kind = p.get('billing');
    if (kind !== 'success' && kind !== 'fail') return;
    try {
        sessionStorage.setItem('billingReturn', JSON.stringify({ kind, plan: p.get('plan'), authKey: p.get('authKey'),
            customerKey: p.get('customerKey'), code: p.get('code') }));
    } catch (e) {}
    history.replaceState(null, '', location.pathname + location.hash);
}
function readBillingReturn() {
    try { return JSON.parse(sessionStorage.getItem('billingReturn')); } catch (e) { return null; }
}
/* 돌아온 결제를 마무리한다. 실패는 바로, 성공은 로그인이 확인된 뒤(auth.js가 다시 부름)에 서버로 넘긴다 */
async function resumeBilling() {
    const r = readBillingReturn();
    if (!r || _billBusy) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const clear = () => { try { sessionStorage.removeItem('billingReturn'); } catch (e) {} };
    if (r.kind === 'fail') { clear(); toast(/CANCEL/i.test(String(r.code || '')) ? L.bl_user_cancel : L.bl_fail); return; }
    if (!sbUser) return;                                   // 로그인이 확인되면 다시 불린다
    if (!r.authKey || r.customerKey !== sbUser.id) { clear(); toast(L.bl_need_login); return; }
    clear();                                               // 같은 인증값을 두 번 보내지 않게 먼저 지움
    _billBusy = true;
    toast(L.bl_working);
    const wasCanceled = !!(serverSub && serverSub.status === 'canceled');
    const res = await apiPost('billing-confirm', { authKey: r.authKey, plan: r.plan === 'yearly' ? 'yearly' : 'monthly' });
    _billBusy = false;
    await refreshEntitlement();
    toast(res.ok ? (wasCanceled ? L.bl_resumed : L.bl_started) : (res.code === 'NETWORK' ? L.bl_error : L.bl_fail));
}

/* ═══════════════════════════════════════
   해지
═══════════════════════════════════════ */
async function cancelSubscription() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!paymentsOn() || _billBusy || !serverSub) return;
    const d = billDate(serverSub.current_period_end);
    if (!confirm(fillText(L.bl_cancel_confirm, { d }))) return;
    _billBusy = true;
    const btn = document.getElementById('bl-cancel');
    if (btn) btn.disabled = true;
    const res = await apiPost('billing-cancel');
    _billBusy = false;
    await refreshEntitlement();
    toast(res.ok ? fillText(L.bl_canceled, { d }) : L.bl_error);
}

/* 설정의 "프리미엄 구독" 줄 — 결제가 켜져 있고 로그인했을 때만 보인다 */
function renderSubRow() {
    const row = document.getElementById('row-sub');
    if (!row) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const show = paymentsOn() && !!sbUser;
    row.style.display = show ? 'flex' : 'none';
    if (!show) return;
    const s = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    const sub = serverSub, active = subscriptionIsActive(sub);
    s('row-sub-label', L.row_sub); s('row-sub-btn', L.row_sub_btn);
    s('row-sub-sub', !active ? L.row_sub_none : !sub.current_period_end ? L.bl_forever
        : fillText(sub.status === 'canceled' ? L.bl_until : L.bl_next, { d: billDate(sub.current_period_end) }));
}

/* ═══════════════════════════════════════
   약관·처리방침에 덧붙는 유료 서비스 조항 (결제·AI 돌아보기를 켰을 때만 보임)
═══════════════════════════════════════ */
const PAID_TERMS = {
    ko: `<p>프리미엄은 아래 조건으로 제공합니다.</p>
<ul>
<li><b>요금</b>: 월 1,900원 또는 연 19,000원 (부가세 포함)</li>
<li><b>자동 갱신</b>: 해지하기 전까지 같은 요금으로 매월(연간은 매년) 자동 결제됩니다. 다음 결제일은 프리미엄 안내 화면과 설정에서 확인할 수 있습니다.</li>
<li><b>해지</b>: 프리미엄 안내 화면에서 언제든 직접 해지할 수 있습니다. 해지하면 다음 결제부터 청구되지 않으며, 이미 결제한 기간이 끝날 때까지 이용할 수 있습니다.</li>
<li><b>환불(청약철회)</b>: 결제일로부터 7일 이내이고 프리미엄 기능을 이용하지 않은 경우 전액 환불합니다. 그 밖의 환불은 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령에 따릅니다. 환불은 아래 문의처로 요청해 주세요.</li>
<li><b>결제 실패</b>: 자동 결제가 3회 연속 실패하면 구독이 종료됩니다.</li>
<li><b>계정 삭제</b>: 계정을 삭제하면 구독도 함께 종료되며 자동 결제가 멈춥니다.</li>
<li><b>구독이 끝난 뒤</b>: 기록은 지워지지 않으며, 지난달보다 오래된 기록의 열람과 리포트 등 프리미엄 기능만 닫힙니다.</li>
<li>결제는 토스페이먼츠(주)를 통해 이루어지며, 카드 번호는 이 앱의 서버에 저장하지 않습니다.</li>
</ul>`,
    en: `<p>Premium costs ₩1,900 per month or ₩19,000 per year (VAT included) and renews automatically at the same price until you cancel. You can cancel anytime from the Premium screen; you are not charged again and keep access until the paid period ends. A full refund is available within 7 days of payment if Premium features were not used; other refunds follow applicable Korean law. After three failed renewal attempts the subscription ends. Deleting your account also ends the subscription. Payments are processed by Toss Payments; card numbers are not stored on this app's server.</p>`,
    ja: `<p>プレミアムは月額₩1,900または年額₩19,000（税込）で、解約するまで同じ料金で自動更新されます。プレミアム画面からいつでも解約でき、次回以降は請求されず、支払い済みの期間が終わるまでご利用いただけます。決済日から7日以内でプレミアム機能を利用していない場合は全額返金します。その他の返金は韓国の関連法令に従います。自動決済が3回続けて失敗すると購読は終了します。アカウントを削除すると購読も終了します。決済はトス・ペイメンツを通じて行われ、カード番号は本アプリのサーバーに保存されません。</p>`,
};
const PAID_PRIVACY = {
    ko: `<h3>유료 서비스 이용 시</h3>
<p>결제를 위해 토스페이먼츠(주)에 결제 처리를 위탁합니다. 이 앱의 서버에는 카드 번호를 저장하지 않으며, 자동 결제에 필요한 결제 식별값과 결제 내역(일시·금액·요금제)만 보관합니다. 결제 내역은 관련 법령에 따라 5년간 보관합니다.</p>`,
    en: `<h3>Paid service</h3>
<p>Payments are processed by Toss Payments. This app's server stores no card numbers; it keeps only a payment identifier needed for renewals and a payment history (date, amount, plan), retained for 5 years as required by Korean law.</p>`,
    ja: `<h3>有料サービス</h3>
<p>決済処理はトス・ペイメンツに委託します。本アプリのサーバーにはカード番号を保存せず、自動決済に必要な識別値と決済履歴（日時・金額・プラン）のみを保管します。決済履歴は韓国の関連法令に従い5年間保管します。</p>`,
};
/* care.js의 openPolicy()가 본문을 넣은 뒤 부른다 */
function applyPaidPolicy(kind) {
    const lang = PAID_TERMS[appLang] ? appLang : 'ko';
    const body = document.getElementById('policy-body');
    if (!body) return;
    if (kind === 'terms' && paymentsOn()) {
        const el = document.getElementById('terms-paid');
        if (el) el.outerHTML = PAID_TERMS[lang];
    }
    if (kind !== 'terms') {
        let extra = '';
        if (paymentsOn()) extra += PAID_PRIVACY[lang];
        if (typeof aiPrivacyHtml === 'function') extra += aiPrivacyHtml(lang);
        if (extra) body.insertAdjacentHTML('beforeend', extra);
    }
}
