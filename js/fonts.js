/* 밤의 목장 — js/fonts.js : 말씀 글꼴 고르기 (기본 나눔명조 무료, 나머지는 프리미엄)
   고른 글꼴은 말씀·묵상 화면과 말씀 카드·PDF에 그대로 쓰이도록 --font-verse 변수 하나만 바꾼다. 글꼴은 구글 폰트(모두 SIL OFL, 상업 이용 가능)에서 고를 때 불러옴 */

const VERSE_FONTS = [
    { id: 'myeongjo', family: "'Nanum Myeongjo','Noto Serif KR','AppleMyungjo','Batang',serif", gf: '' },
    { id: 'gowunbatang', family: "'Gowun Batang','Nanum Myeongjo','Batang',serif", gf: 'Gowun+Batang:wght@400;700' },
    { id: 'songmyung', family: "'Song Myung','Nanum Myeongjo','Batang',serif", gf: 'Song+Myung' },
    { id: 'penscript', family: "'Nanum Pen Script','Nanum Myeongjo',cursive", gf: 'Nanum+Pen+Script' },
    { id: 'gowundodum', family: "'Gowun Dodum','Pretendard','Malgun Gothic',sans-serif", gf: 'Gowun+Dodum' },
];
const FONT_TEXT = {
    ko: { label: '말씀 글꼴', names: ['나눔명조 (기본)', '고운바탕', '송명', '나눔 손글씨', '고운돋움'] },
    en: { label: 'Verse font', names: ['Nanum Myeongjo (default)', 'Gowun Batang', 'Song Myung', 'Nanum Pen Script', 'Gowun Dodum'] },
    ja: { label: 'み言葉の書体', names: ['ナヌムミョンジョ (標準)', 'ゴウンバタン', 'ソンミョン', 'ナヌム手書き', 'ゴウンドドゥム'] },
};

/* 지금 쓰도록 저장된 글꼴 (프리미엄이 아니면 기본) */
function verseFontNow() {
    const f = VERSE_FONTS.find(v => v.id === lsGet('verseFont')) || VERSE_FONTS[0];
    return (f.gf && !isPremium()) ? VERSE_FONTS[0] : f;
}

/* 글꼴을 화면 전체에 적용 (필요하면 구글 폰트 스타일시트를 한 번 불러옴) */
function applyVerseFont() {
    const f = verseFontNow();
    ensureFontLink(f);
    document.documentElement.style.setProperty('--font-verse', f.family);
}

/* 글꼴의 구글 폰트 스타일시트를 (아직 없으면) 한 번 불러옴 */
function ensureFontLink(f) {
    if (!f.gf || document.getElementById('vf-' + f.id)) return;
    const l = document.createElement('link');
    l.id = 'vf-' + f.id; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + f.gf + '&display=swap';
    document.head.appendChild(l);
}

/* 설정 화면의 글꼴 고르기 버튼들을 그린다 */
function renderFontPicker(preview) {
    const box = document.getElementById('font-picker');
    if (!box) return;
    if (preview) VERSE_FONTS.forEach(ensureFontLink);   // 설정을 열었을 때만 모든 글꼴 모양을 미리 보여 줌
    const T = FONT_TEXT[appLang] || FONT_TEXT.ko, cur = verseFontNow().id;
    box.innerHTML = '<div class="settings-label">' + escHtml(T.label) + '</div><div class="settings-card"><div class="vf-list">' +
        VERSE_FONTS.map((f, i) => `<button type="button" class="vf-btn${f.id === cur ? ' active' : ''}" style="font-family:${f.family}" onclick="pickVerseFont('${f.id}')">${escHtml(T.names[i])}${f.gf && !isPremium() ? ' <em class="eic">' + iconHtml('ui', 'lock') + '</em>' : ''}</button>`).join('') +
        '</div></div>';
}

/* 글꼴 고르기 (프리미엄이 아니면 안내) */
function pickVerseFont(id) {
    const f = VERSE_FONTS.find(v => v.id === id);
    if (!f) return;
    if (f.gf && !isPremium()) { openPremiumModal(); return; }
    lsSet('verseFont', id);
    applyVerseFont(); renderFontPicker();
}
