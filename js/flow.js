/* 밤의 목장 — js/flow.js : 이름·글자 크기·스트릭·절기·스텝 전환·결과 생성·복사/공유/저장·감사 일기
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   이름 설정
═══════════════════════════════════════ */
function checkFirstVisit() {
    if (localStorage.getItem('userName') === null) {
        showOverlay('overlay-name');
        setTimeout(startWelcomeParticles, 600);
    }
}

function saveName() {
    const val = document.getElementById('name-input').value.trim();
    lsSet('userName', val || '');
    lsSet('appLang', appLang);
    hideOverlay('overlay-name');
    applyLang(appLang);
    setWelcome();
}

function skipName() {
    lsSet('userName', '');
    lsSet('appLang', appLang);
    hideOverlay('overlay-name');
    applyLang(appLang);
}

function changeName() {
    hideOverlay('overlay-settings');
    document.getElementById('name-input').value = lsGet('userName') || '';
    setWelcomeLang(appLang);
    showOverlay('overlay-name');
    setTimeout(startWelcomeParticles, 400);
}

/* ── 환영 문구 ── */
function setWelcome() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const name = lsGet('userName');
    const base = rand(L.welcome_msgs);
    let text;
    if (name) {
        text = appLang==='en' ? `${name}, ${base}` : appLang==='ja' ? `${name}さん、${base}` : `${name}님, ${base}`;
    } else {
        text = base;
    }
    const el = document.getElementById('welcome-text');
    el.textContent = text;
    el.classList.remove('welcome-bloom');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('welcome-bloom');
}

function setDate() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const now = new Date();
    document.getElementById('date-text').textContent =
        now.toLocaleDateString(L.locale||'ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
}

/* ═══════════════════════════════════════
   글자 크기
═══════════════════════════════════════ */
function applyFont(level) {
    document.body.classList.remove('sz-lg','sz-xl');
    if (level===1) document.body.classList.add('sz-lg');
    if (level===2) document.body.classList.add('sz-xl');
    const ind = document.getElementById('fs-indicator');
    if (ind) ind.textContent = ['●','●●','●●●'][level];
    // 설정 버튼 active 상태
    ['fo-sm','fo-md','fo-lg'].forEach((id,i)=>{
        const el=document.getElementById(id);
        if(el) el.classList.toggle('active', i===level);
    });
}

function setFont(level) { fontLevel=level; applyFont(level); lsSet('fontLevel',level); }

function cycleFont(dir) {
    fontLevel = Math.max(0, Math.min(2, fontLevel + dir));
    applyFont(fontLevel); lsSet('fontLevel',fontLevel);
}

/* ═══════════════════════════════════════
   스트릭 (컴팩트 체크인)
═══════════════════════════════════════ */
function updateStreak() {
    const today = todayStr();
    let dates = lsGet('visitDates') || [];
    if (!dates.includes(today)) {
        dates.push(today);
        lsSet('visitDates', dates);
        if (sbUser && sb) sb.from('visit_dates').upsert({user_id:sbUser.id, visit_date:today},{onConflict:'user_id,visit_date'}).then();
    }
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-60);
    dates = dates.filter(d => new Date(d) >= cutoff);
    lsSet('visitDates', dates);

    const streak = calcStreak(dates);
    const pill = document.getElementById('checkin-pill');
    if (!pill) return;

    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const icon = streak >= 7 ? '🔥' : streak >= 3 ? '🌟' : '🌱';
    document.getElementById('cp-icon').textContent   = icon;
    document.getElementById('cp-text').textContent   = L.cp_text;
    document.getElementById('cp-streak').textContent = streak + L.streak_unit;
    pill.classList.remove('hidden');

    checkInstallNudge(streak);
}

function calcStreak(dates) {
    const sorted = [...new Set(dates)].sort().reverse();
    let streak=1, prev=new Date(sorted[0]);
    for (let i=1;i<sorted.length;i++) {
        const cur=new Date(sorted[i]);
        const diff=(prev-cur)/(1000*60*60*24);
        if (Math.round(diff)===1) { streak++; prev=cur; } else break;
    }
    return sorted.length ? streak : 0;
}

/* ═══════════════════════════════════════
   절기 감지
═══════════════════════════════════════ */
function checkSeason() {
    const now=new Date(), m=now.getMonth()+1, d=now.getDate();
    let season=null, icon='🌙';
    if (m===12&&d>=20&&d<=26)              { season='christmas'; icon='⭐'; }
    else if (m===1&&d<=5)                  { season='newyear';   icon='🌟'; }
    else if ((m===3&&d>=28)||(m===4&&d<=10)){ season='easter';   icon='🌸'; }
    else if (m===9&&d>=14&&d<=17)          { season='chuseok';   icon='🌕'; }
    if (season) {
        document.body.classList.add('season-'+season);
        document.getElementById('main-icon').textContent = icon;
        const L = LANG_DATA[appLang]||LANG_DATA.ko;
        const msg = (L.season_msg||LANG_DATA.ko.season_msg)[season]||'';
        const banner = document.getElementById('season-banner');
        banner.innerHTML = msg.replace('\n','<br>');
        banner.classList.add('visible');
    }
}

/* ═══════════════════════════════════════
   스텝 전환
═══════════════════════════════════════ */
/* ── 감정 선택 (리플 + 꽃잎 파티클) ── */
function pickEmo(type, value, event) {
    if (event && event.currentTarget) addRipple(event.currentTarget, event);
    setTimeout(() => { if (event) spawnEmoEffect(value, event); }, 80);
    pick(type, value);
}

/* ── 감정별 이펙트 ── */
function spawnEmoEffect(emotion, event) {
    const cx = event.clientX || window.innerWidth/2;
    const cy = event.clientY || window.innerHeight/2;
    const map = {
        '감사': { icons:['✨','⭐','🌟','💛','☀️','🌸','💫'], size:[18,22] },
        '평안': { icons:['🍃','🌿','💚','🕊️','🌾','🌱','🍀'], size:[16,20] },
        '걱정': { icons:['💙','🌀','💭','🌊','🔷','❄️','✦'],  size:[16,20] },
        '지침': { icons:['💜','🌙','✦','🕯️','🫧','🔮','🌫️'], size:[16,20] },
        '아픔': { icons:['🌷','💗','🌸','🫶','💝','🌹','🥀'], size:[16,20] },
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

/* ── 꽃잎 파티클 ── */
function spawnPetals(event) {
    const pets = ['🌸','🌺','🌷','🌼','🍀','🌹','💐','🌻'];
    const cx = event.clientX || window.innerWidth/2;
    const cy = event.clientY || window.innerHeight/2;
    for (let i=0;i<8;i++) {
        const el = document.createElement('div');
        el.className = 'petal-particle';
        el.textContent = pets[i%pets.length];
        const angle = (i/8)*360 + Math.random()*25;
        const dist  = 50 + Math.random()*50;
        const dx = Math.cos(angle*Math.PI/180)*dist;
        const dy = Math.sin(angle*Math.PI/180)*dist;
        el.style.cssText = `left:${cx}px;top:${cy}px;--dx:${dx}px;--dy:${dy}px;`;
        document.body.appendChild(el);
        setTimeout(()=>el.remove(),950);
    }
}

/* ── 축복 파티클 (step 4 진입) ── */
function spawnBlessing() {
    const syms = ['✨','🌟','💫','⭐','🌸','🌺','💝','🎊','🌼','🌷'];
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
function applyEmoTint(e) {
    const t = EMO_TINT[e];
    if (!t) return;
    document.body.style.setProperty('--emo-glow', t[0]);
    document.body.style.setProperty('--emo-glow-soft', t[1]);
    document.body.classList.add('emo-tinted');
}

function pick(type, value) {
    sel[type] = value;
    if (type==='emotion') { applyEmoTint(value); document.getElementById('badge2').textContent=eLabel(value); go('step1','step2'); }
    else if (type==='topic') { document.getElementById('badge3').textContent=eLabel(sel.emotion)+' · '+tLabel(value); go('step2','step3'); }
    else if (type==='need')  { buildResult(); go('step3','step4'); setTimeout(spawnBlessing,400); }
}

function cascadeResultCards() {
    const cards = document.querySelectorAll('#step4 .card');
    cards.forEach(c => { c.classList.add('card-cascade'); c.classList.remove('revealed'); });
    cards.forEach((c, i) => {
        setTimeout(() => c.classList.add('revealed'), 60 + i * 130);
    });
}

function go(fromId, toId) {
    const from=document.getElementById(fromId), to=document.getElementById(toId);
    // 밤하늘이 함께 흐르는 전환 (밤길 걷는 느낌)
    document.body.classList.remove('sky-shift');
    void document.body.offsetWidth;
    document.body.classList.add('sky-shift');
    setTimeout(()=>document.body.classList.remove('sky-shift'), 1300);
    // 페이지 넘기기 exit 효과
    from.classList.add('step-exiting');
    setTimeout(()=>{
        from.classList.remove('step-exiting');
        from.classList.add('hidden');
        // 다이어리 배경 모드
        if (toId === 'step4') document.body.classList.add('diary-mode');
        else document.body.classList.remove('diary-mode');
        to.classList.remove('hidden'); to.classList.add('entering');
        if (toId === 'step4') setTimeout(cascadeResultCards, 120);
        setTimeout(()=>to.classList.remove('entering'),440);
        // step1에서만 히어로 묵상 카드 표시, 나머지 스텝에서는 숨겨서 화면 공간 확보
        const teaser = document.querySelector('.hero-teaser');
        if (teaser) teaser.classList.toggle('hidden', toId !== 'step1');
        window.scrollTo({top:0,behavior:'smooth'});
    },320);
}

/* ═══════════════════════════════════════
   결과 생성
═══════════════════════════════════════ */
function buildResult() {
    const {emotion,topic,need}=sel;
    curVerse = getVerseForMood(emotion, need);
    verseSaved = false;

    document.getElementById('r-context').textContent = eLabel(emotion)+' · '+tLabel(topic)+' · '+nLabel(need);
    document.getElementById('r-ref').textContent = '— '+curVerse.r;
    typewriterVerse(curVerse.v);
    const isEn = appLang==='en';
    const rKey = emotion+'_'+topic, nKey = emotion+'_'+need;
    const pickPool = (obj, key, trackKey) => {
        const v = obj[key];
        if (!Array.isArray(v) || v.length === 0) return v||'';
        if (!trackKey || v.length <= 2) return rand(v);
        const storageKey = 'shownC_' + trackKey;
        let seen = [];
        try { seen = JSON.parse(localStorage.getItem(storageKey)||'[]'); } catch(e){}
        const unseen = v.map((_,i)=>i).filter(i=>!seen.includes(i));
        const pool = unseen.length > 0 ? unseen : v.map((_,i)=>i);
        const idx = pool[Math.floor(Math.random()*pool.length)];
        seen = [idx, ...seen.filter(i=>i!==idx)].slice(0, Math.max(3, Math.floor(v.length*0.7)));
        try { localStorage.setItem(storageKey, JSON.stringify(seen)); } catch(e){}
        return v[idx];
    };
    document.getElementById('r-reflection').textContent = isEn ? (pickPool(REFLECTIONS_EN,rKey,'ref_'+rKey)||pickPool(REFLECTIONS,rKey,'ref_'+rKey)) : pickPool(REFLECTIONS,rKey,'ref_'+rKey);
    document.getElementById('r-enc').textContent        = isEn ? (pickPool(ENCS_EN,nKey,'enc_'+nKey)||pickPool(ENCS,nKey,'enc_'+nKey)) : pickPool(ENCS,nKey,'enc_'+nKey);

    // 마무리 카드 문구 (감정별, 다국어 — LANG_DATA.closing_msgs)
    const Lb = LANG_DATA[appLang]||LANG_DATA.ko;
    const bsEl = document.getElementById('blessing-sub');
    if (bsEl) bsEl.innerHTML = ((Lb.closing_msgs||{})[emotion]||Lb.closing_default).replace(/\n/g,'<br>');
    const btEl = document.getElementById('blessing-title');
    if (btEl) btEl.textContent = Lb.closing_title;

    // 일기 초기화
    document.getElementById('diary-input').value = '';
    document.getElementById('diary-saved-msg').style.display='none';

    // 저장 버튼 초기화
    const btn=document.getElementById('btn-save');
    btn.textContent=(LANG_DATA[appLang]||LANG_DATA.ko).btn_save; btn.classList.remove('saved');

    // 감정 기록 저장
    saveMood();

    // 연속 감정 인식 라인 (기록 저장 후 계산해야 오늘 포함됨)
    renderEmotionPattern();
    // 무거운 마음이 3일 이상 이어지면 돌봄 안내 카드
    renderCareCard();

    // 결과 카드 등장은 go()의 cascadeResultCards()가 담당 (이중 애니메이션 방지)
    // 스텝 표시~cascade 시작 사이 깜빡임 방지: 미리 숨김 상태로
    document.querySelectorAll('#step4 .card').forEach(c => { c.classList.add('card-cascade'); c.classList.remove('revealed'); });

    // 마무리(클로징) 상태 초기화 + 5분 타이머 시작
    document.body.classList.remove('closing-sky');
    const bvB = document.getElementById('btn-vault-closing');
    if (bvB) bvB.classList.add('hidden');
    document.getElementById('step4').classList.remove('closing');
    document.querySelectorAll('#step4 .card').forEach(c=>c.classList.remove('closing-collapsed'));
    const br = document.querySelector('.btn-restart');
    if (br) br.textContent = (LANG_DATA[appLang]||LANG_DATA.ko).btn_finish;
    startClosingTimer();
}

function saveMood() {
    const {emotion,topic,need}=sel;
    const today = todayStr();
    const hist = lsGet('moodHistory') || [];
    hist.unshift({date:today, emotion, topic, need, emoji:E_EMOJI[emotion]});
    lsSet('moodHistory', hist.slice(0,30));
    if (sbUser && sb) sb.from('mood_history').insert({user_id:sbUser.id, date:today, emotion, topic, need}).then();
}

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
        img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=' + encodeURIComponent(SHARE_URL);
        img.dataset.loaded = '1';
    }
    panel.style.display = 'block';
}

function copyShareLink() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(SHARE_URL).then(()=>toast(L.qr_copied)).catch(()=>legacyCopyText(SHARE_URL));
    } else { legacyCopyText(SHARE_URL); }
}

function openFeedback() {
    window.open('https://forms.gle/3tHkJoimqctvvCt1A', '_blank', 'noopener,noreferrer');
}

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
            x.fillText('🌙', W / 2, 250);
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
            x.fillText('밤의 목장 · god-bless-you.vercel.app', W / 2, H - 80);
            c.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
        } catch (e) { reject(e); }
    });
}

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
    const {emotion,topic,need}=sel;
    const saved = lsGet('savedVerses') || [];
    saved.unshift({
        date: new Date().toLocaleDateString(L.locale||'ko-KR',{month:'long',day:'numeric'}),
        context: eLabel(emotion)+' · '+nLabel(need),
        verse: curVerse.v, ref: curVerse.r
    });
    lsSet('savedVerses', saved.slice(0,50));
    if (sbUser && sb) sb.from('saved_verses').insert({user_id:sbUser.id, verse_text:curVerse.v, verse_ref:curVerse.r, emotion:sel.emotion, need:sel.need}).then();
    verseSaved=true;
    const btn=document.getElementById('btn-save');
    btn.textContent=L.btn_saved; btn.classList.add('saved');
    toast(L.toast_saved_verse);
}

/* ═══════════════════════════════════════
   감사 일기
═══════════════════════════════════════ */
/* 클로징 시점에 일기 내용이 있으면 자동 저장 (저장 버튼 없음) */
function autoSaveDiary() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const text = document.getElementById('diary-input').value.trim();
    if (!text) return;
    const hist = lsGet('moodHistory') || [];
    if (hist.length) {
        hist[0].diary = text;
        lsSet('moodHistory', hist);
        if (sbUser && sb) sb.from('mood_history').update({diary_text:text}).eq('user_id',sbUser.id).eq('date',todayStr()).then();
    }
    document.getElementById('diary-saved-msg').style.display='block';
    toast(L.toast_diary_saved);
}
