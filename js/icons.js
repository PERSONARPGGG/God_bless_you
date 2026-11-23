/* 밤의 목장 — js/icons.js : 자체 제작 선 그림 아이콘 18개 (감정 6 · 주제 8 · 필요 4)
   이모지 대신 씀 — 기기마다 모양이 달라지는 문제가 없고, 글자 크기(1em)·글자색(currentColor)을 그대로 따라가서 칸을 넘치지 않음.
   쓰는 곳: index.html의 data-ic="emo:감사"(fillIcons가 채움) · iconHtml()/labelHtml()로 만드는 배지·태그 */

/* 24×24 안에서 그린 선 그림. 같은 굵기·둥근 끝으로 맞춤 */
const ICONS = {
    emo: {
        감사: '<circle cx="12" cy="12" r="9"/><path d="M8 10.5q1.3-1.8 2.6 0M13.4 10.5q1.3-1.8 2.6 0"/><path d="M8 14q4 4.4 8 0"/>',
        평안: '<circle cx="12" cy="12" r="9"/><path d="M8 11q1.3 1.6 2.6 0M13.4 11q1.3 1.6 2.6 0"/><path d="M9.5 15q2.5 1.6 5 0"/>',
        걱정: '<circle cx="12" cy="12" r="9"/><path d="M7.6 9l2.6-1M16.4 9l-2.6-1"/><circle cx="9.3" cy="11.5" r=".6" fill="currentColor"/><circle cx="14.7" cy="11.5" r=".6" fill="currentColor"/><path d="M9.5 16q2.5-1.6 5 0"/>',
        지침: '<circle cx="12" cy="12" r="9"/><path d="M7.8 11h3M13.2 11h3"/><path d="M9.5 16h5"/>',
        아픔: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10.5" r=".7" fill="currentColor"/><circle cx="15" cy="10.5" r=".7" fill="currentColor"/><path d="M9.2 16q2.8-2.2 5.6 0"/><path d="M9 13.2q-.9 1.3 0 2" />',
        기도: '<path d="M8 20.5C5.6 15.6 7.4 9.6 14.6 3.6c2 2.2 1 8-2.2 16.9z"/><path d="M12.2 7.6l1.8 1.8M10 11.2l2.4 1.6"/><path d="M10.6 17.4c.9-1.5 2.2-1.7 3-.8"/><path d="M7.2 20.6h6.6"/>'
    },
    topic: {
        일:   '<rect x="3" y="8" width="18" height="12" rx="2.2"/><path d="M9 8V6.2Q9 5 10.2 5h3.6Q15 5 15 6.2V8M3 13.5h18"/>',
        가족: '<path d="M4 11.2L12 4l8 7.2V20H4z"/><path d="M10 20v-5h4v5"/>',
        공부: '<path d="M12 6.2C9.8 4.7 6.8 4.2 4 4.7v13.6c2.8-.5 5.8 0 8 1.5 2.2-1.5 5.2-2 8-1.5V4.7c-2.8-.5-5.8 0-8 1.5z"/><path d="M12 6.2v13.6"/>',
        사람: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19.5c0-3.2 2.4-5.5 5.5-5.5s5.5 2.3 5.5 5.5"/><circle cx="17" cy="9" r="2.3"/><path d="M16.2 14c2.8 0 4.8 1.9 4.8 5"/>',
        건강: '<path d="M5 19C5 10.5 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19l8-8"/>',
        자녀: '<circle cx="12" cy="13" r="7"/><path d="M12 6q-1.2-2.6 1.8-3"/><circle cx="9.4" cy="12.6" r=".7" fill="currentColor"/><circle cx="14.6" cy="12.6" r=".7" fill="currentColor"/><path d="M9.8 15.8q2.2 1.6 4.4 0"/>',
        신앙: '<path d="M12 3.5v17M6.5 9h11"/>',
        모름: '<path d="M7.5 18.5a4 4 0 010-8 5.3 5.3 0 0110-1.3 4.7 4.7 0 01-.5 9.3z"/>'
    },
    need: {
        위로: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0112 7.6a4.1 4.1 0 017.5 2.2C19.5 15.4 12 20 12 20z"/>',
        힘:   '<path d="M3 19.5l6.2-10.2 3.6 5.6 2.2-3.2 6 7.8z"/><path d="M9.2 9.3l1.6 2.6"/>',
        지혜: '<path d="M12 3.2a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3.2z"/><path d="M9.8 19h4.4M10.6 21.2h2.8"/>',
        쉼:   '<path d="M5 11h11v3.5a4.8 4.8 0 01-4.8 4.8h-1.4A4.8 4.8 0 015 14.5z"/><path d="M16 12.2h1.2a2.4 2.4 0 010 4.8H15.6"/><path d="M8.6 4.2c-1 1 1 2 0 3.2M12.4 4.2c-1 1 1 2 0 3.2"/>'
    }
};

/* 아이콘 하나를 <svg> 글자로. kind = emo | topic | need, 없는 키면 빈 글자 */
function iconHtml(kind, key) {
    const body = ICONS[kind] && ICONS[kind][key];
    if (!body) return '';
    return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
}

/* 아이콘 + 글자 라벨(배지·태그용 HTML). eLabel/tLabel/nLabel은 글자만, 이쪽은 그림까지 */
function labelHtml(kind, key) {
    const fn = kind === 'emo' ? eLabel : kind === 'topic' ? tLabel : nLabel;
    return iconHtml(kind, key) + '<span>' + escHtml(fn(key)) + '</span>';
}

/* index.html의 data-ic="종류:키" 자리에 아이콘을 채움 */
function fillIcons() {
    document.querySelectorAll('[data-ic]').forEach(el => {
        const [kind, key] = el.dataset.ic.split(':');
        el.innerHTML = iconHtml(kind, key);
    });
}

/* 화면 곳곳의 버튼·안내에 쓰는 그림 (kind = ui) */
ICONS.ui = {
    star:   '<path d="M12 3.6l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.9 6.7 19.7l1.1-5.8L3.5 9.8l5.9-.8z"/>',
    sparkle:'<path d="M11 4l1.7 5.3L18 11l-5.3 1.7L11 18l-1.7-5.3L4 11l5.3-1.7z"/><path d="M18.5 3.5v3M17 5h3"/>',
    cloud:  '<path d="M7.5 18.5a4 4 0 010-8 5.3 5.3 0 0110-1.3 4.7 4.7 0 01-.5 9.3z"/>',
    lock:   '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"/>',
    unlock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 016.8-1.2"/>',
    clipboard:'<rect x="6" y="5" width="12" height="15.5" rx="2"/><path d="M9.5 5V3.8h5V5M9 10h6M9 13.5h6M9 17h3.5"/>',
    chart:  '<path d="M4 20h16M7 17v-5M12 17V6M17 17v-8"/>',
    notebook:'<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5v17M12 8h4M12 11.5h4"/>',
    book:   '<path d="M12 6.2C9.8 4.7 6.8 4.2 4 4.7v13.6c2.8-.5 5.8 0 8 1.5 2.2-1.5 5.2-2 8-1.5V4.7c-2.8-.5-5.8 0-8 1.5z"/><path d="M12 6.2v13.6"/>',
    music:  '<path d="M9 17.5V6l9-2v11.5"/><circle cx="6.8" cy="17.5" r="2.2"/><circle cx="15.8" cy="15.5" r="2.2"/>',
    flame:  '<path d="M12 3.5c1 3.2 4.7 5 4.7 9.4a4.7 4.7 0 01-9.4 0c0-2 1-3.2 2-4.2.3 1.2.9 1.9 1.6 2.3C11 8.6 11 6 12 3.5z"/>',
    heart:  '<path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0112 7.6a4.1 4.1 0 017.5 2.2C19.5 15.4 12 20 12 20z"/>',
    flower: '<circle cx="12" cy="12" r="2.2"/><path d="M12 9.8c-2.6-2.4-1.6-5.8 0-6.3 1.6.5 2.6 3.9 0 6.3zM14.2 12c2.4-2.6 5.8-1.6 6.3 0-.5 1.6-3.9 2.6-6.3 0zM12 14.2c2.6 2.4 1.6 5.8 0 6.3-1.6-.5-2.6-3.9 0-6.3zM9.8 12c-2.4 2.6-5.8 1.6-6.3 0 .5-1.6 3.9-2.6 6.3 0z"/>',
    leaf:   '<path d="M5 19C5 10.5 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19l8-8"/>',
    sprout: '<path d="M12 20v-8M12 12c0-3-2-5-6-5 0 4 2 5.5 6 5zM12 14c0-2.5 1.8-4 5-4 0 3.5-1.8 4.3-5 4z"/>',
    file:   '<path d="M7 3.5h7l4 4V20.5H7z"/><path d="M14 3.5v4h4M9.5 13h5M9.5 16.5h5"/>',
    gear:   '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.4M12 18.1v2.4M3.5 12h2.4M18.1 12h2.4M6 6l1.7 1.7M16.3 16.3L18 18M18 6l-1.7 1.7M7.7 16.3L6 18"/>',
    gem:    '<path d="M7 4.5h10l3.5 5L12 20 3.5 9.5z"/><path d="M3.5 9.5h17M9.5 4.5L8 9.5l4 10.5 4-10.5-1.5-5"/>',
    refresh:'<path d="M19.5 12a7.5 7.5 0 01-13 5M4.5 12a7.5 7.5 0 0113-5"/><path d="M17.5 3v4h-4M6.5 21v-4h4"/>',
    share:  '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V12"/>',
    candle: '<rect x="9" y="11" width="6" height="9" rx="1"/><path d="M12 3.5c1.6 2 1.8 3.2 0 5-1.8-1.8-1.6-3 0-5z"/>',
    phone:  '<path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 005.7 5.7L16 13l4 1.5v3a2 2 0 01-2 2A14 14 0 014.5 6a2 2 0 012-2z"/>',
    mobile: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    palette:'<path d="M12 3.5a8.5 8.5 0 000 17c1.2 0 1.6-.8 1.2-1.7-.5-1.1.2-2.3 1.5-2.3H17a3.5 3.5 0 003.5-3.5C20.5 7.2 16.7 3.5 12 3.5z"/><circle cx="8" cy="11" r=".9" fill="currentColor"/><circle cx="11.5" cy="7.8" r=".9" fill="currentColor"/><circle cx="15.5" cy="9" r=".9" fill="currentColor"/>',
    calendar:'<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    bell:   '<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 004 0"/>',
    image:  '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M4.5 17l4.5-4.5 3.5 3.5 2.5-2.5 4.5 4.5"/>',
    sheep:  '<path d="M7 13a3 3 0 011-5.6 3.6 3.6 0 016.4-.6A3 3 0 0118 12.5 3 3 0 0116.5 17H8.5A2.5 2.5 0 017 13z"/><path d="M9 17v3M15 17v3"/>',
    tree:   '<path d="M12 3.5l5 6h-3l4 5.5H6l4-5.5H7z"/><path d="M12 15v5"/>',
    pause:  '<path d="M9 5v14M15 5v14"/>',
    play:   '<path d="M8 5l11 7-11 7z"/>',
    next:   '<path d="M6 5l9 7-9 7zM18 5v14"/>',
    plus:   '<path d="M12 5v14M5 12h14"/>',
    up:     '<path d="M12 19V5M6 11l6-6 6 6"/>',
    link:   '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    globe:  '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.6 5.4 3.6 8.5s-1 6.1-3.6 8.5c-2.6-2.4-3.6-5.4-3.6-8.5s1-6.1 3.6-8.5z"/>',
    sun:    '<circle cx="12" cy="12" r="4"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
    dawn:   '<path d="M4 18h16M7 18a5 5 0 0110 0M12 7V5M5.5 10.5L4 9M18.5 10.5L20 9"/>',
    wave:   '<path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
    feather:'<path d="M18.5 4.5c-8 0-12 4.5-12 11v4M6.5 15.5c6 0 10-3 12-11M9 13l3-3"/>',
    bubble: '<path d="M5 6.5A2.5 2.5 0 017.5 4h9A2.5 2.5 0 0119 6.5v6a2.5 2.5 0 01-2.5 2.5H11l-4 3.5V15a2.5 2.5 0 01-2-2.4z"/>',
    snow:   '<path d="M12 3.5v17M4.6 7.8l14.8 8.4M19.4 7.8L4.6 16.2"/>',
    moon:   '<path d="M19.5 14.2A8 8 0 019.8 4.5a8 8 0 109.7 9.7z"/>',
    moonfull:'<circle cx="12" cy="12" r="7.5"/>',
    bubbles:'<circle cx="9" cy="14" r="4"/><circle cx="16" cy="8" r="2.5"/>'
};

/* 이모지 → 그림 대응표. 표에 없는 이모지는 그대로 둠(사용자 이름·AI 글 속 이모지를 지우지 않기 위해). ✦ ★ ✓ ♥ ♪ 같은 글자 기호는 그대로 둠 */
const EMOJI_ICON = {
    '⭐':'ui:star','🌟':'ui:sparkle','💫':'ui:sparkle','🌠':'ui:sparkle','✨':'ui:sparkle','🎉':'ui:sparkle','🎊':'ui:sparkle','🌌':'ui:sparkle',
    '☁':'ui:cloud','🌫':'ui:cloud','🔒':'ui:lock','🔓':'ui:unlock','📋':'ui:clipboard','📊':'ui:chart','📔':'ui:notebook','📖':'ui:book',
    '🎵':'ui:music','🔥':'ui:flame','💙':'ui:heart','💛':'ui:heart','💚':'ui:heart','💜':'ui:heart','💗':'ui:heart','💝':'ui:heart','🫶':'ui:heart',
    '🌷':'ui:flower','🌸':'ui:flower','🌺':'ui:flower','🌼':'ui:flower','💐':'ui:flower','🌹':'ui:flower','🌾':'ui:leaf','🌿':'topic:건강','🍀':'ui:leaf','🍃':'ui:leaf',
    '🌱':'ui:sprout','📄':'ui:file','⚙':'ui:gear','💎':'ui:gem','🔮':'ui:gem','🔷':'ui:gem','🔄':'ui:refresh','📤':'ui:share','🕯':'ui:candle',
    '📞':'ui:phone','📱':'ui:mobile','🎨':'ui:palette','🗓':'ui:calendar','🔔':'ui:bell','🖼':'ui:image','🐑':'ui:sheep','🎄':'ui:tree',
    '⏸':'ui:pause','▶':'ui:play','⏭':'ui:next','➕':'ui:plus','⬆':'ui:up','🔗':'ui:link','🌐':'ui:globe','🌍':'ui:globe','☀':'ui:sun','🌅':'ui:dawn',
    '🌊':'ui:wave','🕊':'ui:feather','💭':'ui:bubble','❄':'ui:snow','🌕':'ui:moonfull','\u{1F319}':'ui:moon','🌀':'ui:moonfull','🫧':'ui:bubbles',
    '🙏':'emo:기도','😊':'emo:감사','😌':'emo:평안','😔':'emo:걱정','😞':'emo:지침','😢':'emo:아픔','💼':'topic:일','👔':'topic:일','🏠':'topic:가족','✝':'topic:신앙'
};
const EMOJI_RE = new RegExp('(' + Object.keys(EMOJI_ICON).join('|') + ')\\uFE0F?[ ]?', 'gu');
/* 이모지 변환을 건너뛸 곳: 사용자가 쓴 글(일기)·입력칸·그림 자체 */
const EMOJI_SKIP = 'script,style,textarea,input,svg,[contenteditable],[data-ic],[data-no-ic],.otd-diary,.db-diary-txt,.hc-entry-diary,.pd-diary,.mood-diary';

/* 글자에 바꿀 이모지가 있는지 */
function hasEmoji(text) { EMOJI_RE.lastIndex = 0; const r = EMOJI_RE.test(text); EMOJI_RE.lastIndex = 0; return r; }

/* 글자 안의 이모지를 그림으로 바꾼 조각(DocumentFragment)을 만든다. 바꿀 게 없으면 null */
function emojiToFragment(text) {
    if (!hasEmoji(text)) return null;
    const frag = document.createDocumentFragment();
    let last = 0, m;
    EMOJI_RE.lastIndex = 0;
    while ((m = EMOJI_RE.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const key = EMOJI_ICON[m[1]];
        if (key) {
            const [kind, name] = key.split(':');
            const span = document.createElement('span');
            span.className = 'eic' + (/ $/.test(m[0]) ? ' sp' : '');
            span.innerHTML = iconHtml(kind, name);
            frag.appendChild(span);
        }
        last = EMOJI_RE.lastIndex;
    }
    EMOJI_RE.lastIndex = 0;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
}

/* 한 요소 안의 글자 조각들을 훑어 이모지를 그림으로 교체 */
function replaceEmojiIn(root) {
    if (!root) return;
    if (root.nodeType === 3) root = root.parentNode;
    if (!root || root.nodeType !== 1 || (root.closest && root.closest(EMOJI_SKIP))) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (hasEmoji(n.nodeValue) && !(n.parentNode.closest && n.parentNode.closest(EMOJI_SKIP))) hits.push(n);
    }
    hits.forEach(n => { const f = emojiToFragment(n.nodeValue); if (f) n.parentNode.replaceChild(f, n); });
}

/* 앞으로 생기거나 바뀌는 글자도 자동으로 그림 교체 (토스트·언어 전환·동적 목록 전부) */
function startEmojiIcons() {
    if (!window.MutationObserver || !document.body) return;
    replaceEmojiIn(document.body);
    new MutationObserver(muts => {
        muts.forEach(mu => {
            if (mu.type === 'characterData') replaceEmojiIn(mu.target);
            else mu.addedNodes.forEach(n => replaceEmojiIn(n));
        });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
}
