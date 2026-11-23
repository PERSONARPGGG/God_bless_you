/* 밤의 목장 — js/deco.js : 테마·계절 배경 장식 (풀숲의 흔들리는 풀·여운 있는 소품 하나·계절 입자)
   그림은 css/deco.css가 그리고, 이 파일은 "어떤 조각을 몇 개 어디에 놓을지"만 정한다. 화면 뒤 고정 층(#theme-deco)이며 누를 수 없고 글씨를 가리지 않음.
   무료(밤하늘) = 계절 입자만 조금 / 프리미엄 테마 = 배경 장식 + 오른쪽 아래의 여운 소품 + 계절 입자 + 양 소품(모자·목도리, css/deco.css) */

const DECO_SEASONS = ['spring', 'summer', 'autumn', 'winter'];

/* 지금 계절 (개발자 보드에서 고른 미리보기가 있으면 그것) — 3~5월 봄, 6~8월 여름, 9~11월 가을, 12~2월 겨울 */
function currentSeason() {
    const pv = sessionStorage.getItem('seasonPreview');
    if (DECO_SEASONS.includes(pv)) return pv;
    const m = new Date().getMonth() + 1;
    return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter';
}

/* n개의 조각을 같은 모양으로 흩어 놓는다 (위치·박자·크기는 무작위) */
function decoBits(n, cls, build) {
    let h = '';
    for (let i = 0; i < n; i++) h += '<i class="' + cls + '" style="' + build(i) + '"></i>';
    return h;
}
const _rnd = (a, b) => (a + Math.random() * (b - a)).toFixed(2);

/* 테마별 배경 조각 모음 */
const DECO_THEME = {
    forest: () =>
        '<div class="dc-tree l"></div><div class="dc-tree r"></div>' +
        '<div class="dc-grass">' + decoBits(26, 'blade', i => `left:${(i * 4 + +_rnd(0, 3)).toFixed(1)}%;height:${_rnd(12, 26)}px;animation-delay:-${_rnd(0, 4)}s;animation-duration:${_rnd(3.2, 5)}s`) + '</div>' +
        '<div class="dc-linger dc-wildflower"><i class="stem"></i><i class="leaf a"></i><i class="leaf b"></i><i class="bloom"></i></div>',
    dawn: () =>
        '<div class="dc-glow"></div>' +
        decoBits(3, 'dc-cloud', i => `top:${8 + i * 11}%;animation-duration:${90 + i * 40}s;animation-delay:-${i * 31}s;transform:scale(${_rnd(.7, 1.1)})`) +
        '<div class="dc-linger dc-dandelion"><i class="stem"></i><i class="puff"></i><i class="seed s1"></i><i class="seed s2"></i><i class="seed s3"></i></div>',
    ocean: () =>
        '<div class="dc-wave w1"></div><div class="dc-wave w2"></div>' +
        decoBits(8, 'dc-bubble', i => `left:${_rnd(4, 94)}%;width:${_rnd(5, 11)}px;height:${_rnd(5, 11)}px;animation-duration:${_rnd(9, 16)}s;animation-delay:-${_rnd(0, 12)}s`) +
        '<div class="dc-linger dc-starfish"><i class="star"></i><i class="glint"></i></div>',
    ember: () =>
        '<div class="dc-emberglow"></div>' +
        decoBits(9, 'dc-ember', i => `left:${_rnd(4, 94)}%;animation-duration:${_rnd(8, 14)}s;animation-delay:-${_rnd(0, 12)}s`) +
        '<div class="dc-linger dc-candle"><i class="halo"></i><i class="wax"></i><i class="flame"></i></div>',
};

/* 계절 입자(css: sp-spring · sp-summer · sp-autumn · sp-winter): 봄 꽃잎 · 여름 반딧불 · 가을 낙엽 · 겨울 눈 */
function seasonBits(season, n) {
    return decoBits(n, 'sp sp-' + season, i => `left:${_rnd(2, 96)}%;animation-duration:${_rnd(season === 'summer' ? 5 : 11, season === 'summer' ? 9 : 20)}s;animation-delay:-${_rnd(0, 18)}s;--sz:${_rnd(.7, 1.3)};--dx:${_rnd(-40, 40)}px`);
}

/* 테마·계절에 맞는 배경 층을 새로 그린다 (테마나 프리미엄 상태가 바뀔 때마다 호출) */
function applyDeco() {
    const old = document.getElementById('theme-deco');
    if (old) old.remove();
    const theme = currentTheme(), season = currentSeason();
    const rich = theme !== 'night' && !!DECO_THEME[theme];   // 프리미엄 테마일 때만 배경 장식·소품
    document.body.dataset.season = season;
    document.body.classList.toggle('deco-on', rich);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div');
    box.id = 'theme-deco';
    box.setAttribute('aria-hidden', 'true');
    box.className = 'deco-' + theme + ' season-' + season;
    box.innerHTML = (rich ? DECO_THEME[theme]() : '') + '<div class="dc-season">' + seasonBits(season, rich ? 12 : 5) + '</div>';
    const anchor = document.getElementById('sheep');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor); else document.body.appendChild(box);
}
