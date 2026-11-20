/* 밤의 목장 — js/diary.js : 오늘의 한 줄 일기 · 쓰는 동안 기기에 저장 · 마무리 때 자동 저장 · 클라우드 반영
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */


/* ═══════════════════════════════════════
   오늘의 한 줄 일기
═══════════════════════════════════════ */
/* 클로징 시점에 일기 내용이 있으면 자동 저장 (저장 버튼 없음) */
function autoSaveDiary() {
    const L = LANG_DATA[appLang]||LANG_DATA.ko;
    const text = document.getElementById('diary-input').value.trim();
    if (!text) {   // 쓴 글을 직접 모두 지웠다면 저장된 글도 지운다 (칸이 비어 있기만 한 경우는 건드리지 않음)
        if (_diaryEmptied && saveDiaryLocal('')) pushDiaryToCloud(null);
        return;
    }
    if (!saveDiaryLocal(text)) { toast(L.toast_store_fail); return; }   // 저장하지 못했는데 "저장됐다"고 말하지 않는다
    pushDiaryToCloud(text);
    document.getElementById('diary-saved-msg').style.display='block';
    toast(L.toast_diary_saved);
}

/* 지금 보고 있는 결과의 기록(오늘·감정·주제·필요가 같은 가장 최근 줄)에 일기를 적는다.
   이 기기에만 — 인터넷이 없어도 된다. 클라우드에는 pushDiaryToCloud()가, 못 올린 것은 나중에 syncWithServer()가 */
function saveDiaryLocal(text) {
    const hist = getMoods(), today = todayStr();
    const h = hist.find(x => x.date === today && x.emotion === sel.emotion && x.topic === sel.topic && x.need === sel.need);
    if (!h) return false;                       // 붙일 기록이 없음
    if ((h.diary || '') === text) return true;  // 이미 같은 글
    if (text) h.diary = text; else delete h.diary;
    if (!lsSet('moodHistory', hist)) return false;
    safe('history.cache', () => clearHistoryCache());
    return true;
}
/* 일기를 클라우드 그 기록 줄에 올림 (실패하면 다음 기록 맞추기 때 올라감) */
function pushDiaryToCloud(text) {
    if (!(sbUser && sb)) return;
    // 방금 넣은 그 줄에만 일기를 붙인다 (id를 모르면 같은 날·같은 선택의 줄). 실패(오프라인 등)하면 다음 맞추기 때 올라감
    let q = sb.from('mood_history').update({diary_text:text}).eq('user_id',sbUser.id);
    q = curMoodRowId != null ? q.eq('id', curMoodRowId)
        : q.eq('date', todayStr()).eq('emotion', sel.emotion).eq('topic', sel.topic).eq('need', sel.need);
    q.then(r => { if (r && r.error) logErr('diary.update', r.error); }, e => logErr('diary.update', e));
}

/* 쓰는 동안 이 기기에 조용히 저장한다. 이전에는 "마치기"를 눌러야만 저장돼서, 앱이 닫히면 쓰던 글이 사라졌다 */
let _diaryDraftTimer = null;
let _diaryEmptied = false;   // 이번 화면에서 사용자가 쓴 글을 모두 지웠는가
/* 쓰는 중인 일기를 기기에 조용히 저장 (마치기 전에 앱이 닫혀도 남도록) */
function saveDiaryDraft() {
    clearTimeout(_diaryDraftTimer); _diaryDraftTimer = null;
    const input = document.getElementById('diary-input'), s4 = document.getElementById('step4');
    if (!input || !s4 || s4.classList.contains('hidden') || !sel.emotion || closingTriggered) return;
    const text = input.value.trim();
    if (text) saveDiaryLocal(text);
    else if (_diaryEmptied) saveDiaryLocal('');   // 직접 비운 경우만 지운다
    //   // 비운 경우는 건드리지 않는다 — 쓰다 만 글을 빈 값으로 덮지 않음
}
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('diary-input');
    if (input) input.addEventListener('input', () => { _diaryEmptied = !input.value.trim(); clearTimeout(_diaryDraftTimer); _diaryDraftTimer = setTimeout(() => safe('diary.draft', saveDiaryDraft), 600); });
});
document.addEventListener('visibilitychange', () => { if (document.hidden) safe('diary.flush', saveDiaryDraft); });
window.addEventListener('pagehide', () => safe('diary.flush', saveDiaryDraft));
