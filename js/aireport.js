/* 밤의 목장 — js/aireport.js : AI 돌아보기 (프리미엄) — 한 달 기록을 AI가 줄글로 돌아봐 줌
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다)

   AI 호출은 우리 서버(/api/ai-report)만 한다. 브라우저에는 AI 키가 없다.
   일기는 민감한 기록이고 해외 AI 사업자에게 전달되므로, 처음 쓸 때 별도 동의를 받고(profiles.ai_consent_at)
   서버도 그 동의가 없으면 거절한다. AI_REPORT.on 이 false 인 동안에는 버튼이 보이지 않는다. */

const AI_TEXT = {
    ko: {
        ai_btn:'✨ AI 돌아보기', ai_title:'AI 돌아보기',
        ai_consent_title:'AI 돌아보기를 쓰기 전에',
        ai_consent_desc:'이 달의 감정 기록과 일기를 AI가 읽고 한 편의 글로 돌아봐 드려요. 이를 위해 그 달의 기록이 해외의 AI 서비스 사업자에게 전달됩니다. 이름과 이메일은 보내지 않으며, 전달된 기록은 AI 학습에 쓰이지 않도록 설정되어 있어요.',
        ai_consent_check:'(선택) 신앙과 마음 상태가 드러날 수 있는 기록을 AI 돌아보기를 위해 해외 AI 사업자에게 전달하는 데 동의합니다',
        ai_consent_agree:'동의하고 만들기', ai_consent_cancel:'취소',
        ai_loading:'기록을 읽으며 글을 쓰는 중이에요…',
        ai_note:'AI가 기록을 바탕으로 쓴 글이에요. 사실과 다를 수 있고, 말씀과 교회 공동체, 전문 상담을 대신하지 않아요.',
        ai_again:'다시 만들기 ({n}회 남음)', ai_withdraw:'AI 이용 동의 철회',
        ai_withdrawn:'동의를 철회했어요. 이 달의 글도 화면에서 지웠어요.',
        ai_err_few:'기록이 3일 이상 있는 달에 만들 수 있어요.', ai_err_limit:'이 달의 글은 더 만들 수 없어요.',
        ai_err_login:'로그인한 뒤에 이용할 수 있어요.', ai_err:'지금은 만들지 못했어요. 잠시 후 다시 시도해 주세요.',
    },
    en: {
        ai_btn:'✨ AI look-back', ai_title:'AI look-back',
        ai_consent_title:'Before using AI look-back',
        ai_consent_desc:'AI reads this month\'s mood records and gratitude notes and writes a short look-back. To do this, that month\'s records are sent to an AI service provider outside your country. Your name and email are not sent, and the provider is set not to use the records for training.',
        ai_consent_check:'(Optional) I agree to send records that may reveal my faith and state of mind to an overseas AI provider for AI look-back',
        ai_consent_agree:'Agree and create', ai_consent_cancel:'Cancel',
        ai_loading:'Reading your records and writing…',
        ai_note:'Written by AI from your records. It may be inaccurate and does not replace Scripture, your church community or professional counselling.',
        ai_again:'Create again ({n} left)', ai_withdraw:'Withdraw AI consent',
        ai_withdrawn:'Consent withdrawn. This month\'s text was removed from the screen.',
        ai_err_few:'Available for months with at least 3 days of records.', ai_err_limit:'No more texts can be made for this month.',
        ai_err_login:'Please sign in to use this.', ai_err:'Could not create it right now. Please try again later.',
    },
    ja: {
        ai_btn:'✨ AIふりかえり', ai_title:'AIふりかえり',
        ai_consent_title:'AIふりかえりを使う前に',
        ai_consent_desc:'この月の気持ちの記録と感謝日記をAIが読み、ひとつの文章にしてふりかえります。そのために、その月の記録が海外のAIサービス事業者に送信されます。お名前とメールアドレスは送信されず、送信された記録がAIの学習に使われないよう設定されています。',
        ai_consent_check:'（任意）信仰や心の状態が表れうる記録を、AIふりかえりのために海外のAI事業者へ送信することに同意します',
        ai_consent_agree:'同意して作成', ai_consent_cancel:'キャンセル',
        ai_loading:'記録を読みながら文章を書いています…',
        ai_note:'AIが記録をもとに書いた文章です。事実と異なる場合があり、みことばや教会の交わり、専門の相談に代わるものではありません。',
        ai_again:'もう一度作成（あと{n}回）', ai_withdraw:'AI利用の同意を取り消す',
        ai_withdrawn:'同意を取り消しました。この月の文章も画面から消しました。',
        ai_err_few:'記録が3日以上ある月に作成できます。', ai_err_limit:'この月の文章はこれ以上作成できません。',
        ai_err_login:'ログイン後にご利用いただけます。', ai_err:'いまは作成できませんでした。しばらくしてからもう一度お試しください。',
    },
};
Object.keys(AI_TEXT).forEach(k => Object.assign(LANG_DATA[k], AI_TEXT[k]));

/* AI 돌아보기 기능이 켜져 있는가 (AI_REPORT.on + 웹에서만) */
function aiReportOn() { return !!(AI_REPORT.on && location.protocol !== 'file:'); }
const aiPeriod = () => histY + '-' + String(histM).padStart(2, '0');

/* 월간 리포트 아래에 들어갈 버튼 (history.js가 프리미엄일 때 부름). 쓸 수 없는 상태면 빈 글 */
function aiReportButtonHtml() {
    if (!aiReportOn() || !sbUser || !sb) return '';
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    return `<button class="db-pdf-btn ai-btn" type="button" id="ai-btn" onclick="openAiReport()">${escHtml(L.ai_btn)}</button>
        <div id="ai-out" class="ai-out" aria-live="polite"></div>`;
}

let _aiBusy = false, _aiSeq = 0;
/* AI 돌아보기 실행: 동의 확인 → 서버(/api/ai-report) 호출 → 결과 표시 */
async function openAiReport(regenerate) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!aiReportOn() || _aiBusy) return;
    if (!sbUser || !sb) { toast(L.ai_err_login); return; }
    if (lsGet('aiConsent') !== sbUser.id) { openAiConsent(); return; }
    const out = document.getElementById('ai-out'), btn = document.getElementById('ai-btn');
    const period = aiPeriod(), seq = ++_aiSeq;
    _aiBusy = true;
    if (btn) btn.disabled = true;
    if (out) out.innerHTML = `<div class="ai-loading">${escHtml(L.ai_loading)}</div>`;
    const res = await apiPost('ai-report', { period, lang: appLang, regenerate: !!regenerate });
    _aiBusy = false;
    const out2 = document.getElementById('ai-out'), btn2 = document.getElementById('ai-btn');
    if (btn2) btn2.disabled = false;
    if (seq !== _aiSeq || period !== aiPeriod() || !out2) return;   // 그 사이 다른 달로 넘어갔으면 버림
    if (res.code === 'NO_AI_CONSENT') { out2.innerHTML = ''; localStorage.removeItem('aiConsent'); openAiConsent(); return; }
    if (!res.ok) {
        const msg = res.code === 'TOO_FEW' ? L.ai_err_few : res.code === 'AI_LIMIT' ? L.ai_err_limit : res.code === 'NO_LOGIN' ? L.ai_err_login : L.ai_err;
        out2.innerHTML = `<div class="ai-loading">${escHtml(msg)}</div>`;
        return;
    }
    // AI가 쓴 글도 "바깥에서 온 값"이다 → 반드시 escHtml을 거쳐 문단으로만 나눈다
    const paras = String(res.content || '').split(/\n\s*\n|\n/).map(s => s.trim()).filter(Boolean);
    out2.innerHTML = `<div class="ai-card">
            <div class="ai-card-title">${escHtml(L.ai_title)}</div>
            ${paras.map(p => `<p>${escHtml(p)}</p>`).join('')}
            <div class="ai-note">${escHtml(L.ai_note)}</div>
        </div>
        <div class="ai-actions">
            ${res.left > 0 ? `<button type="button" class="bl-link" onclick="openAiReport(true)">${escHtml(fillText(L.ai_again, { n: res.left }))}</button>` : ''}
            <button type="button" class="bl-link" onclick="withdrawAiConsent()">${escHtml(L.ai_withdraw)}</button>
        </div>`;
}

/* ── 별도 동의 ── */
function openAiConsent() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const m = document.getElementById('ai-modal');
    if (!m) return;
    const s = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    s('ai-consent-title', L.ai_consent_title); s('ai-consent-desc', L.ai_consent_desc); s('ai-consent-check-txt', L.ai_consent_check);
    s('ai-consent-agree', L.ai_consent_agree); s('ai-consent-cancel', L.ai_consent_cancel); s('ai-consent-view', L.consent_view);
    document.getElementById('ai-consent-check').checked = false;
    document.getElementById('ai-consent-agree').disabled = true;
    m.classList.remove('hidden');
}
/* AI 동의창 닫기 */
function closeAiConsent() { const m = document.getElementById('ai-modal'); if (m) m.classList.add('hidden'); }
/* 동의 체크가 되어야 "동의" 버튼이 켜짐 */
function updateAiConsentBtn() {
    document.getElementById('ai-consent-agree').disabled = !document.getElementById('ai-consent-check').checked;
}
/* AI 동의를 서버(profiles)에 기록 */
async function agreeAiConsent() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!sbUser || !sb) { closeAiConsent(); toast(L.ai_err_login); return; }
    const uid = sbUser.id;
    document.getElementById('ai-consent-agree').disabled = true;
    try {
        // 동의 시각을 서버에 남긴다 — 서버는 이 값이 있어야만 기록을 AI로 보낸다
        const { error } = await sb.from('profiles').upsert({ id: uid, ai_consent_at: new Date().toISOString() });
        if (error) throw error;
    } catch (e) { logErr('ai.consent', e); closeAiConsent(); toast(L.ai_err); return; }
    lsSet('aiConsent', uid);
    closeAiConsent();
    openAiReport();
}
/* AI 동의 철회 */
async function withdrawAiConsent() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!sbUser || !sb) return;
    try {
        const { error } = await sb.from('profiles').update({ ai_consent_at: null }).eq('id', sbUser.id);
        if (error) throw error;
    } catch (e) { logErr('ai.withdraw', e); toast(L.ai_err); return; }
    localStorage.removeItem('aiConsent');
    const out = document.getElementById('ai-out');
    if (out) out.innerHTML = '';
    toast(L.ai_withdrawn);
}

/* 처리방침에 덧붙는 조항 (billing.js의 applyPaidPolicy가 부름) */
function aiPrivacyHtml(lang) {
    if (!aiReportOn()) return '';
    return ({
        ko: `<h3>AI 돌아보기 이용 시 (선택)</h3>
<p>AI 돌아보기는 별도로 동의하신 경우에만 동작합니다. 글을 만들 때 선택한 달의 감정 기록과 일기가 OpenRouter, Inc.(미국)와 그가 연결하는 AI 모델 제공 사업자에게 전송되어 처리됩니다. 이름·이메일·계정 식별값은 전송하지 않으며, 전송된 내용을 AI 학습에 사용하지 않는 사업자로만 보내도록 설정합니다. 만들어진 글은 이 서비스의 데이터베이스에 저장되며 계정을 삭제하면 함께 삭제됩니다. 동의는 AI 돌아보기 화면에서 언제든 철회할 수 있고, 동의하지 않아도 다른 기능은 그대로 이용할 수 있습니다.</p>`,
        en: `<h3>AI look-back (optional)</h3>
<p>AI look-back works only with your separate consent. When a text is created, the selected month's mood records and gratitude notes are sent to OpenRouter, Inc. (USA) and the AI model provider it routes to. Your name, email and account identifier are not sent, and requests are limited to providers that do not use the content for training. The resulting text is stored in this service's database and deleted with your account. You can withdraw consent anytime on the AI look-back screen; other features work without it.</p>`,
        ja: `<h3>AIふりかえり（任意）</h3>
<p>AIふりかえりは、別途同意いただいた場合にのみ動作します。文章を作成する際、選択した月の気持ちの記録と感謝日記がOpenRouter, Inc.（米国）およびその接続先のAIモデル提供事業者に送信され処理されます。お名前・メールアドレス・アカウント識別子は送信せず、内容を学習に利用しない事業者にのみ送信するよう設定します。作成された文章は本サービスのデータベースに保存され、アカウント削除時に削除されます。同意はAIふりかえり画面からいつでも取り消せ、同意しなくても他の機能はそのままご利用いただけます。</p>`,
    })[lang] || '';
}
