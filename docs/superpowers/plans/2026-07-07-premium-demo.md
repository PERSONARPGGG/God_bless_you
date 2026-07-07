# 프리미엄 v3.0 시연회 목업 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2026-07-08 시연회용 — presentation.html 프리미엄 슬라이드 1장 + index.html 프리미엄 목업(모달 카피 개편, 월간 리포트 잠금/해제, PDF "나의 신앙 일기장" 내보내기).

**Architecture:** 기존 프리미엄 골격(`premium-modal`, `openPremiumModal()`, `isPremium()`, `.pm-lock-card`)을 확장. 월간 리포트는 대시보드 오버레이 안에 새 섹션으로 추가하고 `isPremium()` 분기로 블러+자물쇠 ↔ 실데이터 렌더 전환. PDF는 외부 라이브러리 없이 숨김 `#print-diary` DOM + `@media print` CSS + `window.print()`. 결제는 미연동 — devMode에서 자물쇠 5탭으로 `premiumActive` 토글해 시연.

**Tech Stack:** Vanilla JS, 단일 index.html (새 파일 금지), Service Worker 캐시 버전 수동 bump.

## Global Constraints

- **새 파일 금지**: 앱 기능은 전부 `index.html` 안에. 이번 작업에서 새로 만드는 파일 없음 (계획서 제외).
- **Vanilla JS 전용**, 외부 라이브러리·CDN 금지 (PDF도 `window.print()` 기반).
- **가격 표기 통일**: `₩1,900/월 · 연 ₩19,000`
- **카피 어조**: "지워져요" 같은 위협 표현 금지. 무료 경계는 "무료는 최근 60일을 함께해요"로 표현.
- **한/영/일 3개국어**: LANG_DATA에 넣는 키는 ko/en/ja 세 곳 모두 추가.
- **git add -A 절대 금지** — 항상 파일 명시 지정 (`git add index.html sw.js` 식).
- 자동 테스트 없음 → 각 태스크는 로컬 브라우저 수동 검증 스텝으로 대체. 로컬 실행: `npx serve` 후 `http://localhost:3000` (file:// 로 열면 SW·Supabase 비활성).
- 배포 전 `sw.js`의 `CACHE = 'god-app-v21'` → `'god-app-v22'` bump (Task 5에서 1회만).

---

### Task 1: presentation.html 프리미엄 슬라이드 삽입 (S13, TOTAL 16)

**Files:**
- Modify: `docs/presentation.html` (슬라이드 삽입 위치 537행 부근 `<!-- S13: 로드맵 -->` 직전, 번호 재부여 538~622행, `const TOTAL = 15` 634행, S11 진행률 500~504행, S14 Q&A 588행)

**Interfaces:**
- Consumes: 기존 `.slide[data-slide]` 내비게이션 (`TOTAL` 상수, dots 자동 생성)
- Produces: 새 슬라이드 `data-slide="13"`, 기존 13/14/15 → 14/15/16

- [ ] **Step 1: 새 프리미엄 슬라이드 마크업 삽입**

`<!-- S13: 로드맵 -->` 주석 바로 앞에 삽입:

```html
  <!-- S13: Premium 수익 모델 -->
  <div class="slide" data-slide="13">
    <div class="eyebrow">Business Model</div>
    <h2>커피 반 잔 값으로,<br><span style="color:var(--gold);">당신의 모든 밤이 한 권의 책이 됩니다</span></h2>
    <div style="display:flex;gap:20px;margin-top:24px;width:100%;max-width:1000px;align-items:stretch;">
      <!-- 좌: 무료/프리미엄 경계표 -->
      <div style="flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px 24px;">
        <div style="font-size:13px;letter-spacing:1.5px;color:var(--gold2);margin-bottom:12px;">무료 / 프리미엄 경계</div>
        <div style="font-size:14px;line-height:2.0;color:rgba(255,255,255,.75);">
          <div>🌙 묵상 플로우·보관함·스트릭 — <b style="color:#86efac;">전부 무료</b></div>
          <div style="border-top:1px solid rgba(255,255,255,.08);margin-top:8px;padding-top:8px;color:var(--gold2);font-weight:700;">💎 Premium ₩1,900/월 · 연 ₩19,000</div>
          <div>📔 기록 평생 보관 <span style="color:rgba(255,255,255,.4);font-size:12px;">(무료는 최근 60일)</span></div>
          <div>📄 PDF "나의 신앙 일기장"</div>
          <div>📊 월간·연간 리포트 — 돌보심의 기록</div>
          <div>🗓️ 묵상 캘린더 + 시즌 챌린지</div>
          <div>🐑 양 꾸미기 <span style="color:rgba(255,255,255,.4);font-size:12px;">(매월 소품 추가)</span></div>
        </div>
      </div>
      <!-- 우: 결제 순간 스토리 -->
      <div style="flex:1;background:rgba(200,168,107,.06);border:1px solid rgba(200,168,107,.18);border-radius:16px;padding:20px 24px;">
        <div style="font-size:13px;letter-spacing:1.5px;color:var(--gold2);margin-bottom:12px;">누가 · 언제 · 왜 결제하나</div>
        <div style="font-size:14.5px;line-height:1.9;color:rgba(255,255,255,.8);">
          워킹맘 수진님, <b style="color:var(--gold);">61일째 밤</b> 앱을 엽니다.<br>
          <span style="color:rgba(255,255,255,.55);font-style:italic;">"두 달 전 그 밤의 기도, 계속 간직할까요?"</span><br>
          수진님은 그 밤을 기억합니다.<br>
          월 1,900원 — 커피 반 잔으로 모든 밤을 지킵니다.<br>
          그리고 12월, <b style="color:var(--gold);">1년치 기도가 담긴 PDF 일기장</b>을 받습니다.
        </div>
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:rgba(255,255,255,.5);">
          넛지 3지점: 61일째 만료 임박 · 스트릭 30일 축하 · 월간 리포트 잠금<br>
          수익 추정: MAU 1,000 × 전환 5% × ₩1,900 = <b style="color:#86efac;">₩95,000/월</b> (인프라 ₩0)
        </div>
      </div>
    </div>
  </div>
```

- [ ] **Step 2: 기존 슬라이드 번호 재부여 + TOTAL 수정**

- `<!-- S13: 로드맵 -->` → `<!-- S14: 로드맵 -->`, `data-slide="13"`(로드맵) → `data-slide="14"`
- `<!-- S14: 예상 Q&A -->` → S15, `data-slide="14"` → `"15"`
- 마지막 Thank You `data-slide="15"` → `"16"`
- `const TOTAL = 15;` → `const TOTAL = 16;`

주의: 새 슬라이드가 `data-slide="13"`을 가져가므로 기존 로드맵의 13을 먼저 14로 바꾸면 중복 없음 (뒤에서부터 15→16, 14→15, 13→14 순서로 치환).

- [ ] **Step 3: S11 진행률·S15(Q&A) 최신화**

- S11: `💎 Premium 플랜 ₩1,900/월 (v3.0)` 진행률 `10` → `60`, note `가격 구성안 검토 중` → `모델 확정 · 앱 내 목업 완성 · 결제 연동 남음`
- Q&A 슬라이드 "프리미엄 전환율?" 답변 교체:
  `→ ₩1,900 낮은 진입장벽 + 대시보드 인사이트로 유도.` → `→ 61일째 기록 만료 넛지 + PDF 일기장(실물 가치)으로 전환. ₩1,900 = 구독 저항선 아래.`

- [ ] **Step 4: 브라우저 검증**

`docs/presentation.html` 직접 열기. 확인: ① 슬라이드 총 16장, 카운터 `n / 16` ② 13번 = 프리미엄 슬라이드, 좌우 카드 레이아웃 안 깨짐 ③ 14 로드맵 / 15 Q&A / 16 Thank You 순서 정상 ④ 도트 16개, 클릭 이동 정상.

- [ ] **Step 5: Commit**

```bash
git add docs/presentation.html
git commit -m "docs: 발표자료 프리미엄 슬라이드 추가 (S13, 총 16장)"
```

---

### Task 2: 프리미엄 모달 카피 개편 + devMode 체험 토글

**Files:**
- Modify: `index.html`
  - LANG_DATA ko `pm_*` (4155~4160행), en (4272행 부근), ja (4384행 부근)
  - `openPremiumModal()` (6150행)
  - `isPremium()` 주변 (6148행) — 체험 토글 함수 추가
  - `.pm-lock-card` 마크업 (1884행) — 자물쇠 아이콘에 5탭 핸들러

**Interfaces:**
- Consumes: `lsGet`/`lsSet`, `isDevMode()`, `toast()`, `LANG_DATA[appLang]`
- Produces: `isPremium()` (기존 시그니처 유지), `devPremiumTap()` (자물쇠 5탭 토글), LANG_DATA 키 `pm_f5` 추가. Task 3·4가 `isPremium()` 분기와 `pm_f5`를 사용.

- [ ] **Step 1: LANG_DATA 카피 갱신 (ko/en/ja 3곳)**

ko (4155~4160행) 교체:

```js
pm_title:'프리미엄', pm_desc:'무료는 최근 60일을 함께해요.\n프리미엄은 당신의 모든 밤을 평생 간직해요.',
pm_f1:'📔 일기·감정 기록 평생 보관', pm_f2:'📄 PDF 내보내기 — 나의 신앙 일기장',
pm_f3:'📊 월간·연간 리포트 — 돌보심의 기록', pm_f4:'🗓️ 묵상 캘린더 + 시즌 챌린지',
pm_f5:'🐑 양 꾸미기 — 매월 새 소품',
pm_price:'월 ₩1,900 · 연 ₩19,000 (2달 무료)', pm_cta:'🔔 출시 알림 받기',
pm_cta_done:'신청 완료! 준비되면 가장 먼저 알려드릴게요 🙏', pm_close:'닫기',
pm_lock_title:'월간 리포트 & PDF 내보내기', pm_lock_sub:'프리미엄에서 만나요 · ₩1,900/월',
```

en (4272행 부근) 같은 구조로:

```js
pm_title:'Premium', pm_desc:'Free keeps your last 60 days.\nPremium keeps every night, forever.',
pm_f1:'📔 Keep all diary & mood records forever', pm_f2:'📄 PDF export — My Faith Journal',
pm_f3:'📊 Monthly & yearly reports', pm_f4:'🗓️ Devotion calendar + challenges',
pm_f5:'🐑 Dress up your sheep — new item monthly',
pm_price:'₩1,900/mo · ₩19,000/yr (2 months free)', pm_cta:'🔔 Notify me at launch',
```

ja (4384행 부근):

```js
pm_title:'プレミアム', pm_desc:'無料は直近60日をともに。\nプレミアムはすべての夜を永久保存。',
pm_f1:'📔 日記・感情記録を永久保存', pm_f2:'📄 PDF出力 — わたしの信仰日記',
pm_f3:'📊 月間・年間レポート', pm_f4:'🗓️ 黙想カレンダー＋チャレンジ',
pm_f5:'🐑 ひつじの着せ替え — 毎月新アイテム',
pm_price:'月₩1,900 · 年₩19,000（2ヶ月無料）', pm_cta:'🔔 リリース通知を受け取る',
```

(en/ja의 `pm_cta_done`/`pm_close`/`pm_lock_*`는 기존 값 유지 — 교체 대상은 위 키만.)

- [ ] **Step 2: openPremiumModal() feats에 pm_f5 포함**

6154행:

```js
document.getElementById('pm-feats').innerHTML = [L.pm_f1,L.pm_f2,L.pm_f3,L.pm_f4,L.pm_f5].map(f=>`<li>${f}</li>`).join('');
```

- [ ] **Step 3: devMode 프리미엄 체험 토글 추가**

`isPremium()` (6148행) 아래에 추가. 기존 달 5탭 패턴(6068행 부근)과 동일한 접근 — 자물쇠 아이콘 5탭:

```js
/* devMode 한정: 자물쇠 아이콘 5탭 → 프리미엄 체험 토글 (시연용, 결제 미연동) */
let _pmTapCnt = 0, _pmTapTimer = null;
function devPremiumTap(ev) {
    if (!isDevMode()) return;
    ev.stopPropagation();
    _pmTapCnt++;
    clearTimeout(_pmTapTimer);
    _pmTapTimer = setTimeout(() => { _pmTapCnt = 0; }, 1500);
    if (_pmTapCnt >= 5) {
        _pmTapCnt = 0;
        const on = !(lsGet('premiumActive') === true);
        lsSet('premiumActive', on);
        toast(on ? '💎 프리미엄 체험 모드 ON' : '🔒 프리미엄 체험 모드 OFF');
        openDashboard(); // 잠금/해제 상태 즉시 반영해 다시 렌더
    }
}
```

`.pm-lock-card` 마크업(1884행)의 자물쇠 아이콘에 핸들러:

```html
<span class="pm-lock-icon" onclick="devPremiumTap(event)">🔒</span>
```

주의: `lsGet`은 JSON.parse — `premiumActive`는 boolean으로 저장하므로 `=== true` 비교 유지 (기존 `isPremium()` 그대로).

- [ ] **Step 4: 브라우저 검증**

`npx serve` → localhost. ① 대시보드(devMode 켠 상태, 달 5탭·비번 7501) → 잠금 카드 탭 → 모달에 항목 5개·새 카피·가격 `(2달 무료)` 표시 ② 언어 en/ja 전환 후 모달 재확인 ③ 자물쇠 🔒 5탭 → "💎 프리미엄 체험 모드 ON" 토스트 ④ 다시 5탭 → OFF.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: 프리미엄 모달 카피 확정(5기능·3개국어) + devMode 체험 토글"
```

---

### Task 3: 대시보드 월간 리포트 섹션 — 블러 자물쇠 ↔ 실데이터

**Files:**
- Modify: `index.html`
  - 대시보드 마크업 (1881행 `</div>`(#db-detail 닫힘)과 1883행 잠금 카드 사이에 섹션 삽입)
  - CSS (1042행 `.pm-lock-txt b` 뒤에 블록 추가)
  - `renderDashboard()` (6601행) + 새 함수 `renderDbMonthly()` (renderDbNarrative 앞 6614행 부근에 추가)

**Interfaces:**
- Consumes: `isPremium()` (Task 2), `lsGet('moodHistory')`, `DB_EMO_COLORS`/`DB_EMO_LIST` (6644행), `openPremiumModal()`
- Produces: `renderDbMonthly()` — 인자 없음, `#db-monthly` DOM 채움. `getMonthEntries()` — 이번 달 moodHistory 배열 반환 `{date,emotion,emoji,diary,...}[]`. Task 4가 `getMonthEntries()` 재사용.

- [ ] **Step 1: 마크업 삽입**

`#db-detail` 닫는 `</div>`(1881행) 다음, 잠금 카드 주석(1883행) 앞:

```html
        <!-- 월간 리포트 (프리미엄 경계) -->
        <div class="db-sec" id="db-monthly-sec">
            <div class="db-sec-t">이번 달 돌보심의 기록</div>
            <div id="db-monthly"></div>
        </div>
```

- [ ] **Step 2: CSS 추가 (1042행 뒤)**

```css
        /* ── 월간 리포트 잠금 ── */
        .db-month-wrap{position:relative;border-radius:14px;overflow:hidden;}
        .db-month-wrap.locked .db-month-body{filter:blur(7px);pointer-events:none;user-select:none;}
        .db-month-body{padding:4px 2px;}
        .db-month-line{font-size:13.5px;color:rgba(255,255,255,.85);line-height:1.8;margin-bottom:10px;}
        .db-month-line b{color:#e8c98a;}
        .db-month-lock{position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;
            align-items:center;justify-content:center;background:rgba(10,14,30,.35);
            border:none;cursor:pointer;color:#fff;}
        .db-month-lock .lk-ic{font-size:26px;}
        .db-month-lock .lk-tx{font-size:12.5px;color:rgba(255,255,255,.85);line-height:1.6;text-align:center;}
        .db-month-lock .lk-tx b{color:#e8c98a;font-size:13.5px;}
        .db-pdf-btn{display:block;width:100%;margin-top:10px;padding:12px;border-radius:12px;
            border:1px solid rgba(200,168,107,.4);background:rgba(200,168,107,.12);
            color:#e8c98a;font-size:13.5px;font-weight:700;cursor:pointer;}
```

- [ ] **Step 3: 데이터 헬퍼 + 렌더 함수 (DB_NARRATIVES 정의 앞, 6614행 부근)**

```js
/* ── 이번 달 기록 (localStorage 기준 — 시연 목적, Supabase 월간 조회는 v3.0 본구현에서) ── */
function getMonthEntries() {
    const ym = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    const hist = lsGet('moodHistory') || [];
    return hist.filter(m => m.date && m.date.startsWith(ym))
               .sort((a, b) => a.date.localeCompare(b.date));
}

/* ── 월간 리포트: 프리미엄이면 실데이터, 아니면 블러+자물쇠 ── */
const HEAVY_EMOS = ['걱정', '지침', '아픔'];
function renderDbMonthly() {
    const el = document.getElementById('db-monthly');
    if (!el) return;
    const entries = getMonthEntries();
    const cnt = {};
    DB_EMO_LIST.forEach(e => cnt[e] = 0);
    entries.forEach(m => { if (cnt[m.emotion] !== undefined) cnt[m.emotion]++; });
    const total = entries.length;
    const heavy = entries.filter(m => HEAVY_EMOS.includes(m.emotion)).length;
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
    const monthNum = new Date().getMonth() + 1;

    /* 돌보심의 기록 — 숫자가 아니라 문장으로 */
    const lines = [];
    if (!total) {
        lines.push(`${monthNum}월의 기록이 아직 없어요. 오늘 밤부터 시작해보세요 ✦`);
    } else {
        lines.push(`${monthNum}월, <b>${total}일 밤</b>을 목장에서 보내셨어요.`);
        if (heavy > 0) lines.push(`마음이 무거웠던 <b>${heavy}일</b>에도, 매일 말씀이 함께했어요.`);
        if (top && top[1] > 0) lines.push(`가장 자주 머문 마음은 <b>‘${top[0]}’</b>(${top[1]}일)이었어요.`);
    }
    const bodyHtml = `<div class="db-month-body">
        ${lines.map(l => `<div class="db-month-line">${l}</div>`).join('')}
    </div>`;

    if (isPremium()) {
        el.innerHTML = `<div class="db-month-wrap">${bodyHtml}</div>
            <button class="db-pdf-btn" type="button" onclick="exportDiaryPdf()">📄 PDF로 내보내기 — 나의 신앙 일기장</button>`;
    } else {
        el.innerHTML = `<div class="db-month-wrap locked">${bodyHtml}
            <button class="db-month-lock" type="button" onclick="openPremiumModal()">
                <span class="lk-ic">🔒</span>
                <span class="lk-tx"><b>월간 리포트 & PDF 일기장</b><br>프리미엄에서 만나요 · ₩1,900/월</span>
            </button>
        </div>`;
    }
}
```

주의: `exportDiaryPdf`는 Task 4에서 정의. Task 3 검증 시점엔 프리미엄 ON 상태에서 버튼 클릭 시 ReferenceError — Task 3에서는 버튼 노출까지만 확인.

- [ ] **Step 4: renderDashboard()에 연결 (6603행 부근)**

```js
function renderDashboard(data) {
    const { startStr } = getWeekRange();
    renderDbNarrative(data);
    renderDbEmoBars(data);
    renderDbDayFlow(data, startStr);
    renderDbPatterns(data);
    renderDbDiaries(data);
    renderDbMonthly();
    // ...기존 db-detail 접기 로직 유지
```

- [ ] **Step 5: 브라우저 검증**

localhost, devMode ON. ① 체험 모드 OFF 상태: 대시보드에 "이번 달 돌보심의 기록" 섹션 — 문장 블러 처리 + 🔒 오버레이, 탭하면 프리미엄 모달 ② 페르소나 "워킹맘 수진" 선택 후에도 월간 섹션 유지 ③ 자물쇠 5탭 → 체험 ON → 블러 해제, 문장 3줄("N일 밤"·"무거웠던 N일"·"가장 자주 머문 마음") + PDF 버튼 노출 ④ 모바일 뷰포트(iPhone SE)에서 레이아웃 안 깨짐.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: 대시보드 월간 리포트 — 무료 블러 잠금 / 프리미엄 실데이터"
```

---

### Task 4: PDF "나의 신앙 일기장" — window.print 기반

**Files:**
- Modify: `index.html`
  - `</body>` 직전 (7000행 부근) 숨김 `#print-diary` 컨테이너 추가
  - CSS 끝부분에 `@media print` 블록 추가
  - `renderDbMonthly()` 아래에 `exportDiaryPdf()` 추가

**Interfaces:**
- Consumes: `getMonthEntries()` (Task 3), `VERSE_POOL` (2660행, 키 `감정_필요`, 항목 `{v, r}`), `E_EMOJI`
- Produces: `exportDiaryPdf()` — `#print-diary` 채우고 `window.print()` 호출

- [ ] **Step 1: 숨김 컨테이너 마크업 (`</body>` 직전)**

```html
<!-- 인쇄 전용: 나의 신앙 일기장 (화면에선 숨김) -->
<div id="print-diary" aria-hidden="true"></div>
```

- [ ] **Step 2: 인쇄 CSS (전역 `<style>` 끝에 추가)**

인쇄물은 종이 기준 밝은 테마 — 앱 다크 테마와 분리:

```css
        /* ── PDF 일기장 (인쇄 전용) ── */
        #print-diary{display:none;}
        @media print{
            body > :not(#print-diary){display:none !important;}
            body{background:#fff !important;}
            #print-diary{display:block;color:#2a2320;font-family:'Noto Serif KR','Nanum Myeongjo',serif;}
            .pd-cover{height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
                text-align:center;page-break-after:always;}
            .pd-cover .pd-moon{font-size:64px;margin-bottom:18px;}
            .pd-cover h1{font-size:34px;letter-spacing:2px;margin:0 0 10px;}
            .pd-cover .pd-sub{font-size:15px;color:#8a7a66;letter-spacing:4px;}
            .pd-cover .pd-range{margin-top:26px;font-size:14px;color:#6b5d4f;}
            .pd-entry{page-break-inside:avoid;border-bottom:1px solid #e5dccf;padding:18px 6px;}
            .pd-date{font-size:13px;color:#8a7a66;letter-spacing:1px;}
            .pd-emo{font-size:15px;font-weight:700;margin:6px 0;}
            .pd-verse{font-size:13.5px;line-height:1.9;color:#5a4d3f;font-style:italic;margin:8px 0;}
            .pd-verse .pd-ref{font-style:normal;color:#8a7a66;font-size:12px;}
            .pd-diary{font-size:14px;line-height:1.9;margin-top:6px;}
            .pd-foot{text-align:center;font-size:11px;color:#b0a48f;padding:24px 0;letter-spacing:3px;}
        }
```

- [ ] **Step 3: exportDiaryPdf() 구현 (renderDbMonthly 아래)**

```js
/* ── PDF 내보내기: 이번 달 기록 → 인쇄 다이얼로그 (PDF로 저장) ── */
function exportDiaryPdf() {
    const entries = getMonthEntries();
    if (!entries.length) { toast('이번 달 기록이 아직 없어요'); return; }
    const pd = document.getElementById('print-diary');
    const now = new Date();
    const ymLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    const fmtDate = ds => {
        const d = new Date(ds + 'T12:00:00');
        const dow = ['일','월','화','수','목','금','토'][d.getDay()];
        return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dow})`;
    };
    const entryHtml = entries.map(m => {
        const pool = VERSE_POOL[`${m.emotion}_${m.need}`];
        const verse = pool && pool[0];
        return `<div class="pd-entry">
            <div class="pd-date">${fmtDate(m.date)}</div>
            <div class="pd-emo">${m.emoji || ''} ${m.emotion}</div>
            ${verse ? `<div class="pd-verse">“${verse.v}” <span class="pd-ref">— ${verse.r}</span></div>` : ''}
            ${m.diary ? `<div class="pd-diary">${m.diary}</div>` : ''}
        </div>`;
    }).join('');
    pd.innerHTML = `
        <div class="pd-cover">
            <div class="pd-moon">🌙</div>
            <h1>나의 신앙 일기장</h1>
            <div class="pd-sub">밤 의 목 장</div>
            <div class="pd-range">${ymLabel} · ${entries.length}일의 기록</div>
        </div>
        ${entryHtml}
        <div class="pd-foot">🐑 밤의 목장 — 오늘 밤, 주님이 누이시는 곳</div>`;
    window.print();
}
```

주의: `m.diary`는 사용자 입력 텍스트 → innerHTML 삽입 전 이스케이프 필요. 기존 코드에 escape 헬퍼가 있는지 grep (`escapeHtml|esc(`), 없으면 추가:

```js
function escHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
```

`m.diary` → `escHtml(m.diary)`, `${m.emotion}` → `escHtml(m.emotion)`으로 감싸기.

- [ ] **Step 4: 브라우저 검증**

localhost, devMode+체험 ON, 페르소나 "워킹맘 수진" 로드. ① PDF 버튼 → 인쇄 다이얼로그, 미리보기: 표지(🌙 나의 신앙 일기장 / 7월 · N일의 기록) 1페이지 + 날짜별 항목(날짜·감정·말씀 이탤릭·일기) ② 다이얼로그 취소 후 앱 화면 정상 (print-diary 안 보임) ③ 대상 "PDF로 저장" 선택해 실제 PDF 1부 생성 — **시연회 인쇄용으로 파일 보관** ④ 기록 0건 상태(새 시크릿 창)에서 버튼 → "이번 달 기록이 아직 없어요" 토스트.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: PDF 나의 신앙 일기장 — window.print 기반 월간 내보내기"
```

---

### Task 5: 캐시 bump + 배포 + 실배포 검증

**Files:**
- Modify: `sw.js:2` — `const CACHE = 'god-app-v21';` → `'god-app-v22'`

- [ ] **Step 1: sw.js 캐시 버전 bump**

- [ ] **Step 2: Commit + Push**

```bash
git add sw.js
git commit -m "chore: SW 캐시 v22 — 프리미엄 목업 배포"
git push origin main
```

- [ ] **Step 3: Vercel 배포 후 /verify 스킬 실행**

https://god-bless-you.vercel.app/ 에서: ① 새 SW 업데이트 반영 확인 ② devMode 진입(달 5탭, 7501) → 대시보드 → 월간 잠금 → 모달 → 자물쇠 5탭 체험 ON → 월간 문장 + PDF 버튼 ③ 감정선택→결과→저장 핵심 플로우 회귀 확인 ④ 모바일 뷰포트 확인.

- [ ] **Step 4: /code-review**

커밋 전 단계별로 이미 검증했으므로 배포 후 `/code-review medium`으로 diff 전체(f39006b..HEAD) 회귀 점검. 특히: `escHtml` 적용 누락, `lsGet` 타입 함정(`String(...)` 비교), 3개국어 키 누락.

---

## 시연 시나리오 (참고 — 구현 아님)

1. 발표: S13 프리미엄 슬라이드 — 가치제안 한 문장 → 경계표 → 수진 스토리 → 수익 추정
2. 앱 라이브: 대시보드 → 월간 리포트 **블러+자물쇠** → 탭 → 프리미엄 모달 (₩1,900) = "결제 순간"
3. 자물쇠 5탭 (devMode) → 체험 ON → 월간 문장 공개 → **PDF 내보내기** → 표지 등장
4. 마무리: 미리 인쇄해 간 실물 "나의 신앙 일기장" 심사위원에게 전달
