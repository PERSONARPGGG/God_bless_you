/* 밤의 목장 — js/flow.js : 이름·글자 크기·스트릭·절기·스텝 전환·결과 생성·복사/공유/저장·감사 일기·말씀 선택·연속 감정 인식
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   이름 설정
═══════════════════════════════════════ */
function checkFirstVisit() {
    if (localStorage.getItem('userName') === null) {
        showOverlay('overlay-name');
        later('startWelcomeParticles', () => startWelcomeParticles(), 600);
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
    later('startWelcomeParticles', () => startWelcomeParticles(), 400);
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
    if (ind) ind.textContent = ['●','●●','●●●'][level] || '●';
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
    let dates = getVisits();
    if (!dates.includes(today)) {
        dates.push(today);
        if (sbUser && sb) sb.from('visit_dates').upsert({user_id:sbUser.id, visit_date:today},{onConflict:'user_id,visit_date'})
            .then(r => { if (r && r.error) logErr('visit.upsert', r.error); }, e => logErr('visit.upsert', e));
    }
    const cutoff = ymd(addDays(new Date(), -LOCAL_KEEP_DAYS));
    dates = dates.filter(d => d >= cutoff).sort();
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

/* 가장 최근 방문일부터 거슬러 올라가며 하루도 빠지지 않은 날 수 */
function calcStreak(dates) {
    const sorted = [...new Set((dates || []).filter(isYmd))].sort().reverse();
    if (!sorted.length) return 0;
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === ymd(addDays(parseYmd(sorted[i-1]), -1))) streak++; else break;
    }
    return streak;
}

/* ═══════════════════════════════════════
   절기 감지
═══════════════════════════════════════ */
function checkSeason() {
    const now=new Date(), m=now.getMonth()+1, d=now.getDate();
    let season=null, icon='';
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
    if (_picking) return;
    if (event && event.currentTarget) safe('addRipple', () => addRipple(event.currentTarget, event));
    if (event) { const pos = { clientX: event.clientX, clientY: event.clientY }; later('spawnEmoEffect', () => spawnEmoEffect(value, pos), 80); }
    pick(type, value);
}

/* 화면이 넘어가는 동안의 두 번째 탭은 무시한다 (빠르게 두 번 누르면 기록이 두 건 생기던 문제) */
let _picking = false;
function pick(type, value) {
    if (_picking) return;
    _picking = true;
    setTimeout(() => { _picking = false; }, 340); // go()가 화면을 바꾸는 시점(320ms) 직후
    sel[type] = value;
    safe('haptic', () => { if (navigator.vibrate) navigator.vibrate(10); });   // 흔들리는 차 안에서 눌렸는지 손끝으로 확인 (Android)
    if (type !== 'need') safe('saveResume', () => saveResume());
    if (type==='emotion') {
        safe('applyEmoTint', () => applyEmoTint(value));
        safe('badge2', () => { document.getElementById('badge2').textContent = eLabel(value); });
        go('step1','step2');
    } else if (type==='topic') {
        safe('badge3', () => { document.getElementById('badge3').textContent = eLabel(sel.emotion)+' · '+tLabel(value); });
        go('step2','step3');
    } else if (type==='need') {
        safe('clearResume', () => clearResume());
        safe('buildResult', buildResult);
        go('step3','step4');
        later('spawnBlessing', () => spawnBlessing(), 400);
    }
}

/* ═══════════════════════════════════════
   이어하기 · 홈 화면 바로가기
   출퇴근길처럼 자주 끊기는 환경: 정류장·알림·통화로 앱이 닫히면 선택이 사라져 처음부터 다시 해야 했다.
   감정·주제를 고를 때마다 적어 두고, 45분 안에 같은 날 다시 열면 "이어서 할까요?"를 묻는다.
═══════════════════════════════════════ */
const RESUME_MAX_AGE = 45 * 60 * 1000;
function saveResume() {
    lsSet('resumeSel', { emotion: sel.emotion, topic: sel.topic || null, date: todayStr(), t: Date.now() });
}
function clearResume() {
    try { localStorage.removeItem('resumeSel'); } catch {}
    const bar = document.getElementById('resume-bar'); if (bar) bar.classList.add('hidden');
}
/* 저장값을 믿지 않는다: 모양·감정·주제·날짜·시간이 모두 맞을 때만 */
function readResume() {
    const r = lsGet('resumeSel');
    if (!r || typeof r !== 'object') return null;
    if (!(r.emotion in _EMO_IDX)) return null;
    if (r.topic != null && !(r.topic in _TOP_IDX)) return null;
    if (r.date !== todayStr() || !(Date.now() - Number(r.t) < RESUME_MAX_AGE)) return null;
    return r;
}
function offerResume() {
    const r = readResume(), bar = document.getElementById('resume-bar');
    if (!bar) return;
    if (!r || sel.emotion || document.getElementById('step1').classList.contains('hidden')) { bar.classList.add('hidden'); return; }
    const L = LANG_DATA[appLang] || LANG_DATA.ko;
    document.getElementById('resume-text').textContent = L.resume_text.replace('{emo}', eLabel(r.emotion));
    bar.classList.remove('hidden');
}
function resumeFlow() {
    const r = readResume();
    clearResume();
    if (!r) return;
    pick('emotion', r.emotion);
    if (r.topic) setTimeout(() => pick('topic', r.topic), 400);   // 첫 화면 전환(0.34초)이 끝난 뒤
}
function dismissResume() { clearResume(); }

/* 홈 화면 아이콘을 길게 눌러 고르는 바로가기 (manifest.json shortcuts, Android). 주소의 ?e=… 로 들어오면 그 감정을 고른 상태로 시작 */
const SHORTCUT_EMO = { worry:'걱정', tired:'지침', hurt:'아픔', pray:'기도', thanks:'감사', peace:'평안' };
function applyShortcut() {
    let e = null;
    try { e = SHORTCUT_EMO[new URLSearchParams(location.search).get('e')] || null; } catch {}
    if (!e) return;
    try { history.replaceState(null, '', location.pathname + location.hash); } catch {}
    // 오프닝·이름 입력이 끝나 첫 화면이 열릴 때까지 기다렸다가 누른 것처럼 진행 (최대 12초)
    let tries = 0;
    const t = setInterval(() => {
        const intro = document.getElementById('night-intro'), nm = document.getElementById('overlay-name');
        const ready = (!intro || intro.classList.contains('gone')) && (!nm || nm.classList.contains('hidden')) && !document.getElementById('step1').classList.contains('hidden');
        if (ready || ++tries > 40) { clearInterval(t); if (ready) pick('emotion', e); }
    }, 300);
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
    safe('nudge.hide', () => dismissNudge());
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
/* 순서: ① 말씀·묵상·응원 글을 먼저 화면에 넣고 ② 기록 저장·연출·타이머는 그 뒤에 각각 따로.
   ②의 어느 하나가 실패해도 사용자는 결과 화면을 본다. */
function buildResult() {
    const {emotion,topic,need}=sel;
    curVerse = getVerseForMood(emotion, need);
    verseSaved = false;
    curMoodRowId = null;

    document.getElementById('r-context').textContent = eLabel(emotion)+' · '+tLabel(topic)+' · '+nLabel(need);
    document.getElementById('r-ref').textContent = '— '+curVerse.r;
    document.getElementById('r-verse').textContent = curVerse.v; // 타이핑 연출이 실패해도 말씀은 보이도록 먼저 넣어 둠
    safe('typewriterVerse', () => typewriterVerse(curVerse.v));
    const isEn = appLang==='en';
    const rKey = emotion+'_'+topic, nKey = emotion+'_'+need;
    const pickPool = (obj, key, trackKey) => {
        const v = obj[key];
        if (!Array.isArray(v) || v.length === 0) return v||'';
        if (!trackKey || v.length <= 2) return rand(v);
        const storageKey = 'shownC_' + trackKey;
        let seen = lsArr(storageKey);
        const unseen = v.map((_,i)=>i).filter(i=>!seen.includes(i));
        const pool = unseen.length > 0 ? unseen : v.map((_,i)=>i);
        const idx = pool[Math.floor(Math.random()*pool.length)];
        seen = [idx, ...seen.filter(i=>i!==idx)].slice(0, Math.max(3, Math.floor(v.length*0.7)));
        lsSet(storageKey, seen);
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

    // 결과 카드 등장은 go()의 cascadeResultCards()가 담당 (이중 애니메이션 방지)
    // 스텝 표시~cascade 시작 사이 깜빡임 방지: 미리 숨김 상태로
    document.querySelectorAll('#step4 .card').forEach(c => { c.classList.add('card-cascade'); c.classList.remove('revealed'); });

    // 마무리(클로징) 상태 초기화
    closingTriggered = false;
    document.body.classList.remove('closing-sky');
    ['btn-vault-closing', 'btn-dashboard'].forEach(id => { const b = document.getElementById(id); if (b) b.classList.add('hidden'); });
    document.getElementById('step4').classList.remove('closing');
    document.querySelectorAll('#step4 .card').forEach(c=>c.classList.remove('closing-collapsed'));
    const br = document.querySelector('.btn-restart');
    if (br) br.textContent = (LANG_DATA[appLang]||LANG_DATA.ko).btn_finish;

    // ② 여기부터는 하나가 실패해도 나머지와 결과 화면에 영향이 없어야 하는 일들
    safe('saveMood', () => saveMood());
    // 연속 감정 인식 라인 (기록 저장 후 계산해야 오늘 포함됨)
    safe('renderEmotionPattern', () => renderEmotionPattern());
    // 무거운 마음이 3일 이상 이어지면 돌봄 안내 카드
    safe('renderCareCard', () => renderCareCard());
    // 5분 타이머 시작
    safe('startClosingTimer', () => startClosingTimer());
}

function saveMood() {
    const {emotion,topic,need}=sel;
    const today = todayStr();
    const hist = getMoods();
    const entry = {date:today, emotion, topic, need, emoji:E_EMOJI[emotion]};
    if (curVerse && curVerse.r) entry.ref = curVerse.r;   // 그날 본 말씀 (달력·PDF 일기장에서 다시 보여 줌)
    hist.unshift(entry);
    lsSet('moodHistory', trimMoods(hist));
    safe('history.cache', () => clearHistoryCache());
    if (sbUser && sb) insertMoodRows([moodToRow(entry, sbUser.id)], true)
        .then(r => { if (r && r.error) logErr('mood.insert', r.error); else curMoodRowId = (r && r.data && r.data.id) || null; },
              e => logErr('mood.insert', e));
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
    const {emotion,need}=sel;
    // 표시용 글(날짜·감정 이름)은 저장하지 않고 원래 값만 저장 → 보관함이 그때그때 현재 언어로 보여 줌
    const saved = getSaved().filter(x => !(x.ref === curVerse.r && x.verse === curVerse.v));
    saved.unshift({ verse: curVerse.v, ref: curVerse.r, emotion, need, savedAt: new Date().toISOString() });
    lsSet('savedVerses', saved.slice(0, SAVED_MAX));
    if (sbUser && sb) sb.from('saved_verses').insert({user_id:sbUser.id, verse_text:curVerse.v, verse_ref:curVerse.r, emotion, need})
        .then(r => { if (r && r.error) logErr('saved.insert', r.error); }, e => logErr('saved.insert', e));
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
    const hist = getMoods();
    if (!hist.length) return; // 붙일 기록이 없으면 "저장됐다"고 말하지 않는다
    hist[0].diary = text;
    lsSet('moodHistory', hist);
    safe('history.cache', () => clearHistoryCache());
    if (sbUser && sb) {
        // 방금 넣은 그 줄에만 일기를 붙인다 (id를 모르면 같은 날·같은 선택의 줄)
        let q = sb.from('mood_history').update({diary_text:text}).eq('user_id',sbUser.id);
        q = curMoodRowId != null ? q.eq('id', curMoodRowId)
            : q.eq('date', hist[0].date).eq('emotion', hist[0].emotion).eq('topic', hist[0].topic).eq('need', hist[0].need);
        q.then(r => { if (r && r.error) logErr('diary.update', r.error); }, e => logErr('diary.update', e));
    }
    document.getElementById('diary-saved-msg').style.display='block';
    toast(L.toast_diary_saved);
}

/* 중복 방지 말씀 선택
   한국어 묶음과 영어 묶음은 구절 수가 서로 다르므로(같은 번호가 같은 구절이 아님)
   먼저 언어에 맞는 묶음을 고르고, "이미 본 구절" 기록도 언어별로 따로 둔다. */
function getVerseForMood(emotion, need) {
    const key = `${emotion}_${need}`;
    const en = appLang === 'en' && Array.isArray(VERSE_POOL_EN[key]) && VERSE_POOL_EN[key].length > 0;
    const pool = en ? VERSE_POOL_EN[key] : (VERSE_POOL[key] || []);
    if (!pool.length) return { v: '', r: '' };
    if (pool.length === 1) return pool[0];

    const storeKey = (en ? 'shownV_en_' : 'shownV_') + key;
    let shown = lsArr(storeKey).filter(i => Number.isInteger(i) && i >= 0 && i < pool.length);

    const allIdx = pool.map((_, i) => i);
    let avail = allIdx.filter(i => !shown.includes(i));

    // 전부 다 봤으면 절반 리셋
    if (!avail.length) {
        shown = shown.slice(-Math.floor(pool.length / 2));
        avail = allIdx.filter(i => !shown.includes(i));
    }

    const picked = avail[Math.floor(Math.random() * avail.length)];
    lsSet(storeKey, [...shown, picked]);
    return pool[picked];
}

/* ── 히어로 묵상 초기화 ── */
const TEASER_POOL = [
    { t:'여호와는 나의 목자시니 내게 부족함이 없으리로다', r:'시편 23:1', te:'The LORD is my shepherd; I shall not want.', re:'Psalm 23:1' },
    { t:'수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라', r:'마태복음 11:28', te:'Come to me, all who labor and are heavy laden, and I will give you rest.', re:'Matthew 11:28' },
    { t:'내가 너희에게 평안을 끼치노니 곧 나의 평안을 너희에게 주노라', r:'요한복음 14:27', te:'Peace I leave with you; my peace I give to you.', re:'John 14:27' },
    { t:'모든 것이 협력하여 선을 이루느니라', r:'로마서 8:28', te:'All things work together for good for those who love God.', re:'Romans 8:28' },
    { t:'하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라', r:'시편 46:1', te:'God is our refuge and strength, a very present help in trouble.', re:'Psalm 46:1' },
    { t:'내가 세상 끝날까지 너희와 항상 함께 있으리라', r:'마태복음 28:20', te:'I am with you always, to the end of the age.', re:'Matthew 28:20' },
    { t:'주님의 인자하심이 영원하시며 그의 진실하심이 대대에 이르리로다', r:'시편 100:5', te:'The LORD is good; his steadfast love endures forever, and his faithfulness to all generations.', re:'Psalm 100:5' },
    { t:'너희는 마음에 근심하지 말라 하나님을 믿으니 또 나를 믿으라', r:'요한복음 14:1', te:'Let not your hearts be troubled. Believe in God; believe also in me.', re:'John 14:1' },
    { t:'여호와를 앙망하는 자는 새 힘을 얻으리니', r:'이사야 40:31', te:'They who wait for the LORD shall renew their strength.', re:'Isaiah 40:31' },
    { t:'주의 말씀은 내 발에 등이요 내 길에 빛이니이다', r:'시편 119:105', te:'Your word is a lamp to my feet and a light to my path.', re:'Psalm 119:105' },
    { t:'사랑은 오래 참고 사랑은 온유하며 시기하지 아니하며', r:'고린도전서 13:4', te:'Love is patient and kind; love does not envy or boast', re:'1 Corinthians 13:4' },
    { t:'항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라', r:'데살로니가전서 5:16-18', te:'Rejoice always, pray without ceasing, give thanks in all circumstances.', re:'1 Thessalonians 5:16-18' },
];

function initHeroTeaser() {
    const storeKey = 'shownTeaser';
    let shown = lsArr(storeKey);
    const allIdx = TEASER_POOL.map((_,i)=>i);
    let avail = allIdx.filter(i=>!shown.includes(i));
    if (!avail.length) { shown=[]; avail=allIdx; lsSet(storeKey,[]); }
    const picked = avail[Math.floor(Math.random()*avail.length)];
    lsSet(storeKey, [...shown, picked]);
    const item = TEASER_POOL[picked];
    const tEl = document.getElementById('ht-text');
    const rEl = document.getElementById('ht-ref');
    const useEn = appLang==='en' && item.te;
    if (tEl) tEl.textContent = `"${useEn ? item.te : item.t}"`;
    if (rEl) rEl.textContent = `— ${useEn ? item.re : item.r}`;
}

/* ═══════════════════════════════════════
   연속 감정 인식 — moodHistory 기반, AI 없이 "나를 아는" 문장
═══════════════════════════════════════ */
const EMO_CATEGORY = { 걱정:'neg', 지침:'neg', 아픔:'neg', 감사:'pos', 평안:'pos', 기도:'pray' };

/* 오늘 감정과 같은 결(카테고리)이 며칠째 이어지는지 (오늘 포함) */
function calcEmotionRun() {
    const hist = getMoods();
    if (!hist.length) return null;
    const today = todayStr();
    if (hist[0].date !== today) return null;
    const cat = EMO_CATEGORY[hist[0].emotion];
    if (!cat) return null;
    // 날짜별 최신 감정 (hist는 최신순)
    const byDay = {};
    hist.forEach(h => { if (!(h.date in byDay)) byDay[h.date] = EMO_CATEGORY[h.emotion]; });
    let n = 0;
    for (let d = new Date(); n <= LOCAL_KEEP_DAYS && byDay[ymd(d)] === cat; d = addDays(d, -1)) n++;
    return { cat, n };
}

function renderEmotionPattern() {
    const el = document.getElementById('r-pattern');
    if (!el) return;
    el.classList.add('hidden');
    const run = calcEmotionRun();
    if (!run || run.n < 2) return;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    let msg = null;
    if (run.cat === 'neg')  msg = run.n === 2 ? L.pat_neg_2 : L.pat_neg_n;
    if (run.cat === 'pos')  msg = L.pat_pos_n;
    if (run.cat === 'pray') msg = L.pat_pray_n;
    if (!msg) return;
    el.textContent = msg.replace('{n}', run.n);
    el.classList.remove('hidden');
}
