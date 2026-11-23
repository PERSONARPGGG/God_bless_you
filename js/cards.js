/* 밤의 목장 — js/cards.js : 말씀 카드 이미지(공유용) 5가지 모양 + 모양 고르는 창
   밤하늘만 무료, 나머지는 프리미엄. 글꼴은 앱 말씀과 같은 --font-verse(나눔명조 등). 그림은 모두 캔버스에 직접 그림(외부 이미지 없음)
   쓰는 곳: 결과 화면의 "공유" → shareVerse() → 고르는 창 → share.js의 shareVerseWith(style) */

const CARD_W = 1080, CARD_H = 1350;
const CARD_TEXT = {
    ko: { title: '말씀 카드 모양', go: '이 모양으로 공유', close: '닫기', names: ['밤하늘', '새벽빛', '풀숲', '편지지', '노을'] },
    en: { title: 'Card style', go: 'Share this card', close: 'Close', names: ['Night sky', 'Dawn', 'Meadow', 'Letter', 'Sunset'] },
    ja: { title: 'カードの形', go: 'この形で共有', close: '閉じる', names: ['夜空', '夜明け', '草原', '便箋', '夕焼け'] },
};

/* 카드 모양 정의: 배경 그리기 · 글자색 · 양 소품 */
const CARD_STYLES = [
    { id: 'night',  premium: false, ink: 'rgba(255,252,245,.95)', ref: '#c8a870', foot: 'rgba(255,255,255,.45)', wool: '#f3efe6', costume: '' },
    { id: 'dawn',   premium: true,  ink: '#5a4042', ref: '#b07a5a', foot: 'rgba(90,64,66,.55)',  wool: '#fffaf3', costume: 'crown' },
    { id: 'forest', premium: true,  ink: '#2f4a35', ref: '#6f8f5a', foot: 'rgba(47,74,53,.55)',  wool: '#fbf8ee', costume: 'explorer' },
    { id: 'letter', premium: true,  ink: '#4a3b2a', ref: '#8a6d3b', foot: 'rgba(74,59,42,.5)',   wool: '#fffdf6', costume: '' },
    { id: 'ember',  premium: true,  ink: '#fff4e4', ref: '#f3c89a', foot: 'rgba(255,244,228,.55)', wool: '#fff3e6', costume: 'beanie' },
];

/* 둥근 사각형 경로 */
function cardRR(x, px, py, w, h, r) { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); }

/* 양 한 마리 그리기 (왼쪽 아래 기준 ox,oy · 배율 s · 오른쪽을 봄) */
function cardLamb(x, ox, oy, s, wool, costume) {
    x.save(); x.translate(ox, oy); x.scale(s, s);
    const dark = '#4a403a', circle = (cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); };
    x.fillStyle = 'rgba(0,0,0,.14)'; x.beginPath(); x.ellipse(24, 47, 24, 3, 0, 0, 7); x.fill();               // 그림자
    x.fillStyle = dark; [9, 17, 27, 35].forEach(lx => { cardRR(x, lx, 34, 3.6, 12, 1.5); x.fill(); });         // 다리
    cardRR(x, 2, 12, 42, 24, 12); x.fillStyle = wool; x.fill();                                                  // 몸
    circle(7, 15, 7, wool); circle(31, 10, 8, wool); circle(19, 9, 7, wool); circle(2, 22, 4, wool);            // 털 뭉치
    x.fillStyle = 'rgba(150,150,180,.22)'; cardRR(x, 8, 26, 34, 9, 5); x.fill();                                // 아랫 그늘
    x.fillStyle = dark; x.beginPath(); x.ellipse(52, 17, 7.6, 6.6, 0, 0, 7); x.fill();                           // 얼굴
    x.beginPath(); x.ellipse(46, 15, 4.2, 2.4, -.5, 0, 7); x.fill();                                              // 귀
    circle(49, 8, 5.5, wool);                                                                                     // 머리 털
    circle(54.6, 15.6, 1.4, '#fff'); circle(53.6, 20, 1.9, 'rgba(255,150,165,.65)');                             // 눈·볼
    if (costume === 'explorer') { x.fillStyle = '#c7ab75'; x.beginPath(); x.ellipse(50, 8.6, 9.5, 2, 0, 0, 7); x.fill(); x.fillStyle = '#dcc594'; x.beginPath(); x.arc(50, 8, 6, Math.PI, 0); x.fill(); x.fillStyle = '#8fb36f'; x.fillRect(44, 6.3, 12, 1.8); }
    if (costume === 'crown') { circle(45, 7, 2.6, '#f8bccc'); circle(50, 5, 2.8, '#fff1ac'); circle(55, 7, 2.6, '#d0bcf3'); circle(47.5, 8, 1.6, '#a5d4a2'); circle(52.5, 8, 1.6, '#a5d4a2'); }
    if (costume === 'beanie') { x.fillStyle = '#eaae92'; x.beginPath(); x.arc(50, 8.5, 6.6, Math.PI, 0); x.fill(); x.fillStyle = '#dc8f75'; x.fillRect(43.4, 7.2, 13.2, 2.6); circle(50, 1.6, 2.6, '#fff2de');
        x.fillStyle = '#e08a73'; cardRR(x, 41, 20, 12, 5, 2.5); x.fill(); cardRR(x, 41, 22, 3.4, 10, 1.5); x.fill(); }                                   // 털모자 + 목도리
    x.restore();
}

/* 모양별 배경과 장식 그리기 */
function cardBackground(x, id) {
    const W = CARD_W, H = CARD_H;
    const lin = stops => { const g = x.createLinearGradient(0, 0, 0, H); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, W, H); };
    const glow = (cx, cy, r, col) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); };
    const dot = (px, py, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); };
    if (id === 'night') {
        lin([[0, '#0e1842'], [.35, '#132050'], [.65, '#0a1030'], [1, '#050a1e']]);
        glow(160, 220, 520, 'rgba(40,70,210,.28)'); glow(940, 1140, 470, 'rgba(90,20,190,.2)'); glow(540, 680, 420, 'rgba(180,140,30,.1)');
        for (let i = 0; i < 90; i++) { x.globalAlpha = .12 + Math.random() * .55; dot(Math.random() * W, Math.random() * H, .6 + Math.random() * 2.2, '#fff'); }
        x.globalAlpha = 1;
        x.fillStyle = '#f6e7c1'; x.beginPath(); x.arc(W / 2, 215, 52, 0, 7); x.fill();                      // 달 (초승달)
        x.fillStyle = '#0f1944'; x.beginPath(); x.arc(W / 2 + 26, 200, 46, 0, 7); x.fill();
    } else if (id === 'dawn') {
        lin([[0, '#f6d6e3'], [.5, '#fbe5d8'], [1, '#fff3df']]);
        glow(W / 2, H + 60, 760, 'rgba(255,190,150,.45)');
        [[190, 250, 1], [760, 170, .8], [880, 420, 1.1]].forEach(([cx, cy, k]) => { x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(cx, cy, 120 * k, 34 * k, 0, 0, 7); x.ellipse(cx + 70 * k, cy - 22 * k, 80 * k, 38 * k, 0, 0, 7); x.ellipse(cx - 70 * k, cy - 10 * k, 70 * k, 30 * k, 0, 0, 7); x.fill(); });
        for (let i = 0; i < 26; i++) { x.globalAlpha = .4 + Math.random() * .4; dot(Math.random() * W, 120 + Math.random() * 900, 2 + Math.random() * 3, '#fff'); }
        x.globalAlpha = 1;
    } else if (id === 'forest') {
        lin([[0, '#eaf4e3'], [.55, '#d3e9d0'], [1, '#bcdcbf']]);
        glow(W / 2, 0, 700, 'rgba(255,255,230,.5)');
        for (let i = 0; i < 70; i++) { const gx = Math.random() * W, h = 50 + Math.random() * 110; x.fillStyle = `rgba(${110 + Math.random() * 30},${165 + Math.random() * 40},${120 + Math.random() * 30},.6)`;
            x.beginPath(); x.moveTo(gx - 9, H); x.quadraticCurveTo(gx - 4, H - h * .6, gx + (Math.random() * 30 - 15), H - h); x.quadraticCurveTo(gx + 6, H - h * .5, gx + 9, H); x.fill(); }
        const fx = W - 130, fy = H - 90;                                                                       // 오른쪽 아래 들꽃 한 송이
        x.strokeStyle = '#7fae7c'; x.lineWidth = 7; x.beginPath(); x.moveTo(fx, H); x.quadraticCurveTo(fx - 18, fy + 60, fx + 4, fy - 160); x.stroke();
        for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; dot(fx + 4 + Math.cos(a) * 30, fy - 170 + Math.sin(a) * 30, 22, '#f6bccd'); }
        dot(fx + 4, fy - 170, 16, '#ffe9a8');
    } else if (id === 'letter') {
        lin([[0, '#f3ead6'], [1, '#eadfc6']]);
        x.fillStyle = '#fffaf0'; cardRR(x, 70, 70, W - 140, H - 140, 14); x.fill();
        x.strokeStyle = 'rgba(160,130,90,.18)'; x.lineWidth = 2;
        for (let ly = 240; ly < H - 150; ly += 74) { x.beginPath(); x.moveTo(130, ly); x.lineTo(W - 130, ly); x.stroke(); }
        x.strokeStyle = 'rgba(214,120,130,.35)'; x.beginPath(); x.moveTo(170, 120); x.lineTo(170, H - 120); x.stroke();
        x.save(); x.translate(W / 2, 78); x.rotate(-.03); x.fillStyle = 'rgba(244,182,196,.7)'; x.fillRect(-120, -26, 240, 52);        // 마스킹 테이프
        x.fillStyle = 'rgba(255,255,255,.35)'; for (let k = -110; k < 110; k += 30) x.fillRect(k, -26, 12, 52); x.restore();
    } else if (id === 'ember') {
        lin([[0, '#2a1a2c'], [.55, '#51303a'], [1, '#b8715a']]);
        glow(W / 2, H + 40, 800, 'rgba(255,190,130,.5)'); glow(W - 150, H - 180, 260, 'rgba(255,206,140,.35)');
        for (let i = 0; i < 40; i++) { x.globalAlpha = .25 + Math.random() * .6; dot(Math.random() * W, 300 + Math.random() * 1000, 1.5 + Math.random() * 3, '#ffd6a8'); }
        x.globalAlpha = 1;
        x.fillStyle = '#f7ead2'; cardRR(x, W - 168, H - 230, 34, 110, 8); x.fill();                           // 촛불
        const fg = x.createLinearGradient(0, H - 290, 0, H - 232); fg.addColorStop(0, '#fff4c4'); fg.addColorStop(1, '#f59a5b'); x.fillStyle = fg;
        x.beginPath(); x.ellipse(W - 151, H - 262, 13, 30, 0, 0, 7); x.fill();
    }
}

/* 말씀 카드 한 장을 캔버스로 그린다 (style = CARD_STYLES의 한 칸) */
async function makeVerseCardCanvas(st) {
    const verse = curVerse;   // 그리는 동안 다시 시작해 말씀이 바뀌어도 이 장은 처음 말씀으로 끝까지 그림
    if (!verse) return null;
    const W = CARD_W, H = CARD_H;
    const vf = verseFontNow(), VF = vf.family;   // 앱 말씀과 같은 글꼴(설정에서 고른 것)
    ensureFontLink(vf);
    try { await Promise.race([document.fonts.load('600 52px ' + vf.family.split(',')[0], verse.v), new Promise(r => setTimeout(r, 2000))]); } catch (e) {}   // 글꼴이 준비된 뒤 그림
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    cardBackground(x, st.id);
    x.textAlign = 'center';
    /* 본문: 길수록 글자를 줄여 양 그림과 겹치지 않게 */
    const maxW = st.id === 'letter' ? 700 : 820, text = '“' + verse.v + '”';
    let size = 54, lines, lh;
    for (; size >= 38; size -= 2) {
        x.font = '600 ' + size + 'px ' + VF; lines = []; let line = '';
        text.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
        if (line) lines.push(line);
        lh = Math.round(size * 1.7);
        if (lines.length * lh <= 560) break;
    }
    const top = Math.max(330, (H - lines.length * lh) / 2 - 120);
    let y = top;
    x.fillStyle = st.ink;
    lines.forEach(l => { x.fillText(l, W / 2, y); y += lh; });
    x.fillStyle = st.ref; x.font = '600 40px ' + VF;
    x.fillText('— ' + verse.r, W / 2, y + 22);
    /* 양들 (큰 양 + 새끼 양) */
    const ly = H - 150;
    cardLamb(x, 210, ly, 3.6, st.wool, st.costume);
    cardLamb(x, 470, ly + 6, 2.0, st.id === 'night' ? '#f6e6ec' : '#fbeef2', st.costume);
    x.fillStyle = st.foot; x.font = '500 30px ' + VF;
    x.fillText('밤의 목장 · ' + SHARE_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''), W / 2, H - 56);
    return c;
}

/* 말씀 카드 이미지(PNG Blob). style 인자가 없으면 저장된 모양(없으면 밤하늘) */
function makeVerseCardBlob(st) {
    st = st || cardStyleNow();
    return makeVerseCardCanvas(st).then(c => new Promise((res, rej) => !c ? rej(new Error('no verse')) : c.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')));
}

/* 고른 카드 모양 (프리미엄이 아니면 잠긴 모양은 밤하늘로) */
function cardStyleNow() {
    const id = lsGet('cardStyle');
    const st = CARD_STYLES.find(s => s.id === id) || CARD_STYLES[0];
    return (st.premium && !isPremium()) ? CARD_STYLES[0] : st;
}

/* 공유 버튼: 카드 모양 고르는 창을 연다 */
async function shareVerse() {
    if (!curVerse) return;
    openCardPicker();
}

/* 카드 모양 고르는 창 (작은 미리보기 5장) */
async function openCardPicker() {
    const T = CARD_TEXT[appLang] || CARD_TEXT.ko;
    let m = document.getElementById('card-picker');
    if (!m) { m = document.createElement('div'); m.id = 'card-picker'; document.body.appendChild(m); }
    m.className = ''; m.onclick = e => { if (e.target === m) closeCardPicker(); };
    m.innerHTML = `<div class="cp-box"><div class="cp-title">${escHtml(T.title)}</div><div class="cp-grid" id="cp-grid"></div>
        <button type="button" class="cp-go" id="cp-go" onclick="goCardShare()">${escHtml(T.go)}</button><button type="button" class="cp-close" onclick="closeCardPicker()">${escHtml(T.close)}</button></div>`;
    const sel = (CARD_STYLES.find(s => s.id === lsGet('cardStyle')) || CARD_STYLES[0]).id;
    const grid = document.getElementById('cp-grid');
    CARD_STYLES.forEach((st, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'cp-item' + (st.id === sel ? ' on' : ''); b.dataset.id = st.id;
        b.innerHTML = `<canvas width="150" height="188"></canvas><span>${escHtml(T.names[i])}${st.premium && !isPremium() ? ' <em class="eic">' + iconHtml('ui', 'lock') + '</em>' : ''}</span>`;
        b.onclick = () => { lsSet('cardStyle', st.id); grid.querySelectorAll('.cp-item').forEach(e => e.classList.toggle('on', e === b)); };
        grid.appendChild(b);
    });
    for (let i = 0; i < CARD_STYLES.length; i++) {   // 미리보기는 하나씩 천천히 그림(한꺼번에 그리면 느린 폰이 멈춤)
        if (m.className === 'hidden' || !grid.isConnected) return;   // 그 사이 창을 닫았으면 그만
        const big = await makeVerseCardCanvas(CARD_STYLES[i]);
        if (!big) return;
        const cv = grid.children[i] && grid.children[i].querySelector('canvas');
        if (cv) cv.getContext('2d').drawImage(big, 0, 0, 150, 188);
    }
}
/* 카드 모양 창 닫기 */
function closeCardPicker() { const m = document.getElementById('card-picker'); if (m) m.className = 'hidden'; }
/* 고른 모양으로 공유 (잠긴 모양이면 프리미엄 안내) */
function goCardShare() {
    const st = CARD_STYLES.find(s => s.id === lsGet('cardStyle')) || CARD_STYLES[0];
    if (st.premium && !isPremium()) { closeCardPicker(); openPremiumModal(); return; }
    closeCardPicker();
    shareVerseWith(st);
}
