/* 밤의 목장 — js/sheep.js : 양 한 마리 배회
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   밤의 목장 — 양 한 마리 배회 (걷기 → 멈춤 → 앉기)
═══════════════════════════════════════ */
/* 양의 표정을 고른 감정에 맞춤 (빈 값이면 기본 표정). 걸어다니는 양(#sheep)에만 적용 */
function sheepFace(emotion) {
    const sh = document.getElementById('sheep');
    if (!sh) return;
    ['감사', '평안', '걱정', '지침', '아픔', '기도'].forEach(e => sh.classList.remove('face-' + e));
    if (emotion && _EMO_IDX[emotion] != null) sh.classList.add('face-' + emotion);
}

(function(){
    const sh = document.getElementById('sheep');
    if (!sh || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const flip = sh.querySelector('.sh-flip');
    let x = 20 + Math.random()*120, dir = 1, mode = 'walk', modeT = 0, modeDur = 4000;
    const maxX = () => Math.max(innerWidth - 62, 40);
    sh.classList.add('walking');
    function setMode(m, dur) {
        mode = m; modeT = 0; modeDur = dur;
        sh.classList.toggle('walking', m === 'walk');
        sh.classList.toggle('sitting', m === 'sit');
    }
    function pickNext() {
        const r = Math.random();
        if (mode !== 'sit' && r < .35) setMode('sit', 3500 + Math.random()*5000);
        else if (r < .55) setMode('idle', 1200 + Math.random()*2000);
        else { if (Math.random() < .4) dir *= -1; setMode('walk', 2500 + Math.random()*4500); }
    }
    let last = performance.now();
    (function tick(now){
        const dt = Math.min(now - last, 100); last = now;
        modeT += dt;
        if (mode === 'walk') {
            x += dir * 0.022 * dt;
            if (x < 4)      { x = 4; dir = 1; }
            if (x > maxX()) { x = maxX(); dir = -1; }
        }
        sh.style.left = x + 'px';
        flip.style.transform = 'scaleX(' + dir + ')';
        if (modeT > modeDur) pickNext();
        requestAnimationFrame(tick);
    })(last);

    /* ── 양 쓰다듬기: 탭하면 재롱 (하트/폴짝/살랑/빙글/말풍선) ── */
    let reacting = false;
    function spawnFloat(ch, delay, color) {
        setTimeout(() => {
            const r = sh.getBoundingClientRect();
            const el = document.createElement('div');
            el.className = 'sheep-float';
            el.textContent = ch; el.style.color = color || '#f0b6c4';
            el.style.left = (r.left + r.width/2 - 8 + (Math.random()*26 - 13)) + 'px';
            el.style.top  = (r.top - 8) + 'px';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1500);
        }, delay);
    }
    function spawnBubble(text) {
        const r = sh.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'sheep-bubble';
        el.textContent = text;
        document.body.appendChild(el);
        const w = el.offsetWidth;
        el.style.left = Math.max(6, Math.min(innerWidth - w - 6, r.left + r.width/2 - w/2)) + 'px';
        el.style.top  = (r.top - 34) + 'px';
        setTimeout(() => el.remove(), 1900);
    }
    sh.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (reacting) return;
        reacting = true;
        // 자고 있으면 깨어남
        if (sh.classList.contains('sitting')) setMode('idle', 1500 + Math.random()*1500);
        const acts = ['heart','hop','wiggle','spin','bubble','heart'];
        const act = acts[Math.floor(Math.random()*acts.length)];
        if (act === 'heart') {
            playSfx('heart');
            [['♥','#f0a0b8'],['♥','#f6d58a'],['♥','#f0b6c4']].forEach(([h, c], i) => spawnFloat(h, i*170, c));
        } else if (act === 'hop') {
            playSfx('heart');
            sh.classList.add('hop');
            setTimeout(() => sh.classList.remove('hop'), 600);
            spawnFloat('✦', 60, '#f6e7c1');
        } else if (act === 'wiggle') {
            sh.classList.add('wiggle');
            setTimeout(() => sh.classList.remove('wiggle'), 1000);
            spawnFloat('♪', 80, '#cdbdf2');
        } else if (act === 'spin') {
            playSfx('heart');
            sh.classList.add('spin');
            setTimeout(() => sh.classList.remove('spin'), 700);
        } else {
            spawnBubble(['메에~','오늘도 평안하세요','함께 있어요','메에에!'][Math.floor(Math.random()*4)]);
        }
        setTimeout(() => { reacting = false; }, 800);
    });
})();
