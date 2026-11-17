/* 밤의 목장 — js/auth.js : Supabase 로그인 · 기기↔클라우드 기록 맞추기
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   Supabase 인증
═══════════════════════════════════════ */
function initSupabase() {
    if (sb || location.protocol === 'file:' || typeof supabase === 'undefined') return;
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const onSession = session => {
        sbUser = (session && session.user) || null;
        safe('updateAuthUI', updateAuthUI);
        if (sbUser) syncWithServer();
    };
    // 이 콜백 안에서 곧바로 Supabase를 다시 부르면 내부 잠금에 걸릴 수 있어 한 박자 늦춘다
    sb.auth.onAuthStateChange((event, session) => { setTimeout(() => onSession(session), 0); });
    sb.auth.getSession().then(({ data }) => onSession(data && data.session)).catch(e => logErr('getSession', e));
}

/* 로그인 = 기록이 서버로 올라가는 시점 → 처음 한 번은 동의(처리방침·민감정보·만 14세 이상)를 먼저 받는다 */
async function loginWithGoogle() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!sb) { toast(L.login_unavailable); return; }
    if (!hasConsent()) { openConsent(); return; }
    try {
        const { error } = await sb.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: location.origin + location.pathname }
        });
        if (error) throw error;
    } catch (e) { logErr('login', e); toast(L.login_unavailable); }
}

async function sbLogout() {
    if (!sb) return;
    try { await sb.auth.signOut(); } catch (e) { logErr('logout', e); }
    sbUser = null;
    _syncedUser = null;
    updateAuthUI();
    toast((LANG_DATA[appLang]||LANG_DATA.ko).logout_done);
}

function updateAuthUI() {
    const rowLogin  = document.getElementById('row-login');
    const rowLogout = document.getElementById('row-logout');
    const rowDelete = document.getElementById('row-delete');
    const emailEl   = document.getElementById('auth-email');
    const privEl    = document.getElementById('privacy-text');
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    if (!rowLogin) return;
    if (sbUser) {
        rowLogin.style.display  = 'none';
        rowLogout.style.display = 'flex';
        if (rowDelete) rowDelete.style.display = 'flex';
        if (emailEl) emailEl.textContent = sbUser.email;
        if (privEl) privEl.innerHTML = L.privacy_cloud;
    } else {
        rowLogin.style.display  = 'flex';
        rowLogout.style.display = 'none';
        if (rowDelete) rowDelete.style.display = 'none';
        if (privEl) privEl.innerHTML = L.privacy;
    }
    // 로그인 상태가 바뀌면 프리미엄 자격과 회고 카드를 다시 확인
    refreshEntitlement();
}

/* ═══════════════════════════════════════
   기기 ↔ 클라우드 기록 맞추기
   로그인했을 때·로그인된 채로 앱을 열 때 한 번 실행한다.
   · 기기에만 있는 기록 → 클라우드에 올림   · 클라우드에만 있는 기록 → 기기로 내려받음
   · 같은 기록(날짜·감정·주제·필요가 같음)은 한 건으로 보고, 일기가 있는 쪽을 살림
   가족이 함께 쓰는 기기를 위해: 기기의 기록이 다른 계정으로 맞춰졌던 것이면 올리지 않고
   지금 로그인한 계정의 기록으로 바꾼다 (이전 계정의 기록은 그 계정 클라우드에 그대로 있음).
═══════════════════════════════════════ */
/* 기기의 기록 한 건 → 서버에 넣을 한 줄 */
function moodToRow(h, uid) {
    return { user_id: uid, date: h.date, emotion: h.emotion, topic: h.topic, need: h.need,
             diary_text: h.diary || null, verse_ref: h.ref || null };
}
/* 감정 기록 넣기. 서버 테이블에 verse_ref 열이 아직 없으면(docs/supabase_schema.sql 실행 전) 그 열만 빼고 다시 넣는다
   — 열 하나 때문에 기록 저장 전체가 실패하지 않게. one=true면 넣은 줄의 id를 돌려받는다 */
let _noVerseRefCol = false;
async function insertMoodRows(rows, one) {
    const run = list => { const q = sb.from('mood_history').insert(one ? list[0] : list); return one ? q.select('id').single() : q; };
    const strip = list => list.map(r => { const c = { ...r }; delete c.verse_ref; return c; });
    if (_noVerseRefCol) return run(strip(rows));
    const res = await run(rows);
    if (res && res.error && /verse_ref/.test(String(res.error.message || ''))) {
        _noVerseRefCol = true;
        logErr('mood.verse_ref', '서버에 verse_ref 열이 없음 — docs/supabase_schema.sql을 실행하세요');
        return run(strip(rows));
    }
    return res;
}

let _syncedUser = null, _syncing = false;
async function syncWithServer() {
    if (!sb || !sbUser || _syncing || _syncedUser === sbUser.id) return;
    _syncing = true;
    const uid = sbUser.id;
    try {
        const owner = lsGet('dataOwner');
        const mine = !owner || owner === uid;
        const cut = ymd(addDays(new Date(), -LOCAL_KEEP_DAYS));
        const [m, s, v, p] = await Promise.all([
            sb.from('mood_history').select('*').eq('user_id', uid).gte('date', cut).limit(2000),
            sb.from('saved_verses').select('*').eq('user_id', uid).limit(1000),
            sb.from('visit_dates').select('visit_date').eq('user_id', uid).gte('visit_date', cut).limit(1000),
            sb.from('profiles').select('*').eq('id', uid).maybeSingle(),
        ]);
        const failed = m.error || s.error || v.error;
        if (failed) throw failed;
        if (!sbUser || sbUser.id !== uid) return; // 그 사이 로그아웃함
        let pulled = 0, pushed = 0;

        /* 감정 기록 */
        const mKey = h => [h.date, h.emotion, h.topic, h.need].join('|');
        const serverMoods = new Map();
        (m.data || []).forEach(r => {
            if (!isYmd(r.date) || !r.emotion) return;
            const h = { date:r.date, emotion:r.emotion, topic:r.topic, need:r.need, emoji:E_EMOJI[r.emotion] || '' };
            if (r.diary_text) h.diary = r.diary_text;
            if (r.verse_ref) h.ref = r.verse_ref;
            const k = mKey(h), old = serverMoods.get(k);
            if (!old || (!old.diary && h.diary)) serverMoods.set(k, h);
        });
        const localMoods = mine ? getMoods() : [];
        const localKeys = new Set(localMoods.map(mKey));
        const upMoods = localMoods.filter(h => h.date >= cut && !serverMoods.has(mKey(h)));
        if (upMoods.length) {
            const { error } = await insertMoodRows(upMoods.map(h => moodToRow(h, uid)), false);
            if (error) throw error;
            pushed += upMoods.length;
        }
        localMoods.forEach(h => { const r = serverMoods.get(mKey(h)); if (!r) return; if (!h.diary && r.diary) h.diary = r.diary; if (!h.ref && r.ref) h.ref = r.ref; });
        const downMoods = [...serverMoods.values()].filter(h => !localKeys.has(mKey(h)));
        pulled += downMoods.length;
        // 기기 기록의 순서(최근에 한 것이 앞)를 지키면서 날짜순으로
        const moods = [...localMoods, ...downMoods].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
        lsSet('moodHistory', trimMoods(moods));

        /* 즐겨찾기 말씀 */
        const vKey = x => x.ref + '|' + x.verse;
        const serverSaved = new Map();
        (s.data || []).forEach(r => {
            if (!r.verse_text) return;
            const known = r.emotion != null && _EMO_IDX[r.emotion] != null;
            const x = { verse:r.verse_text, ref:r.verse_ref || '', savedAt: r.saved_at || r.created_at || null };
            if (known) { x.emotion = r.emotion; if (r.need) x.need = r.need; }
            else if (r.emotion) x.context = r.emotion; // 예전 방식: 감정 칸에 표시용 글이 들어 있음
            if (!serverSaved.has(vKey(x))) serverSaved.set(vKey(x), x);
        });
        const localSaved = mine ? getSaved() : [];
        const localSavedKeys = new Set(localSaved.map(vKey));
        const upSaved = localSaved.filter(x => !serverSaved.has(vKey(x)));
        if (upSaved.length) {
            const { error } = await sb.from('saved_verses').insert(upSaved.map(x => ({
                user_id: uid, verse_text: x.verse, verse_ref: x.ref, emotion: x.emotion || x.context || null, need: x.need || null })));
            if (error) throw error;
            pushed += upSaved.length;
        }
        const downSaved = [...serverSaved.values()].filter(x => !localSavedKeys.has(vKey(x)))
            .sort((a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')));
        pulled += downSaved.length;
        lsSet('savedVerses', [...localSaved, ...downSaved].slice(0, SAVED_MAX));

        /* 방문일(연속 출석) */
        const serverVisits = (v.data || []).map(r => r.visit_date).filter(isYmd);
        const localVisits = mine ? getVisits() : [todayStr()];
        const upVisits = localVisits.filter(d => !serverVisits.includes(d));
        if (upVisits.length) {
            const { error } = await sb.from('visit_dates').upsert(upVisits.map(d => ({ user_id: uid, visit_date: d })), { onConflict: 'user_id,visit_date' });
            if (error) throw error;
        }
        lsSet('visitDates', [...new Set([...localVisits, ...serverVisits])].sort());

        /* 프로필: 이 기기에 호칭이 없으면 클라우드 것을 쓰고, 설정은 이 기기 것을 올림 */
        const prof = p && !p.error ? p.data : null;
        if (prof && prof.name && !lsGet('userName')) lsSet('userName', prof.name);
        const up = await sb.from('profiles').upsert({
            id: uid, name: lsGet('userName') || '', lang: appLang,
            theme: lsGet('appTheme') || 'night', font_level: fontLevel });
        if (up && up.error) logErr('sync.profile', up.error);

        lsSet('dataOwner', uid);
        _syncedUser = uid;
        safe('sync.render', () => { updateStreak(); setWelcome(); renderOnThisDay(); refreshVaultIfOpen(); refreshHistoryIfOpen(); });
        const L = LANG_DATA[appLang]||LANG_DATA.ko;
        if (pulled) toast(L.sync_pulled); else if (pushed) toast(L.sync_pushed);
    } catch (e) {
        logErr('sync', e); // 다음에 앱을 열 때 다시 시도
    } finally {
        _syncing = false;
    }
}
