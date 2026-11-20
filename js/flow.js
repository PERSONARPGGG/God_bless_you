/* 밤의 목장 — js/flow.js : 묵상 흐름 · 감정→주제→필요 단계 전환 · 이어하기 · 결과 화면 만들기 · 말씀 고르기(getVerseForMood) · 기록 저장
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

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
/* 주제/필요 버튼 선택 → 다음 단계로 (연타 방지) */
function pick(type, value) {
    if (_picking) return;
    _picking = true;
    setTimeout(() => { _picking = false; }, 340); // go()가 화면을 바꾸는 시점(320ms) 직후
    sel[type] = value;
    // 흔들리는 차 안에서 눌렸는지 손끝으로 확인 (Android). 직접 누른 경우에만 — 바로가기·이어하기로 자동 선택될 땐 브라우저가 막고 오류를 남김
    safe('haptic', () => { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.isActive) navigator.vibrate(10); });
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
        const from = visibleQStep();   // 질문을 건너뛰었다면 지금 보이는 화면은 2단계일 수 있음
        safe('buildResult', buildResult);
        go(from,'step4');
        if (!HEAVY_EMOS.includes(sel.emotion)) later('spawnBlessing', () => spawnBlessing(), 400);   // 마음이 무거운 날에는 축하 연출을 하지 않는다
    }
}

/* ═══════════════════════════════════════
   질문 단계: 뒤로 가기 · 건너뛰고 말씀 보기
   감정 → 주제 → 필요 → 말씀, 세 번 묻는 것이 지친 사람에게 부담이라 "건너뛰기"를 둔다 (감정만 눌러도 2번 만에 말씀).
   건너뛰면 주제는 '모름', 필요는 감정별 기본값 (목사님 검토 필요 — 3단계에서 구절과 함께 다시 봄)
═══════════════════════════════════════ */
const DEFAULT_NEED = { 감사:'쉼', 평안:'쉼', 걱정:'위로', 지침:'쉼', 아픔:'위로', 기도:'위로' };
/* 지금 보이는 질문 단계(주제 또는 필요) */
function visibleQStep() { return ['step3', 'step2'].find(id => !document.getElementById(id).classList.contains('hidden')) || 'step3'; }
/* 질문을 건너뛰고 기본값으로 결과 화면 보기 */
function skipToResult() {
    if (_picking || !sel.emotion) return;
    if (!sel.topic) sel.topic = '모름';
    sel.skipped = true;   // 필요는 직접 고른 게 아니라 기본값 → 통계(자주 필요했던 것)에서 뺀다
    pick('need', DEFAULT_NEED[sel.emotion] || '위로');
}
/* 질문 단계에서 이전 단계로 */
function goBack(from) {
    if (_picking) return;
    _picking = true; setTimeout(() => { _picking = false; }, 340);
    safe('haptic', () => { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.isActive) navigator.vibrate(10); });
    if (from === 'step2') {
        sel.emotion = null; sel.topic = null;
        safe('clearResume', () => clearResume());
        document.body.classList.remove('emo-tinted');
        go('step2', 'step1');
    } else {
        sel.topic = null;
        safe('saveResume', () => saveResume());
        go('step3', 'step2');
    }
}

/* ═══════════════════════════════════════
   이어하기 · 홈 화면 바로가기
   출퇴근길처럼 자주 끊기는 환경: 정류장·알림·통화로 앱이 닫히면 선택이 사라져 처음부터 다시 해야 했다.
   감정·주제를 고를 때마다 적어 두고, 45분 안에 같은 날 다시 열면 "이어서 할까요?"를 묻는다.
═══════════════════════════════════════ */
const RESUME_MAX_AGE = 45 * 60 * 1000;
/* 고른 감정을 45분간 기억 (끊겼다 돌아오면 이어하기) */
function saveResume() {
    lsSet('resumeSel', { emotion: sel.emotion, topic: sel.topic || null, date: todayStr(), t: Date.now() });
}
/* 이어하기 정보 지움 */
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
/* 이어하기 바 보여주기 (45분·같은 날 안에서만) */
function offerResume() {
    const r = readResume(), bar = document.getElementById('resume-bar');
    if (!bar) return;
    if (!r || sel.emotion || document.getElementById('step1').classList.contains('hidden')) { bar.classList.add('hidden'); return; }
    const L = LANG_DATA[appLang] || LANG_DATA.ko;
    // 감정 이름을 문장에 끼우면 조사가 어색해져서(걱정이 있었어요에서…) 그림만 앞에 붙인다
    document.getElementById('resume-text').textContent = (E_EMOJI[r.emotion] || '') + ' ' + L.resume_text;
    bar.classList.remove('hidden');
}
/* 이어하기 눌렀을 때 그 감정에서 다시 시작 */
function resumeFlow() {
    const r = readResume();
    clearResume();
    if (!r) return;
    pick('emotion', r.emotion);
    if (r.topic) setTimeout(() => pick('topic', r.topic), 400);   // 첫 화면 전환(0.34초)이 끝난 뒤
}
/* 이어하기 안내 닫기 */
function dismissResume() { clearResume(); }

/* 홈 화면 아이콘을 길게 눌러 고르는 바로가기 (manifest.json shortcuts, Android). 주소의 ?e=… 로 들어오면 그 감정을 고른 상태로 시작 */
const SHORTCUT_EMO = { worry:'걱정', tired:'지침', hurt:'아픔', pray:'기도', thanks:'감사', peace:'평안' };
/* ?e=감정 주소(홈 화면 바로가기)로 열렸으면 그 감정을 고른 상태로 시작 */
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

/* 결과 카드들을 차례로 나타나게 하는 연출 */
function cascadeResultCards() {
    const cards = document.querySelectorAll('#step4 .card');
    cards.forEach(c => { c.classList.add('card-cascade'); c.classList.remove('revealed'); });
    cards.forEach((c, i) => {
        setTimeout(() => c.classList.add('revealed'), 60 + i * 130);
    });
}

/* 화면 단계 전환(fromId → toId). 전환 연출과 상태 정리를 함께 한다 */
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
    _diaryEmptied = false;
    document.getElementById('diary-saved-msg').style.display='none';
    const dlEl = document.getElementById('diary-label');
    if (dlEl) dlEl.textContent = ((Lb.diary_label_emo||{})[emotion]) || Lb.diary_label;

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
    safe('welcome', () => setWelcome(emotion));
    safe('saveMood', () => saveMood());
    // 연속 감정 인식 라인 (기록 저장 후 계산해야 오늘 포함됨)
    safe('renderEmotionPattern', () => renderEmotionPattern());
    // 무거운 마음이 3일 이상 이어지면 돌봄 안내 카드
    safe('renderCareCard', () => renderCareCard());
    // 5분 타이머 시작
    safe('startClosingTimer', () => startClosingTimer());
}

/* "다른 말씀": 같은 마음(감정·필요)의 다른 구절로 바꾼다. 기록의 말씀 표시도 함께 바꾼다 */
function nextVerse() {
    if (!sel.emotion || !sel.need || !curVerse) return;
    let v = getVerseForMood(sel.emotion, sel.need);
    for (let k = 0; k < 4 && v.r === curVerse.r && v.v === curVerse.v; k++) v = getVerseForMood(sel.emotion, sel.need);
    if (!v.v || (v.r === curVerse.r && v.v === curVerse.v)) return;
    curVerse = v; verseSaved = false;
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    document.getElementById('r-ref').textContent = '— ' + v.r;
    document.getElementById('r-verse').textContent = v.v;
    safe('typewriterVerse', () => typewriterVerse(v.v));
    const btn = document.getElementById('btn-save'); btn.textContent = L.btn_save; btn.classList.remove('saved');
    safe('nextVerse.record', () => {
        const hist = getMoods(), today = todayStr();
        const h = hist.find(x => x.date === today && x.emotion === sel.emotion && x.topic === sel.topic && x.need === sel.need);
        if (h) { h.ref = v.r; lsSet('moodHistory', hist); clearHistoryCache(); }
        if (sbUser && sb && curMoodRowId != null) sb.from('mood_history').update({verse_ref: v.r}).eq('user_id', sbUser.id).eq('id', curMoodRowId)
            .then(r => { if (r && r.error) logErr('verse.update', r.error); }, e => logErr('verse.update', e));
    });
}

/* 오늘의 감정 기록을 기기에 저장하고 로그인했으면 클라우드에도 올림 */
function saveMood() {
    const {emotion,topic,need}=sel;
    const today = todayStr();
    const hist = getMoods();
    const entry = {date:today, emotion, topic, need, emoji:E_EMOJI[emotion]};
    if (sel.skipped) entry.skip = 1;
    if (curVerse && curVerse.r) entry.ref = curVerse.r;   // 그날 본 말씀 (달력·PDF 일기장에서 다시 보여 줌)
    hist.unshift(entry);
    if (!lsSet('moodHistory', trimMoods(hist))) toast((LANG_DATA[appLang]||LANG_DATA.ko).toast_store_fail);
    safe('history.cache', () => clearHistoryCache());
    if (sbUser && sb) insertMoodRows([moodToRow(entry, sbUser.id)], true)
        .then(r => { if (r && r.error) logErr('mood.insert', r.error); else curMoodRowId = (r && r.data && r.data.id) || null; },
              e => logErr('mood.insert', e));
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

