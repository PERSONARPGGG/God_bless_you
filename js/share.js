/* 밤의 목장 — js/share.js : 말씀 복사 · QR/링크 공유 · 말씀 카드 이미지 · 즐겨찾기(★)
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   말씀 복사
═══════════════════════════════════════ */
function copyVerse() {
    if (!curVerse) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const text = `"${curVerse.v}"\n${curVerse.r}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(()=>toast(L.toast_copied))
            .catch(()=>legacyCopy(text));
    } else {
        legacyCopy(text);
    }
}

/* ═══════════════════════════════════════
   QR 공유
═══════════════════════════════════════ */
function toggleQR() {
    const panel = document.getElementById('qr-panel');
    if (!panel) return;
    const open = panel.style.display !== 'none';
    if (open) { panel.style.display = 'none'; return; }
    const img = document.getElementById('qr-img');
    if (img && !img.dataset.loaded) {
        img.src = qrDataUrl(SHARE_URL, 8);  /* 앱 안에서 생성 — 외부 서버 안 씀 */
        img.dataset.loaded = '1';
    }
    panel.style.display = 'block';
}

/* 앱 주소(SHARE_URL)를 클립보드에 복사 */
function copyShareLink() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(SHARE_URL).then(()=>toast(L.qr_copied)).catch(()=>legacyCopyText(SHARE_URL));
    } else { legacyCopyText(SHARE_URL); }
}

/* 피드백 설문(구글 폼) 열기 */
function openFeedback() {
    window.open('https://forms.gle/3tHkJoimqctvvCt1A', '_blank', 'noopener,noreferrer');
}

/* 클립보드 API가 없는 브라우저용 복사(textarea 방식) */
function legacyCopyText(text) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(L.qr_copied); } catch {}
    document.body.removeChild(ta);
}

/* ═══════════════════════════════════════
   말씀 공유
═══════════════════════════════════════ */
/* ── 말씀 카드 이미지 생성 (밤하늘 감성 캔버스) ── */
function makeVerseCardBlob() {
    return new Promise((resolve, reject) => {
        try {
            const W = 1080, H = 1350;
            const c = document.createElement('canvas');
            c.width = W; c.height = H;
            const x = c.getContext('2d');
            const FAM = "'Apple SD Gothic Neo','Pretendard','Malgun Gothic','맑은 고딕',sans-serif";
            // 배경 그라데이션 (앱 배경과 동일 톤)
            const g = x.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0,'#0e1842'); g.addColorStop(.35,'#132050');
            g.addColorStop(.65,'#0a1030'); g.addColorStop(1,'#050a1e');
            x.fillStyle = g; x.fillRect(0, 0, W, H);
            // 오로라
            const aurora = (cx, cy, r, col) => {
                const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
                rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
                x.fillStyle = rg; x.fillRect(0, 0, W, H);
            };
            aurora(160, 220, 520, 'rgba(40,70,210,.28)');
            aurora(940, 1140, 470, 'rgba(90,20,190,.2)');
            aurora(540, 680, 420, 'rgba(180,140,30,.1)');
            // 별
            for (let i = 0; i < 90; i++) {
                x.globalAlpha = .12 + Math.random() * .55;
                x.fillStyle = '#fff';
                x.beginPath();
                x.arc(Math.random() * W, Math.random() * H, .6 + Math.random() * 2.2, 0, 7);
                x.fill();
            }
            x.globalAlpha = 1;
            x.textAlign = 'center';
            // 달
            x.font = '110px serif';
            x.fillText('✦', W / 2, 250);
            // 말씀 본문 (단어 단위 줄바꿈, 길면 글자 단위)
            const words = ('“' + curVerse.v + '”').split(' ');
            const maxW = 860, lines = [];
            x.font = '500 52px ' + FAM;
            let line = '';
            words.forEach(w => {
                const t = line ? line + ' ' + w : w;
                if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; }
                else line = t;
            });
            if (line) lines.push(line);
            const lh = 92;
            let y = Math.max(430, (H - lines.length * lh) / 2 - 60);
            x.fillStyle = 'rgba(255,252,245,.95)';
            lines.forEach(l => { x.fillText(l, W / 2, y); y += lh; });
            // 출처
            x.fillStyle = '#c8a870';
            x.font = 'italic 40px ' + FAM;
            x.fillText('— ' + curVerse.r, W / 2, y + 30);
            // 푸터
            x.fillStyle = 'rgba(255,255,255,.42)';
            x.font = '30px ' + FAM;
            x.fillText('밤의 목장 · ' + SHARE_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''), W / 2, H - 80);
            c.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
        } catch (e) { reject(e); }
    });
}

/* 말씀 카드 이미지를 만들어 공유 (안 되면 글 복사/이미지 저장으로 대체) */
async function shareVerse() {
    if (!curVerse) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const text = `"${curVerse.v}"\n— ${curVerse.r}\n\n${L.share_app}`;
    // 1순위: 이미지 카드 공유 (Web Share Level 2)
    if (navigator.canShare && location.protocol !== 'file:') {
        try {
            const blob = await makeVerseCardBlob();
            const file = new File([blob], 'verse-card.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: L.share_title, text });
                return;
            }
        } catch (err) {
            if (err && err.name === 'AbortError') return; // 사용자가 공유 취소
        }
    }
    // 2순위: 텍스트 공유
    if (navigator.share && location.protocol !== 'file:') {
        navigator.share({ title: L.share_title, text, url: SHARE_URL })
            .catch(err => { if (err && err.name !== 'AbortError') downloadVerseCard(text); });
    } else {
        downloadVerseCard(text);
    }
}

/* 공유 API 없는 환경(데스크톱 등): 이미지 다운로드 + 텍스트 복사 */
function downloadVerseCard(text) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    makeVerseCardBlob().then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'verse-card.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 3000);
        toast(L.toast_img_saved);
    }).catch(() => fallbackShare(text));
}

/* 공유가 안 될 때 글로 복사 */
function fallbackShare(text) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(()=>toast(L.toast_copied))
            .catch(()=>legacyCopy(text));
    } else {
        legacyCopy(text);
    }
}

/* 구형 브라우저용 복사 + 안내 */
function legacyCopy(text) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    toast(ok ? L.toast_copied : (appLang==='en' ? 'Please select and copy the text manually' : appLang==='ja' ? 'テキストを手動でコピーしてください' : '텍스트를 직접 선택하여 복사해주세요'));
}

/* ═══════════════════════════════════════
   말씀 저장 (♡)
═══════════════════════════════════════ */
function toggleSave() {
    if (!curVerse||verseSaved) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const {emotion,need}=sel;
    // 표시용 글(날짜·감정 이름)은 저장하지 않고 원래 값만 저장 → 보관함이 그때그때 현재 언어로 보여 줌
    const saved = getSaved().filter(x => !(x.ref === curVerse.r && x.verse === curVerse.v));
    saved.unshift({ verse: curVerse.v, ref: curVerse.r, emotion, need, savedAt: new Date().toISOString() });
    lsSet('savedVerses', saved.slice(0, SAVED_MAX));
    lsSet('savedDeleted', lsArr('savedDeleted').filter(k => k !== curVerse.r + '|' + curVerse.v));   // 다시 저장하면 삭제 기록을 지움
    if (sbUser && sb) sb.from('saved_verses').insert({user_id:sbUser.id, verse_text:curVerse.v, verse_ref:curVerse.r, emotion, need})
        .then(r => { if (r && r.error) logErr('saved.insert', r.error); }, e => logErr('saved.insert', e));
    verseSaved=true;
    const btn=document.getElementById('btn-save');
    btn.textContent=L.btn_saved; btn.classList.add('saved');
    toast(L.toast_saved_verse);
}
