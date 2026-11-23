/* 밤의 목장 — js/qr.js : QR 코드 생성기 (외부 서버 없이 앱 안에서 만듦). 바이트 모드·오류정정 M·버전 1~10(약 150자까지)
   쓰는 곳: share.js의 toggleQR → qrDataUrl(text). 화면(DOM)은 건드리지 않고 이미지 주소만 돌려줌 */

/* 오류정정 M 단계: 버전별 블록당 정정 코드워드 수 · 블록 수 (인덱스 = 버전) */
const QR_ECC_LEN = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const QR_BLOCKS  = [0,  1,  1,  1,  2,  2,  4,  4,  4,  5,  5];

/* 갈루아 체(GF 256)에서 곱하기 */
function qrMul(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z;
}

/* 리드-솔로몬 정정 코드워드 계산 */
function qrReedSolomon(data, degree) {
    const div = new Array(degree).fill(0); div[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
        for (let j = 0; j < degree; j++) { div[j] = qrMul(div[j], root); if (j + 1 < degree) div[j] ^= div[j + 1]; }
        root = qrMul(root, 2);
    }
    const res = new Array(degree).fill(0);
    for (const b of data) {
        const f = b ^ res.shift(); res.push(0);
        for (let i = 0; i < degree; i++) res[i] ^= qrMul(div[i], f);
    }
    return res;
}

/* 버전별 데이터 모듈 수(기능 패턴 제외) */
function qrRawModules(ver) {
    let r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) { const n = Math.floor(ver / 7) + 2; r -= (25 * n - 10) * n - 55; if (ver >= 7) r -= 36; }
    return r;
}

/* 글자를 QR 격자(true/false 2차원 배열)로 만든다. 너무 길면 null */
function qrMatrix(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let ver = 0, dataCap = 0;
    for (let v = 1; v <= 10; v++) {
        dataCap = Math.floor(qrRawModules(v) / 8) - QR_ECC_LEN[v] * QR_BLOCKS[v];
        if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= dataCap * 8) { ver = v; break; }
    }
    if (!ver) return null;
    /* 비트열 → 데이터 코드워드 */
    const bits = [];
    const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
    put(0, Math.min(4, dataCap * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
    for (let p = 0xEC; data.length < dataCap; p ^= 0xEC ^ 0x11) data.push(p);
    /* 블록으로 나눠 정정 코드 붙이고 섞기 */
    const nb = QR_BLOCKS[ver], el = QR_ECC_LEN[ver], raw = Math.floor(qrRawModules(ver) / 8);
    const shortN = nb - raw % nb, shortLen = Math.floor(raw / nb), blocks = [];
    for (let i = 0, k = 0; i < nb; i++) {
        const dat = data.slice(k, k + shortLen - el + (i < shortN ? 0 : 1)); k += dat.length;
        const ecc = qrReedSolomon(dat, el);
        if (i < shortN) dat.push(0);
        blocks.push(dat.concat(ecc));
    }
    const all = [];
    for (let i = 0; i < blocks[0].length; i++)
        blocks.forEach((b, j) => { if (i !== shortLen - el || j >= shortN) all.push(b[i]); });
    /* 격자 그리기 */
    const size = ver * 4 + 17;
    const mod = Array.from({ length: size }, () => new Array(size).fill(false));
    const fn  = Array.from({ length: size }, () => new Array(size).fill(false));
    const setF = (x, y, v) => { mod[y][x] = v; fn[y][x] = true; };
    for (let i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    const finder = (cx, cy) => {
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
            const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy;
            if (x >= 0 && x < size && y >= 0 && y < size) setF(x, y, d !== 2 && d !== 4);
        }
    };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    if (ver > 1) {
        const n = Math.floor(ver / 7) + 2, step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2, pos = [6];
        for (let p = size - 7; pos.length < n; p -= step) pos.splice(1, 0, p);
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
            if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
                setF(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
    }
    /* 형식 정보 자리(그리는 건 마스크 정한 뒤) 미리 예약 */
    const format = mask => {
        let rem = mask;
        for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
        const f = ((mask << 10) | rem) ^ 0x5412, bit = i => ((f >>> i) & 1) !== 0;
        for (let i = 0; i <= 5; i++) setF(8, i, bit(i));
        setF(8, 7, bit(6)); setF(8, 8, bit(7)); setF(7, 8, bit(8));
        for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(i));
        for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(i));
        for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(i));
        setF(8, size - 8, true);
    };
    format(0);
    if (ver >= 7) {
        let rem = ver;
        for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
        const v = (ver << 12) | rem;
        for (let i = 0; i < 18; i++) { const c = ((v >>> i) & 1) !== 0, a = size - 11 + i % 3, b = Math.floor(i / 3); setF(a, b, c); setF(b, a, c); }
    }
    /* 데이터 비트를 지그재그로 채움 */
    let k = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
            const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
            if (!fn[y][x] && k < all.length * 8) { mod[y][x] = ((all[k >>> 3] >>> (7 - (k & 7))) & 1) !== 0; k++; }
        }
    }
    /* 마스크 8종 중 감점이 가장 적은 것 고르기 */
    const inv = [
        (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
        (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
        (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0
    ];
    const apply = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && inv[m](x, y)) mod[y][x] = !mod[y][x]; };
    const penalty = () => {
        let p = 0;
        for (let a = 0; a < size; a++) for (const row of [true, false]) {
            let run = 1;
            for (let b = 1; b < size; b++) {
                const cur = row ? mod[a][b] : mod[b][a], prev = row ? mod[a][b - 1] : mod[b - 1][a];
                if (cur === prev) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
            }
        }
        for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++)
            if (mod[y][x] === mod[y][x + 1] && mod[y][x] === mod[y + 1][x] && mod[y][x] === mod[y + 1][x + 1]) p += 3;
        return p;
    };
    let best = 0, bestP = Infinity;
    for (let m = 0; m < 8; m++) { apply(m); format(m); const p = penalty(); if (p < bestP) { best = m; bestP = p; } apply(m); }
    apply(best); format(best);
    return mod;
}

/* 글자 → QR 이미지 주소(data URL, PNG). 너무 길면 '' */
function qrDataUrl(text, scale) {
    const m = qrMatrix(text);
    if (!m) return '';
    const s = scale || 6, q = 4, n = m.length + q * 2;
    const c = document.createElement('canvas'); c.width = c.height = n * s;
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#000';
    m.forEach((row, y) => row.forEach((on, x) => { if (on) g.fillRect((x + q) * s, (y + q) * s, s, s); }));
    return c.toDataURL('image/png');
}
