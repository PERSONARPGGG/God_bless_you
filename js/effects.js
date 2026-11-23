/* 밤의 목장 — js/effects.js : 화면 연출 (별·별똥별·꽃잎·리플·타이핑·오프닝)
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ── 별 생성 ── */
function generateStars() {
    const frag = document.createDocumentFragment();
    for (let i=0;i<65;i++) {
        const el=document.createElement('div'); el.className='star';
        const big=Math.random()<.12, sz=big?(Math.random()*1.8+2.4):(Math.random()*1.4+0.5);
        el.style.cssText=`left:${(Math.random()*100).toFixed(2)}%;top:${(Math.random()*100).toFixed(2)}%;width:${sz.toFixed(2)}px;height:${sz.toFixed(2)}px;--dur:${(Math.random()*3+2).toFixed(1)}s;--delay:${(Math.random()*5).toFixed(1)}s;--mop:${(Math.random()*.45+.5).toFixed(2)};`;
        frag.appendChild(el);
    }
    document.getElementById('stars').appendChild(frag);
}

/* ── 감정별 이펙트 ── */
function spawnEmoEffect(emotion, event) { // event: 누른 위치 {clientX, clientY}
    const cx = event.clientX || window.innerWidth/2;
    const cy = event.clientY || window.innerHeight/2;
    const map = {
        '감사': { icons:['✨','⭐','🌟','💛','☀️','🌸','💫'], size:[18,22] },
        '평안': { icons:['🍃','🌿','💚','🕊️','🌾','🌱','🍀'], size:[16,20] },
        '걱정': { icons:['💙','🌀','💭','🌊','🔷','❄️','✦'],  size:[16,20] },
        '지침': { icons:['💜','✦','🕯️','🫧','🔮','🌫️'], size:[16,20] },
        '아픔': { icons:['🌷','💗','🌸','🫶','💝','🌹','🕊️'], size:[16,20] },
        '기도': { icons:['🙏','✨','💛','⭐','🌟','🕊️','🌠'], size:[18,22] },
    };
    const e = map[emotion] || map['감사'];
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'petal-particle';
            const angle = (i/10)*360 + Math.random()*30;
            const dist  = 55 + Math.random()*65;
            const dx = Math.cos(angle*Math.PI/180)*dist;
            const dy = Math.sin(angle*Math.PI/180)*dist;
            const fs  = e.size[0] + Math.random()*(e.size[1]-e.size[0]);
            el.textContent = e.icons[i % e.icons.length];
            el.style.cssText = `left:${cx}px;top:${cy}px;--dx:${dx}px;--dy:${dy}px;font-size:${fs}px;`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 950);
        }, i * 22);
    }
}

/* ── 리플 효과 ── */
function addRipple(btn, event) {
    const rect = btn.getBoundingClientRect();
    const x = ((event && event.clientX) ? event.clientX : rect.left + rect.width/2) - rect.left;
    const y = ((event && event.clientY) ? event.clientY : rect.top + rect.height/2) - rect.top;
    const r = document.createElement('div');
    r.className = 'ripple-effect';
    r.style.cssText = `left:${x}px;top:${y}px;`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
}

/* ── 축복 파티클 (step 4 진입) ── */
function spawnBlessing() {
    const syms = ['✨','🌟','💫','⭐','🌸','🌺','💝','🌼','🌷'];
    for (let i=0;i<14;i++) {
        setTimeout(()=>{
            const el = document.createElement('div');
            el.className = 'blessing-particle';
            el.textContent = syms[Math.floor(Math.random()*syms.length)];
            const left = 5 + Math.random()*90;
            const dx   = (Math.random()-.5)*80;
            const dur  = 1.3 + Math.random()*1;
            el.style.cssText = `left:${left}%;top:-30px;--dx:${dx}px;--dy:${70+Math.random()*30}vh;animation-duration:${dur}s;`;
            document.body.appendChild(el);
            setTimeout(()=>el.remove(),(dur*1000)+300);
        }, i*65);
    }
}

/* ── 감정색 물들임 ── */
const EMO_TINT = {
    감사:['rgba(240,192,64,.55)','rgba(240,192,64,.30)'],
    평안:['rgba(125,216,176,.55)','rgba(125,216,176,.30)'],
    걱정:['rgba(160,138,224,.55)','rgba(160,138,224,.30)'],
    지침:['rgba(125,160,232,.55)','rgba(125,160,232,.30)'],
    아픔:['rgba(232,138,176,.55)','rgba(232,138,176,.30)'],
    기도:['rgba(144,216,144,.55)','rgba(144,216,144,.30)'],
};
/* 선택한 감정의 색을 화면 분위기에 입힘 */
function applyEmoTint(e) {
    const t = EMO_TINT[e];
    if (!t) return;
    document.body.style.setProperty('--emo-glow', t[0]);
    document.body.style.setProperty('--emo-glow-soft', t[1]);
    document.body.classList.add('emo-tinted');
}

/* 환영 화면의 떠다니는 꽃잎 연출 시작 */
function startWelcomeParticles() {
    const c=document.getElementById('welcome-particles'); if(!c) return;
    const sym=['🌸','✨','⭐','🌟','💫','🌷','🌺','🍀','🌼','💐'];
    function spawn() {
        if(document.getElementById('overlay-name').classList.contains('hidden')) return;
        const el=document.createElement('div'); el.className='wp';
        const sz=11+Math.random()*15, dur=5+Math.random()*5;
        el.textContent=sym[Math.floor(Math.random()*sym.length)];
        el.style.cssText=`left:${3+Math.random()*94}%;font-size:${sz}px;animation-duration:${dur}s;`;
        c.appendChild(el); setTimeout(()=>el.remove(),(dur+.5)*1000);
        setTimeout(spawn,260+Math.random()*340);
    }
    spawn();
}

/* ── 별똥별 연출 ── */
function spawnShootingStar() {
    const s = document.createElement('div');
    s.className = 'shooting-star';
    s.style.top  = (4 + Math.random()*28) + '%';
    s.style.left = (5 + Math.random()*40) + '%';
    s.style.setProperty('--ang', (18 + Math.random()*16) + 'deg');
    s.style.setProperty('--sdur', (1 + Math.random()*0.8) + 's');
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 2200);
}
/* 배경 앰비언트: 20~50초 간격으로 하나씩 */
(function(){
    const loop = () => setTimeout(() => {
        if (!document.hidden) spawnShootingStar();
        loop();
    }, 20000 + Math.random()*30000);
    loop();
})();

/* ── 만년필 타이핑 효과 ── */
function typewriterVerse(text) {
    const el = document.getElementById('r-verse');
    if (!el) return;
    el.textContent = '';
    el.classList.add('typing');
    const chars = [...text];
    chars.forEach((char, i) => {
        setTimeout(() => {
            el.textContent += char;
            if (char !== ' ' && i % 3 === 0) playSfx('write'); // 글씨 쓰는 사각임
            if (i === chars.length - 1) {
                el.classList.remove('typing');
                const card = el.closest('.card');
                if (card) { card.classList.add('verse-glow'); setTimeout(() => card.classList.remove('verse-glow'), 2300); }
            }
        }, 500 + i * 26);
    });
}

/* ── 밤의 목장 오프닝: 양이 걸어와 달빛 아래 잠들다 (탭하면 스킵) ── */
function playIntro() {
    const intro = document.getElementById('night-intro');
    if (!intro || sessionStorage.getItem('coverShown') ||
        matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (intro) intro.classList.add('gone');
        return;
    }
    sessionStorage.setItem('coverShown', '1');
    const sheep = document.getElementById('intro-sheep');
    const timers = [];
    let ended = false;
    const done = () => {
        if (ended) return; ended = true;
        timers.forEach(clearTimeout);
        intro.classList.add('fading');
        setTimeout(() => intro.classList.add('gone'), 900);
    };
    intro.addEventListener('pointerdown', done);
    sheep.classList.add('walking');
    requestAnimationFrame(() => intro.classList.add('walkin'));   // 걸어 들어옴
    timers.push(setTimeout(() => { sheep.classList.remove('walking'); sheep.classList.add('look'); }, 2150)); // 달빛 아래 멈춰 달을 올려다봄
    timers.push(setTimeout(() => { intro.classList.add('lit'); sheep.classList.add('face-감사'); }, 2250)); // 달빛이 비추면 양이 웃음
    timers.push(setTimeout(() => { sheep.classList.remove('look'); sheep.classList.add('sitting'); intro.classList.add('asleep'); }, 2900)); // 앉아 잠듦
    timers.push(setTimeout(() => intro.classList.add('brand'), 3300));      // 밤의 목장 · 오늘은 어땠나요?
    timers.push(setTimeout(done, 5100));
}
