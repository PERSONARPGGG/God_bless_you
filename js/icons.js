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
        기도: '<path d="M12 6.5v14"/><path d="M12 6.5L8.2 12c-1.3 1.8-.8 3.8.6 5l3.2 3.5"/><path d="M12 6.5L15.8 12c1.3 1.8.8 3.8-.6 5L12 20.5"/><path d="M12 3.2v1.4"/>'
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
