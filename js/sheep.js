/* 밤의 목장 — js/sheep.js : 양 떼 배회 (주인공 양 + 새끼 양들), 쓰다듬기, 감정 표정
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다)
   주인공 양(#sheep)은 index.html에 있고, 나머지 양은 이 파일이 복제해서 만든다. 밤이니 느긋하게: 걷기·멈춤·풀 뜯기·앉아 졸기를 돌아가며 한다 */

/* 양의 표정을 고른 감정에 맞춤 (빈 값이면 기본 표정). 주인공 양(#sheep)에만 적용 */
function sheepFace(emotion) {
    const sh = document.getElementById('sheep');
    if (!sh) return;
    ['감사', '평안', '걱정', '지침', '아픔', '기도'].forEach(e => sh.classList.remove('face-' + e));
    if (emotion && _EMO_IDX[emotion] != null) sh.classList.add('face-' + emotion);
}

(function(){
    const main = document.getElementById('sheep');
    if (!main || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* 새끼 양 설정: 크기·털 색(파스텔)·바닥에서의 높이(작을수록 멀리 있는 듯)·걷는 속도 */
    const EXTRAS = [
        { cls: 'sz-m',  wool: '#f6e6ec', bottom: 12, speed: 0.013 },
        { cls: 'sz-s',  wool: '#efe4d2', bottom: 20, speed: 0.010 },
    ];
    const flock = [];

    /* 양 한 마리를 움직임 상태와 함께 등록 */
    function register(el, o) {
        const s = { el, flip: el.querySelector('.sh-flip'), x: 20 + Math.random() * 200, dir: Math.random() < .5 ? 1 : -1,
                    mode: 'walk', modeT: 0, modeDur: 3000 + Math.random() * 3000, speed: o.speed, scale: o.scale || 1, reacting: false };
        el.classList.add('walking');
        flock.push(s);
        el.addEventListener('pointerdown', e => { e.stopPropagation(); pet(s); });
        return s;
    }
    register(main, { speed: 0.018 });
    EXTRAS.forEach((o, i) => {
        const c = main.cloneNode(true);
        c.removeAttribute('id');
        c.className = 'sheep-el sheep-extra ' + o.cls;
        c.style.setProperty('--wool', o.wool);
        c.style.bottom = o.bottom + 'px';
        main.parentNode.insertBefore(c, main);
        register(c, { speed: o.speed, scale: i === 0 ? .82 : .66 });
    });

    const maxX = s => Math.max(innerWidth - 62 * s.scale, 40);
    /* 모드 바꾸기 (walk · idle · sit · graze) */
    function setMode(s, m, dur) {
        s.mode = m; s.modeT = 0; s.modeDur = dur;
        s.el.classList.toggle('walking', m === 'walk');
        s.el.classList.toggle('sitting', m === 'sit');
        s.el.classList.toggle('grazing', m === 'graze');
    }
    /* 다음에 할 일을 느긋하게 고름 */
    function pickNext(s) {
        const r = Math.random();
        if (s.mode !== 'sit' && r < .22) setMode(s, 'sit', 4000 + Math.random() * 5000);
        else if (s.mode !== 'graze' && r < .48) setMode(s, 'graze', 2800 + Math.random() * 3500);
        else if (r < .66) setMode(s, 'idle', 1400 + Math.random() * 2200);
        else { if (Math.random() < .4) s.dir *= -1; setMode(s, 'walk', 2800 + Math.random() * 4500); }
    }
    let last = performance.now();
    (function tick(now){
        const dt = Math.min(now - last, 100); last = now;
        flock.forEach(s => {
            s.modeT += dt;
            if (s.mode === 'walk') {
                s.x += s.dir * s.speed * dt;
                if (s.x < 4)         { s.x = 4; s.dir = 1; }
                if (s.x > maxX(s))   { s.x = maxX(s); s.dir = -1; }
            }
            s.el.style.left = s.x + 'px';
            s.flip.style.transform = 'scaleX(' + s.dir + ')';
            if (s.modeT > s.modeDur) pickNext(s);
        });
        requestAnimationFrame(tick);
    })(last);

    /* ── 양 쓰다듬기: 탭하면 재롱 (하트/폴짝/살랑/빙글/말풍선) ── */
    function spawnFloat(s, ch, delay, color) {
        setTimeout(() => {
            const r = s.el.getBoundingClientRect();
            const el = document.createElement('div');
            el.className = 'sheep-float';
            el.textContent = ch; el.style.color = color || '#f0b6c4';
            el.style.left = (r.left + r.width/2 - 8 + (Math.random()*26 - 13)) + 'px';
            el.style.top  = (r.top - 8) + 'px';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1500);
        }, delay);
    }
    function spawnBubble(s, text) {
        const r = s.el.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'sheep-bubble';
        el.textContent = text;
        document.body.appendChild(el);
        const w = el.offsetWidth;
        el.style.left = Math.max(6, Math.min(innerWidth - w - 6, r.left + r.width/2 - w/2)) + 'px';
        el.style.top  = (r.top - 34) + 'px';
        setTimeout(() => el.remove(), 1900);
    }
    /* 양을 눌렀을 때의 재롱 */
    function pet(s) {
        if (s.reacting) return;
        s.reacting = true;
        const sh = s.el;
        // 자거나 풀 뜯던 중이면 깨어남
        if (s.mode === 'sit' || s.mode === 'graze') setMode(s, 'idle', 1500 + Math.random()*1500);
        const acts = ['heart','hop','wiggle','spin','bubble','heart'];
        const act = acts[Math.floor(Math.random()*acts.length)];
        if (act === 'heart') {
            playSfx('heart');
            [['♥','#f0a0b8'],['♥','#f6d58a'],['♥','#f0b6c4']].forEach(([h, c], i) => spawnFloat(s, h, i*170, c));
        } else if (act === 'hop') {
            playSfx('heart');
            sh.classList.add('hop');
            setTimeout(() => sh.classList.remove('hop'), 600);
            spawnFloat(s, '✦', 60, '#f6e7c1');
        } else if (act === 'wiggle') {
            sh.classList.add('wiggle');
            setTimeout(() => sh.classList.remove('wiggle'), 1000);
            spawnFloat(s, '♪', 80, '#cdbdf2');
        } else if (act === 'spin') {
            playSfx('heart');
            sh.classList.add('spin');
            setTimeout(() => sh.classList.remove('spin'), 700);
        } else {
            spawnBubble(s, ['메에~','오늘도 평안하세요','함께 있어요','메에에!'][Math.floor(Math.random()*4)]);
        }
        setTimeout(() => { s.reacting = false; }, 800);
    }
})();
