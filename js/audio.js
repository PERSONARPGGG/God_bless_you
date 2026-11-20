/* 밤의 목장 — js/audio.js : 효과음 · 배경 찬송가
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   효과음 엔진 — 임시 Web Audio 합성 (추후 실제 음원 파일로 교체 예정)
   ★ 교체 방법: playSfx() 안의 이름별 분기를 new Audio('...').play()로 바꾸면 끝
   종류: drop(일반 버튼) / chime(설정) / finish(묵상 마치기) / write(말씀 필사) / heart(양)
═══════════════════════════════════════ */
let sfxCtx = null;
/* 효과음 재생(name: 효과음 이름). 오디오가 막혀 있어도 조용히 넘어감 */
function playSfx(name) {
    try {
        sfxCtx = sfxCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (sfxCtx.state === 'suspended') sfxCtx.resume();
        const t = sfxCtx.currentTime;
        const tone = (freq, dt, dur, peak, glideTo) => {
            const o = sfxCtx.createOscillator(), g = sfxCtx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, t + dt);
            if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dt + dur * 0.6);
            g.gain.setValueAtTime(0.0001, t + dt);
            g.gain.exponentialRampToValueAtTime(peak, t + dt + 0.018);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dt + dur);
            o.connect(g).connect(sfxCtx.destination);
            o.start(t + dt); o.stop(t + dt + dur + 0.05);
        };
        if (name === 'drop') {
            // 일반 버튼 — 아주 잔잔한 물방울 하나 (낮고 작게)
            tone(300, 0, 0.5, 0.035, 420);
        } else if (name === 'chime') {
            // 설정 — 은은한 풍경 소리
            tone(660, 0, 0.7, 0.022);
            tone(990, 0.06, 0.6, 0.012);
        } else if (name === 'finish') {
            // 오늘 묵상 마치기 — 낮고 따뜻한 세 음 (잠드는 느낌)
            tone(392, 0,    0.8, 0.035);
            tone(494, 0.18, 0.8, 0.03);
            tone(587, 0.36, 1.1, 0.028);
        } else if (name === 'write') {
            // 말씀 필사 — 종이 위 사각이는 소리 (필터 노이즈)
            const dur = 0.045;
            const buf = sfxCtx.createBuffer(1, Math.floor(sfxCtx.sampleRate * dur), sfxCtx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
            const src = sfxCtx.createBufferSource(); src.buffer = buf;
            const f = sfxCtx.createBiquadFilter();
            f.type = 'bandpass'; f.frequency.value = 2600 + Math.random() * 900; f.Q.value = 1.1;
            const g = sfxCtx.createGain(); g.gain.value = 0.018;
            src.connect(f); f.connect(g); g.connect(sfxCtx.destination);
            src.start(t);
        } else if (name === 'heart') {
            // 양 상호작용 — 밝고 짧은 핑
            tone(784, 0, 0.28, 0.04, 1046);
        }
    } catch(e) {}
}
// 버튼 라우팅 — 특별한 버튼은 다른 소리 (캡처 단계라 개별 onclick보다 먼저)
document.addEventListener('pointerdown', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.classList.contains('btn-restart')) playSfx('finish');
    else if (btn.closest('#overlay-settings')) playSfx('chime');
    else playSfx('drop');
}, true);

/* ═══════════════════════════════════════
   배경 음악 — 찬송가 연주 음원
   녹음물: CC0 (archive.org, 원출처 Pixabay 연주곡 시리즈)
   작곡 전부 퍼블릭 도메인: Amazing Grace(1779)·What a Friend(1868)
   ·Holy Holy Holy(1861)·I Need Thee(1872)·In the Garden(작곡가 1946 사망, 보호기간 만료)
═══════════════════════════════════════ */
const HYMN_TRACKS = [
    { file: 'audio/tracks/amazing_grace_2.mp3' },
    { file: 'audio/tracks/what_a_friend.mp3' },
    { file: 'audio/tracks/holy_holy_holy.mp3' },
    { file: 'audio/tracks/i_need_thee.mp3' },
    { file: 'audio/tracks/in_the_garden.mp3' },
    { file: 'audio/tracks/just_as_i_am.mp3' },
    { file: 'audio/tracks/tis_so_sweet.mp3' },
    { file: 'audio/tracks/sweet_by_and_by.mp3' },
    { file: 'audio/tracks/leaning_arms.mp3' },
    { file: 'audio/tracks/nothing_but_blood.mp3' },
];

let trackEl = null, hymnOn = false, hymnPaused = false;
let hymnCurIdx = 0, hymnVol = 60, hymnSong = 'all'; // restoreBgMusic()에서 복원

/* 배경 찬송가용 <audio>를 한 번만 만든다 */
function ensureTrackEl() {
    if (trackEl) return;
    trackEl = new Audio();
    trackEl.preload = 'auto';
    trackEl.onended = () => { if (hymnOn) hymnPlay(hymnCurIdx + 1); };
    trackEl.onerror = () => { if (hymnOn) toast('🎵 음원을 불러오지 못했어요'); };
}

/* idx번째 찬송가를 재생 (단일곡 선택이면 그 곡 반복) */
function hymnPlay(idx) {
    if (!hymnOn) return;
    if (hymnSong !== 'all') idx = +hymnSong; // 단일곡 반복
    hymnCurIdx = idx % HYMN_TRACKS.length;
    updatePlayerUI();
    ensureTrackEl();
    trackEl.src = HYMN_TRACKS[hymnCurIdx].file;
    trackEl.volume = Math.min(hymnVol / 100, 1);
    trackEl.play().catch(() => {
        // 자동 재생 차단 → 첫 터치에서 재개
        document.addEventListener('pointerdown', () => {
            if (hymnOn && trackEl && trackEl.paused) trackEl.play().catch(()=>{});
        }, { once: true });
    });
}

/* 배경 찬송가 재생 시작 */
function startHymns(startIdx) {
    hymnOn = true;
    hymnPlay(startIdx != null ? startIdx
        : hymnSong !== 'all' ? +hymnSong
        : 6); // 전체 반복은 항상 '구주 예수 의지함이'부터
}

/* 배경 찬송가 정지 */
function stopHymns() {
    hymnOn = false;
    if (trackEl) { try { trackEl.pause(); trackEl.currentTime = 0; } catch(e){} }
}

/* 설정의 배경 음악 켜기/끄기 */
function toggleBgMusic(on) {
    const sub = document.getElementById('music-status-sub');
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const cb = document.getElementById('music-toggle-input');
    if (cb) cb.checked = !!on;
    if (on) {
        const resume = hymnPaused;
        hymnPaused = false;
        startHymns(resume ? hymnCurIdx : null);
        lsSet('bgMusic', '1');
        if (sub) sub.textContent = L.music_on;
    } else {
        hymnPaused = false; // 설정에서 끄면 플레이어도 숨김
        stopHymns();
        lsSet('bgMusic', '0');
        if (sub) sub.textContent = L.music_off;
    }
    updatePlayerUI();
}

/* ── 미니 플레이어 ── */
function hymnTitle(idx) {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    return L['song_' + idx] || 'Amazing Grace';
}

/* 미니 플레이어(곡명·재생 상태) 표시 갱신 */
function updatePlayerUI() {
    const p = document.getElementById('hymn-player');
    if (!p) return;
    p.classList.toggle('hidden', !(hymnOn || hymnPaused));
    const ti = document.getElementById('hp-title');
    if (ti) ti.textContent = hymnTitle(hymnCurIdx);
    const tg = document.getElementById('hp-toggle');
    if (tg) tg.textContent = hymnOn ? '⏸' : '▶';
}

/* 미니 플레이어 재생/일시정지 */
function playerToggle() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const sub = document.getElementById('music-status-sub');
    const cb = document.getElementById('music-toggle-input');
    if (hymnOn) {
        // 진짜 일시정지 — 재생 위치 유지, 플레이어는 ▶ 로 남음
        hymnOn = false;
        hymnPaused = true;
        if (trackEl) { try { trackEl.pause(); } catch(e){} }
        lsSet('bgMusic', '0');
        if (cb) cb.checked = false;
        if (sub) sub.textContent = L.music_off;
        updatePlayerUI();
    } else if (hymnPaused && trackEl && trackEl.src) {
        // 멈췄던 위치에서 재개
        hymnOn = true;
        hymnPaused = false;
        trackEl.play().catch(() => {});
        lsSet('bgMusic', '1');
        if (cb) cb.checked = true;
        if (sub) sub.textContent = L.music_on;
        updatePlayerUI();
    } else {
        toggleBgMusic(true);
    }
}

/* 다음 곡 */
function playerNext() {
    const nxt = (hymnCurIdx + 1) % HYMN_TRACKS.length;
    if (hymnSong !== 'all') { hymnSong = String(nxt); lsSet('bgSong', hymnSong); updateMusicSettingsUI(); }
    if (hymnOn) hymnPlay(nxt);
    else { hymnCurIdx = nxt; hymnPaused = false; updatePlayerUI(); }
}

/* ── 설정: 볼륨·곡 ── */
function setHymnVol(v) {
    hymnVol = +v;
    lsSet('bgVol', hymnVol);
    if (trackEl) trackEl.volume = Math.min(hymnVol / 100, 1);
}

/* 곡 선택(전체 반복 또는 한 곡) 저장 */
function setHymnSong(s) {
    hymnSong = s;
    lsSet('bgSong', s);
    updateMusicSettingsUI();
    if (hymnOn) hymnPlay(s === 'all' ? hymnCurIdx : +s);
    else if (s !== 'all') { hymnCurIdx = +s; updatePlayerUI(); }
}

/* 설정 화면의 곡 선택 칩 강조 갱신 */
function updateMusicSettingsUI() {
    ['all','0','1','2','3','4','5','6','7','8','9'].forEach(sn => {
        const c = document.getElementById('chip-song-' + sn);
        if (c) c.classList.toggle('on', hymnSong === sn);
    });
    const vol = document.getElementById('music-vol');
    if (vol) vol.value = hymnVol;
}

// 앱 시작 시 음악 설정 복원 — 기본 켜짐 (끈 적 있으면 꺼진 상태 유지)
// 오디오 자동 재생은 브라우저가 막을 수 있어, 즉시 시도 후 실패하면 첫 터치(인트로 탭 포함)에 시작
function restoreBgMusic() {
    const v = lsGet('bgVol');
    hymnVol = (v == null ? 60 : +v);
    // 저장된 곡 인덱스가 현재 곡 목록 범위 밖이면 전체 반복으로
    let s = lsGet('bgSong') || 'all';
    if (s !== 'all' && !HYMN_TRACKS[+s]) s = 'all';
    hymnSong = s;
    lsSet('bgSong', s);
    hymnCurIdx = hymnSong !== 'all' ? +hymnSong : 6; // 첫 곡: 구주 예수 의지함이
    updateMusicSettingsUI();
    if (String(lsGet('bgMusic')) !== '0') { // lsGet은 JSON.parse — 숫자로 돌아올 수 있어 String 비교
        lsSet('bgMusic', '1');
        const toggle = document.getElementById('music-toggle-input');
        if (toggle) toggle.checked = true;
        const tryStart = () => { if (String(lsGet('bgMusic')) === '1' && !hymnOn) toggleBgMusic(true); };
        tryStart(); // 자동 재생 시도 (허용된 환경이면 바로 들림)
        document.addEventListener('pointerdown', tryStart, { once: true });
    }
}
