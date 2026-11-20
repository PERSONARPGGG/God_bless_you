/* 밤의 목장 — js/data.js : 감정·주제·필요의 이름표와 라벨 함수 (말씀·묵상 본문은 data-verses.js / data-text.js)
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   § 데이터
═══════════════════════════════════════ */

const E_EMOJI = { 감사:'😊', 평안:'😌', 걱정:'😔', 지침:'😞', 아픔:'😢', 기도:'🙏' };
const _EMO_IDX = { 감사:0, 평안:1, 걱정:2, 지침:3, 아픔:4, 기도:5 };
const _EMO_ICON = ['😊','😌','😔','😞','😢','🙏'];
const _TOP_IDX  = { 일:0, 가족:1, 공부:2, 사람:3, 건강:4, 자녀:5, 신앙:6, 모름:7 };
const _TOP_ICON = ['💼','🏠','📚','🤝','🌿','👶','🕊️','🌫️'];
const _NEE_IDX  = { 위로:0, 힘:1, 지혜:2, 쉼:3 };
const _NEE_ICON = ['🌸','💪','💡','🍃'];
function eLabel(k){ const L=LANG_DATA[appLang]||LANG_DATA.ko; const i=_EMO_IDX[k]; return i!=null?_EMO_ICON[i]+' '+L.emo[i]:k; }
function tLabel(k){ const L=LANG_DATA[appLang]||LANG_DATA.ko; const i=_TOP_IDX[k];  return i!=null?_TOP_ICON[i]+' '+L.topic[i]:k; }
function nLabel(k){ const L=LANG_DATA[appLang]||LANG_DATA.ko; const i=_NEE_IDX[k];  return i!=null?_NEE_ICON[i]+' '+L.need[i]:k; }
