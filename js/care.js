/* 밤의 목장 — js/care.js : 처리방침·동의 · 계정 삭제 · 회고 카드 · 돌봄 안내 · 접근성
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════════════════════════════
   § v2.7 — 처리방침·동의 / 계정 삭제 / 회고 카드 / 돌봄 안내 / 접근성
   문구는 V27_TEXT에 ko·en·ja를 함께 두고 LANG_DATA에 병합한다 (3개 언어 키 패리티 유지).
═══════════════════════════════════════════════════════════════ */

/* 운영자 정보 — 사업자등록 후 채우면 처리방침·약관 하단에 자동 표시됨 (비어 있으면 '베타 운영 중' 안내) */
const OPERATOR = { name:'', bizNo:'', email:'' };
const POLICY_DATE = '2026-11-16';
/* 동의 문구가 바뀌면 이 값을 올려 다시 동의받는다 */
const CONSENT_VERSION = '2026-11-v1';

const V27_TEXT = {
    ko: {
        privacy:'🔒 로그인하지 않으면 기록은 이 기기에만 보관돼요.',
        privacy_cloud:'☁️ 로그인 중에는 기록이 클라우드에 함께 저장돼요.<br>설정에서 언제든 지우거나 계정을 삭제할 수 있어요.',
        row_policy:'개인정보 처리방침', row_terms:'이용약관', policy_back:'← 돌아가기',
        logout_done:'로그아웃 됐어요.', row_logout_btn:'로그아웃',
        row_delete:'계정 삭제', row_delete_sub:'클라우드의 모든 기록과 계정을 지워요', row_delete_btn:'삭제',
        del_confirm:'클라우드에 저장된 모든 기록과 계정이 삭제되며 되돌릴 수 없어요. 이 기기의 기록도 함께 지워져요. 계속하시겠어요?',
        del_done:'계정과 모든 기록이 삭제됐어요.',
        del_partial:'기록은 모두 삭제됐어요. 로그인 계정 정보 삭제는 운영자가 이어서 처리해요.',
        del_fail:'삭제하지 못했어요. 네트워크를 확인하고 다시 시도해 주세요.',
        reset_fail:'클라우드 기록을 지우지 못해 초기화를 중단했어요. 다시 시도해 주세요.',
        consent_title:'로그인 전에 확인해 주세요',
        consent_desc:'로그인하면 이 기기의 기록이 클라우드에 저장되어 다른 기기에서도 이어볼 수 있어요.',
        consent_c1:'(필수) 개인정보 수집·이용에 동의합니다 — 이메일, 감정 기록, 감사 일기, 즐겨찾기 말씀',
        consent_c2:'(필수) 신앙과 마음 상태가 드러날 수 있는 기록(민감정보)을 저장하는 데 동의합니다',
        consent_c3:'(필수) 만 14세 이상입니다',
        consent_view:'개인정보 처리방침 전문 보기', consent_agree:'동의하고 Google로 로그인', consent_cancel:'로그인 없이 계속 쓰기',
        otd_y1:'✦ 1년 전 오늘 밤', otd_m6:'✦ 6개월 전 오늘 밤', otd_m3:'✦ 3개월 전 오늘 밤', otd_m1:'✦ 한 달 전 오늘 밤',
        otd_msg:'그 밤에도, 오늘 밤에도 주님이 함께 계세요.',
        otd_locked:'그날 밤의 기록이 잘 보관되어 있어요. 3개월 넘은 기록 다시 보기는 프리미엄 기능이에요.',
        otd_locked_btn:'프리미엄 알아보기', otd_close:'회고 카드 닫기',
        care_title:'혼자 견디기 버거운 밤이라면',
        care_body:'마음이 무거운 날이 여러 날 이어지고 있어요. 도움을 구하는 것은 믿음이 약해서가 아니에요. 기도와 함께, 사람의 도움을 받는 것도 하나님이 열어 두신 길이에요. 가까운 분이나 목회자, 전문 상담사에게 마음을 나눠 보세요.',
        care_tel:'📞 마음이 힘들 때 109 (자살예방 상담전화, 24시간)', care_href:'tel:109',
        care_line:'지금 위험한 상황이라면 112나 119로 바로 연락하세요.',
        a11y_close:'닫기', a11y_vault:'보관함', a11y_settings:'설정', a11y_dashboard:'이번 주 나의 이야기',
        a11y_font_down:'글자 작게', a11y_font_up:'글자 크게', a11y_timer:'마무리 시간 연장',
        sync_pulled:'클라우드의 기록을 불러왔어요 ☁️', sync_pushed:'이 기기의 기록을 클라우드에 저장했어요 ☁️',
        login_unavailable:'지금은 로그인할 수 없어요. 잠시 뒤에 다시 시도해 주세요.',
    },
    en: {
        privacy:'🔒 Without signing in, your records stay on this device only.',
        privacy_cloud:'☁️ While signed in, your records are also saved to the cloud.<br>You can erase them or delete your account anytime in Settings.',
        row_policy:'Privacy Policy', row_terms:'Terms of Use', policy_back:'← Back',
        logout_done:'Signed out.', row_logout_btn:'Sign out',
        row_delete:'Delete account', row_delete_sub:'Erase all cloud records and your account', row_delete_btn:'Delete',
        del_confirm:'All records saved in the cloud and your account will be permanently deleted. Records on this device will be erased too. Continue?',
        del_done:'Your account and all records have been deleted.',
        del_partial:'All records have been deleted. The operator will finish removing your sign-in account.',
        del_fail:'Could not delete. Please check your connection and try again.',
        reset_fail:'Could not erase cloud records, so the reset was stopped. Please try again.',
        consent_title:'Before you sign in',
        consent_desc:'Signing in saves the records on this device to the cloud so you can continue on other devices.',
        consent_c1:'(Required) I agree to the collection and use of my email, mood records, gratitude journal and saved verses',
        consent_c2:'(Required) I agree to the storage of records that may reveal my faith and state of mind (sensitive information)',
        consent_c3:'(Required) I am 14 years of age or older',
        consent_view:'Read the full Privacy Policy', consent_agree:'Agree and sign in with Google', consent_cancel:'Continue without signing in',
        otd_y1:'✦ One year ago tonight', otd_m6:'✦ Six months ago tonight', otd_m3:'✦ Three months ago tonight', otd_m1:'✦ One month ago tonight',
        otd_msg:'The Lord was with you that night, and He is with you tonight.',
        otd_locked:'Your record from that night is safely kept. Looking back at records older than three months is a Premium feature.',
        otd_locked_btn:'About Premium', otd_close:'Close this card',
        care_title:'If tonight feels too heavy to carry alone',
        care_body:'Your heart has been heavy for several days. Asking for help is not a sign of weak faith. Along with prayer, receiving help from people is also a path God has opened. Please share how you feel with someone close to you, a pastor, or a professional counselor.',
        care_tel:'📞 Call or text 988 (U.S., 24 hours)', care_href:'tel:988',
        care_line:'Outside the U.S., please contact your local crisis line. In immediate danger, call your emergency number.',
        a11y_close:'Close', a11y_vault:'Vault', a11y_settings:'Settings', a11y_dashboard:'My story this week',
        a11y_font_down:'Smaller text', a11y_font_up:'Larger text', a11y_timer:'Extend closing time',
        sync_pulled:'Your cloud records have been loaded ☁️', sync_pushed:'Records on this device were saved to the cloud ☁️',
        login_unavailable:'Sign-in is unavailable right now. Please try again shortly.',
    },
    ja: {
        privacy:'🔒 ログインしない場合、記録はこのデバイスにのみ保存されます。',
        privacy_cloud:'☁️ ログイン中は記録がクラウドにも保存されます。<br>設定からいつでも削除・アカウント削除ができます。',
        row_policy:'プライバシーポリシー', row_terms:'利用規約', policy_back:'← 戻る',
        logout_done:'ログアウトしました。', row_logout_btn:'ログアウト',
        row_delete:'アカウント削除', row_delete_sub:'クラウドの全記録とアカウントを削除します', row_delete_btn:'削除',
        del_confirm:'クラウドに保存された全ての記録とアカウントが削除され、元に戻せません。このデバイスの記録も削除されます。続けますか？',
        del_done:'アカウントと全ての記録を削除しました。',
        del_partial:'記録は全て削除しました。ログインアカウント情報の削除は運営者が引き続き対応します。',
        del_fail:'削除できませんでした。通信状況を確認して、もう一度お試しください。',
        reset_fail:'クラウドの記録を削除できなかったため、初期化を中止しました。もう一度お試しください。',
        consent_title:'ログインの前にご確認ください',
        consent_desc:'ログインすると、このデバイスの記録がクラウドに保存され、他のデバイスでも続きをご覧いただけます。',
        consent_c1:'（必須）メールアドレス、感情の記録、感謝日記、お気に入りのみことばの収集・利用に同意します',
        consent_c2:'（必須）信仰や心の状態が表れる記録（要配慮情報）の保存に同意します',
        consent_c3:'（必須）14歳以上です',
        consent_view:'プライバシーポリシー全文を読む', consent_agree:'同意してGoogleでログイン', consent_cancel:'ログインせずに使う',
        otd_y1:'✦ 1年前の今夜', otd_m6:'✦ 6か月前の今夜', otd_m3:'✦ 3か月前の今夜', otd_m1:'✦ 1か月前の今夜',
        otd_msg:'あの夜も、今夜も、主が共におられます。',
        otd_locked:'あの夜の記録は大切に保管されています。3か月より前の記録の振り返りはプレミアム機能です。',
        otd_locked_btn:'プレミアムについて', otd_close:'このカードを閉じる',
        care_title:'ひとりで抱えるには重い夜なら',
        care_body:'心の重い日が何日も続いています。助けを求めることは、信仰が弱いからではありません。祈りと共に、人の助けを受けることも神様が開いてくださった道です。身近な方や牧師、専門の相談員に気持ちを話してみてください。',
        care_tel:'📞 よりそいホットライン 0120-279-338（24時間）', care_href:'tel:0120279338',
        care_line:'今すぐ危険な状況のときは、110番または119番へご連絡ください。',
        a11y_close:'閉じる', a11y_vault:'保管庫', a11y_settings:'設定', a11y_dashboard:'今週のわたしの物語',
        a11y_font_down:'文字を小さく', a11y_font_up:'文字を大きく', a11y_timer:'終了時間を延長',
        sync_pulled:'クラウドの記録を読み込みました ☁️', sync_pushed:'このデバイスの記録をクラウドに保存しました ☁️',
        login_unavailable:'現在ログインできません。しばらくしてからもう一度お試しください。',
    },
};
Object.keys(V27_TEXT).forEach(k => Object.assign(LANG_DATA[k], V27_TEXT[k]));

/* ── 처리방침·약관 본문 (한국어가 기준, 영어·일본어는 요약) ── */
function operatorHtml() {
    if (!OPERATOR.name) return `<p class="policy-note">현재 베타 운영 중입니다. 운영자(사업자) 정보와 서버 위치는 정식 출시 전에 이곳에 기재됩니다. 문의는 설정 &gt; 의견 남기기로 보내 주세요.</p>`;
    return `<p>운영자: ${escHtml(OPERATOR.name)}${OPERATOR.bizNo ? ' · 사업자등록번호 ' + escHtml(OPERATOR.bizNo) : ''}${OPERATOR.email ? ' · ' + escHtml(OPERATOR.email) : ''}</p>`;
}
const POLICY_HTML = {
    privacy: {
        ko: () => `
<p>시행일: ${POLICY_DATE}</p>
<h3>1. 로그인하지 않고 쓰는 경우</h3>
<p>감정 기록, 감사 일기, 즐겨찾기 말씀, 방문 날짜, 설정은 이 기기(브라우저 저장소)에만 저장되며 서버로 전송되지 않습니다.</p>
<h3>2. Google로 로그인한 경우 수집하는 항목</h3>
<ul>
<li>Google 계정 이메일과 계정 식별자</li>
<li>입력한 호칭(이름), 언어·테마·글자 크기 설정</li>
<li>감정 기록(감정·주제·필요), 감사 일기, 즐겨찾기 말씀, 방문 날짜</li>
</ul>
<h3>3. 민감정보</h3>
<p>이 앱의 기록에는 신앙과 마음 상태가 드러날 수 있습니다. 이런 기록은 로그인 전에 별도로 동의하신 경우에만 서버에 저장합니다.</p>
<h3>4. 이용 목적</h3>
<p>기기 간 이어보기와 백업, 주간·월간 기록 통계 제공에만 사용합니다. 광고나 제3자 제공에는 사용하지 않습니다.</p>
<h3>5. 보관 기간과 삭제</h3>
<p>계정을 삭제하거나 기록을 초기화할 때까지 보관합니다. 설정 &gt; 데이터 초기화로 기록을, 설정 &gt; 계정 삭제로 계정과 모든 기록을 직접 지울 수 있습니다. 설정 &gt; 기록 내보내기로 기록을 받아 갈 수 있습니다.</p>
<h3>6. 처리 위탁과 국외 이전</h3>
<p>서비스 운영을 위해 아래 사업자의 서비스를 이용하며, 기록이 해당 사업자의 해외 서버에 저장될 수 있습니다.</p>
<ul>
<li>Supabase — 데이터베이스·로그인 인증</li>
<li>Vercel — 웹 호스팅</li>
<li>Google — 로그인(계정 인증), 글꼴 제공</li>
</ul>
<p>글꼴·QR 이미지 등 외부 자원을 불러올 때 접속 정보(IP 주소 등)가 해당 사업자에게 전달될 수 있습니다.</p>
<h3>7. 만 14세 미만</h3>
<p>만 14세 미만은 로그인 기능을 이용할 수 없습니다.</p>
<h3>8. 이용자의 권리</h3>
<p>언제든 자신의 기록을 열람·수정·삭제하고 동의를 철회(계정 삭제)할 수 있습니다.</p>
<h3>9. 문의</h3>
${operatorHtml()}`,
        en: () => `
<p>Effective: ${POLICY_DATE}. This is a summary; the Korean version governs.</p>
<h3>Without signing in</h3>
<p>All records stay in this device's browser storage and are not sent to a server.</p>
<h3>When signed in with Google</h3>
<p>We store your Google email and account ID, the name you entered, your settings, mood records, gratitude journal, saved verses and visit dates. These records may reveal your faith and state of mind, so they are stored only after your separate consent.</p>
<h3>Use, retention and deletion</h3>
<p>Used only for syncing across devices, backup and your own statistics — never for ads or sharing with third parties. Kept until you reset your data or delete your account in Settings.</p>
<h3>Service providers</h3>
<p>Supabase (database, authentication), Vercel (hosting) and Google (sign-in, fonts). Records may be stored on their servers outside Korea.</p>
<h3>Age</h3>
<p>Sign-in is not available to anyone under 14.</p>
<h3>Contact</h3>
<p class="policy-note">The service is in beta. Operator details will be listed here before the official launch. Please use Settings &gt; Feedback to reach us.</p>`,
        ja: () => `
<p>施行日: ${POLICY_DATE}。これは要約であり、韓国語版が正本です。</p>
<h3>ログインしない場合</h3>
<p>全ての記録はこのデバイスのブラウザ内にのみ保存され、サーバーには送信されません。</p>
<h3>Googleでログインした場合</h3>
<p>Googleのメールアドレスとアカウント識別子、入力したお名前、設定、感情の記録、感謝日記、お気に入りのみことば、訪問日を保存します。これらには信仰や心の状態が表れることがあるため、別途同意をいただいた場合にのみ保存します。</p>
<h3>利用目的・保存期間・削除</h3>
<p>デバイス間の同期、バックアップ、ご自身の統計表示にのみ利用し、広告や第三者提供には利用しません。設定からデータを初期化するか、アカウントを削除するまで保存します。</p>
<h3>委託先</h3>
<p>Supabase（データベース・認証）、Vercel（ホスティング）、Google（ログイン・フォント）。記録は韓国外のサーバーに保存される場合があります。</p>
<h3>年齢</h3>
<p>14歳未満の方はログイン機能をご利用いただけません。</p>
<h3>お問い合わせ</h3>
<p class="policy-note">現在ベータ運営中です。運営者情報は正式リリース前にここに記載します。設定 &gt; フィードバックからご連絡ください。</p>`,
    },
    terms: {
        ko: () => `
<p>시행일: ${POLICY_DATE}</p>
<h3>1. 서비스</h3>
<p>이 앱은 하루를 돌아보며 말씀과 묵상을 만나는 감정 묵상 서비스입니다. 현재 베타 운영 중이며 모든 기능을 무료로 제공합니다.</p>
<h3>2. 전문 상담·의료를 대신하지 않습니다</h3>
<p>앱의 말씀·묵상·응원 문구는 신앙적 위로를 위한 것이며 의료, 심리 상담, 법률 등 전문가의 조언을 대신하지 않습니다. 위급한 상황에서는 112·119 또는 자살예방 상담전화 109로 연락해 주세요.</p>
<h3>3. 기록의 책임과 보관</h3>
<p>로그인하지 않은 기록은 기기에만 저장되므로 브라우저 데이터를 지우거나 기기를 바꾸면 복구할 수 없습니다. 로그인하면 클라우드에 함께 저장됩니다.</p>
<h3>4. 유료 서비스</h3>
<p>프리미엄은 아직 판매하지 않습니다. 판매를 시작할 때 가격, 결제·자동 갱신, 해지와 환불 기준을 이 약관과 결제 화면에 먼저 알리고 동의를 받습니다.</p>
<h3>5. 콘텐츠</h3>
<p>성경 본문과 음원의 출처·저작권 표시는 설정 화면 하단에 있습니다. 앱의 묵상 글과 디자인을 허락 없이 상업적으로 복제·배포할 수 없습니다.</p>
<h3>6. 변경과 중단</h3>
<p>서비스 내용이나 약관이 바뀌면 앱 안에서 미리 알립니다. 서비스를 종료할 때에는 기록을 내보낼 수 있는 기간을 둡니다.</p>
<h3>7. 문의</h3>
${operatorHtml()}`,
        en: () => `
<p>Effective: ${POLICY_DATE}. This is a summary; the Korean version governs.</p>
<p>This app is a devotional service for reflecting on your day with Scripture. It is in beta and currently free.</p>
<p>Its verses and devotional texts offer spiritual comfort and do not replace medical, psychological or other professional advice. In an emergency, contact your local emergency number or crisis line.</p>
<p>Records made without signing in live only on your device and cannot be recovered if browser data is cleared.</p>
<p>Premium is not on sale yet. Price, renewal, cancellation and refund terms will be shown and agreed to before any purchase.</p>`,
        ja: () => `
<p>施行日: ${POLICY_DATE}。これは要約であり、韓国語版が正本です。</p>
<p>本アプリは、みことばと共に一日を振り返る黙想サービスです。現在ベータ運営中で、無料でご利用いただけます。</p>
<p>みことばや黙想文は信仰的な慰めのためのものであり、医療・心理相談など専門家の助言に代わるものではありません。緊急の場合は110番・119番、または相談窓口へご連絡ください。</p>
<p>ログインせずに作成した記録はデバイス内にのみ保存され、ブラウザのデータを消去すると復元できません。</p>
<p>プレミアムはまだ販売していません。販売開始時には、価格・自動更新・解約・返金の条件を事前に表示し、同意をいただきます。</p>`,
    },
};

function openPolicy(kind) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const set = POLICY_HTML[kind] || POLICY_HTML.privacy;
    document.getElementById('policy-title').textContent = kind === 'terms' ? L.row_terms : L.row_policy;
    document.getElementById('policy-body').innerHTML = (set[appLang] || set.ko)();
    const ov = document.getElementById('overlay-policy');
    showOverlay('overlay-policy');
    ov.scrollTop = 0;
}

/* ── 로그인 전 동의 ── */
function hasConsent() { const c = lsGet('consent'); return !!(c && c.v === CONSENT_VERSION); }
function openConsent() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const s = (id,t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    s('consent-title', L.consent_title); s('consent-desc', L.consent_desc);
    s('consent-c1-txt', L.consent_c1); s('consent-c2-txt', L.consent_c2); s('consent-c3-txt', L.consent_c3);
    s('consent-view', L.consent_view); s('consent-agree', L.consent_agree); s('consent-cancel', L.consent_cancel);
    ['consent-c1','consent-c2','consent-c3'].forEach(id => { document.getElementById(id).checked = false; });
    updateConsentBtn();
    document.getElementById('consent-modal').classList.remove('hidden');
}
function closeConsent() { document.getElementById('consent-modal').classList.add('hidden'); }
function updateConsentBtn() {
    const ok = ['consent-c1','consent-c2','consent-c3'].every(id => document.getElementById(id).checked);
    document.getElementById('consent-agree').disabled = !ok;
}
function agreeConsent() {
    lsSet('consent', { v: CONSENT_VERSION, at: new Date().toISOString() });
    closeConsent();
    loginWithGoogle();
}

/* ── 계정 삭제 (탈퇴) ──
   1순위: 서버 함수 delete_my_account() — 기록 + 로그인 계정까지 삭제 (docs/supabase_v2.7.sql 실행 필요)
   함수가 아직 없으면: 기록 4개 테이블만 삭제하고, 계정 정보는 남았다고 사실대로 안내 */
async function deleteAccount() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!sbUser || !sb) return;
    if (!confirm(L.del_confirm)) return;
    let full = false;
    try {
        const { error } = await sb.rpc('delete_my_account');
        if (!error) full = true;
        else {
            for (const [t, col] of [['mood_history','user_id'],['saved_verses','user_id'],['visit_dates','user_id'],['profiles','id']]) {
                const r = await sb.from(t).delete().eq(col, sbUser.id);
                if (r.error) throw r.error;
            }
        }
    } catch (e) {
        toast(L.del_fail);
        return;
    }
    ['savedVerses','moodHistory','visitDates','consent','premiumActive','dataOwner'].forEach(k => localStorage.removeItem(k));
    try { await sb.auth.signOut(); } catch (e) {}
    sbUser = null;
    _syncedUser = null;
    safe('delete.render', () => { updateStreak(); refreshVaultIfOpen(); });
    updateAuthUI();
    hideOverlay('overlay-settings');
    toast(full ? L.del_done : L.del_partial);
}

/* ── 회고 카드: "N 전 오늘 밤" ──
   한 달 전 기록은 누구에게나, 3개월 이상 지난 기록은 프리미엄에게 보여준다 (평생 보관의 가치를 체감시키는 지점).
   기기에는 최근 30건만 남으므로 오래된 기록은 로그인 사용자의 서버 기록에서 찾는다. */
function otdTargets() {
    return [
        { key:'otd_y1', premium:true,  date: ymd(monthsAgo(12)) },
        { key:'otd_m6', premium:true,  date: ymd(monthsAgo(6)) },
        { key:'otd_m3', premium:true,  date: ymd(monthsAgo(3)) },
        { key:'otd_m1', premium:false, date: ymd(monthsAgo(1)) },
    ];
}
let _otdSeq = 0;
async function renderOnThisDay() {
    const el = document.getElementById('otd-card');
    if (!el) return;
    const seq = ++_otdSeq;
    const hide = () => { el.classList.add('hidden'); el.innerHTML = ''; };
    if (lsGet('otdDismissed') === todayStr()) { hide(); return; }
    const targets = otdTargets();
    const byDate = {};
    getMoods().forEach(h => { if (!(h.date in byDate)) byDate[h.date] = h; });
    if (sbUser && sb) {
        try {
            const { data } = await sb.from('mood_history').select('date,emotion,topic,need,diary_text')
                .eq('user_id', sbUser.id).in('date', targets.map(t => t.date));
            if (seq !== _otdSeq) return; // 더 최근 호출이 있으면 그 결과에 맡김
            (data || []).forEach(r => {
                const cur = byDate[r.date];
                if (!cur || (!cur.diary && r.diary_text)) byDate[r.date] = { date:r.date, emotion:r.emotion, topic:r.topic, need:r.need, diary:r.diary_text };
            });
        } catch (e) {}
    }
    const t = targets.find(x => byDate[x.date]);
    if (!t) { hide(); return; }
    const h = byDate[t.date];
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const dateTxt = parseYmd(h.date).toLocaleDateString(L.locale||'ko-KR', { year:'numeric', month:'long', day:'numeric' });
    const head = `<button type="button" class="otd-close" onclick="dismissOnThisDay()" aria-label="${escHtml(L.otd_close)}">✕</button>
        <div class="otd-label">${escHtml(L[t.key])}</div>`;
    if (t.premium && !isPremium()) {
        el.innerHTML = head + `<div class="otd-meta">${escHtml(dateTxt)}</div>
            <div class="otd-msg">${escHtml(L.otd_locked)}</div>
            <button type="button" class="otd-btn" onclick="openPremiumModal()">${escHtml(L.otd_locked_btn)}</button>`;
    } else {
        const meta = [h.emotion && eLabel(h.emotion), h.topic && tLabel(h.topic), h.need && nLabel(h.need)].filter(Boolean).join(' · ');
        el.innerHTML = head + `<div class="otd-meta">${escHtml(dateTxt)} · ${escHtml(meta)}</div>
            ${h.diary ? `<div class="otd-diary">“${escHtml(h.diary)}”</div>` : ''}
            <div class="otd-msg">${escHtml(L.otd_msg)}</div>`;
    }
    el.classList.remove('hidden');
}
function dismissOnThisDay() {
    lsSet('otdDismissed', todayStr());
    const el = document.getElementById('otd-card');
    if (el) el.classList.add('hidden');
}

/* ── 돌봄 안내 카드: 무거운 마음(걱정·지침·아픔)이 오늘 포함 3일 이상 이어질 때만 ── */
function renderCareCard() {
    const el = document.getElementById('care-card');
    if (!el) return;
    el.classList.add('hidden');
    const run = calcEmotionRun();
    if (!run || run.cat !== 'neg' || run.n < 3) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    document.getElementById('care-title').textContent = L.care_title;
    document.getElementById('care-body').textContent = L.care_body;
    const tel = document.getElementById('care-tel');
    tel.textContent = L.care_tel; tel.setAttribute('href', L.care_href);
    document.getElementById('care-line').textContent = L.care_line;
    el.classList.remove('hidden');
}

/* ── 언어 변경 시 v2.7 UI 갱신 (applyLang 끝에서 호출) ── */
function applyLangV27() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const s = (id,t) => { const el = document.getElementById(id); if (el && t != null) el.textContent = t; };
    s('btn-policy-privacy', L.row_policy); s('btn-policy-terms', L.row_terms); s('policy-back', L.policy_back);
    s('row-logout-btn', L.row_logout_btn);
    s('row-delete-label', L.row_delete); s('row-delete-sub', L.row_delete_sub); s('row-delete-btn', L.row_delete_btn);
    const priv = document.getElementById('privacy-text');
    if (priv) priv.innerHTML = sbUser ? L.privacy_cloud : L.privacy;
    // 아이콘만 있는 버튼의 읽기용 이름
    const label = (sel, t) => document.querySelectorAll(sel).forEach(el => el.setAttribute('aria-label', t));
    label('.ib-close', L.a11y_close);
    label('.icon-btn[onclick="openVault()"]', L.a11y_vault);
    label('.icon-btn[onclick="openSettings()"]', L.a11y_settings);
    label('#btn-dashboard-top', L.a11y_dashboard);
    label('.font-btn[onclick="cycleFont(-1)"]', L.a11y_font_down);
    label('.font-btn[onclick="cycleFont(1)"]', L.a11y_font_up);
    label('#closing-timer', L.a11y_timer);
    if (sel && sel.emotion && !document.getElementById('step4').classList.contains('hidden')) renderCareCard();
    renderOnThisDay();
}

/* ── 접근성: 대화상자 역할, Esc로 닫기, 장식 요소 숨김 ── */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.overlay, #premium-modal, #devpw-modal, #consent-modal').forEach(el => {
        el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
        const title = el.querySelector('.overlay-title, .pm-title, .consent-title, .devpw-label');
        if (title) { if (!title.id) title.id = el.id + '-heading'; el.setAttribute('aria-labelledby', title.id); }
    });
    const toastEl = document.getElementById('toast');
    if (toastEl) { toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); }
    document.querySelectorAll('#stars, .aurora, #night-intro .ni-star, .moon-orbital').forEach(el => el.setAttribute('aria-hidden', 'true'));
    const timer = document.getElementById('closing-timer');
    if (timer) {
        timer.setAttribute('role', 'button'); timer.setAttribute('tabindex', '0');
        timer.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); extendClosingTimer(); } });
    }
    // Esc: 가장 위에 떠 있는 창 하나만 닫음 (첫 방문 이름 입력창은 제외 — 닫으면 시작할 방법이 없음)
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        const open = [...document.querySelectorAll('#consent-modal, #devpw-modal, #premium-modal, .overlay')]
            .filter(el => !el.classList.contains('hidden') && el.id !== 'overlay-name')
            .sort((a, b) => (parseInt(getComputedStyle(b).zIndex) || 0) - (parseInt(getComputedStyle(a).zIndex) || 0));
        if (open[0]) open[0].classList.add('hidden');
    });
});
