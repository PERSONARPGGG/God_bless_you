# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 밤의 목장 — Claude 작업 가이드

## 프로젝트 개요
크리스천 감정 묵상 PWA "밤의 목장" (부제: "오늘 밤, 주님이 누이시는 곳", 구명: "오늘은 어땠나요?" — 이 질문은 메인 화면 인사말로 유지). `index.html`(마크업) + `css/app.css` + `js/*.js` 19개 + 서버 함수(`api/`, `lib/`) + Supabase + Vercel.
배포: https://god-bless-you.vercel.app/

## 코드 구조 원칙
- **파일 구조 (2026-11-16, 사용자 요청으로 단일 파일 원칙을 바꿈)**: 마크업은 `index.html`, 스타일은 `css/app.css`, 스크립트는 `js/` 아래 주제별 파일. 새 기능은 맞는 파일에 넣고, 파일을 새로 만들면 `index.html`의 `<script>` 목록과 `sw.js`의 `ASSETS`에 함께 추가 (빠뜨리면 `tools/check.mjs`가 오류로 잡음)
- 스크립트는 ES 모듈이 아닌 **일반 스크립트** (HTML의 `onclick="..."`이 전역 함수를 부르기 때문). 불러오는 순서: data → core → i18n → effects → audio → pwa → auth → flow → vault → ui → premium → billing → dashboard → history → aireport → demo → sheep → care → boot. 파일을 불러오는 즉시 실행되는 코드는 앞 파일의 것만 쓸 수 있음
- Vanilla JS 전용 — 프레임워크·번들러 도입 금지 (`tools/`의 점검 스크립트는 앱에 실리지 않는 개발용이며 설치할 의존성이 없음)
- Supabase anon key는 코드에 직접 기재 가능 (RLS로 보호됨, service_role key는 절대 금지). 결제·AI 등 **비밀 키가 필요한 일은 브라우저 코드에 넣지 않고 서버(서버리스 함수)에서만** 한다

### 연쇄 고장을 막는 규칙 (2026-11-17, 모듈화의 목적)
한 구역의 오류가 다른 기능까지 멈추지 않게 하려고 아래를 지킨다.
- **여러 일을 차례로 하는 곳은 단계마다 `safe('이름', () => …)`** (`js/core.js`). 앱 시작(`boot.js`), 결과 화면(`buildResult`), 마무리(`triggerClosing`), 언어 적용(`applyLang`), 프리미엄 변경(`onPremiumChanged`)이 그렇게 되어 있다. 나중에 실행되는 연출은 `later()`
- **저장소는 모양을 믿지 않는다**: 기록은 `getMoods()`/`getSaved()`/`getVisits()`, 배열은 `lsArr()`, 숫자 설정은 `lsInt()`로 읽는다. `lsGet('moodHistory') || []` 같은 직접 읽기 금지
- **날짜는 현지 기준**: `todayStr()`·`ymd(d)`·`parseYmd(s)`·`addDays()`·`monthsAgo()`. `toISOString().slice(0,10)`과 `new Date('YYYY-MM-DD')`는 금지 (한국 새벽에 하루가 밀림)
- **프리미엄 여부는 `isPremium()`만** 묻고, 상태가 바뀌면 `onPremiumChanged()` 한 곳에서 화면을 맞춘다
- 사용자 글(일기·이름)이나 서버에서 온 값을 `innerHTML`에 넣을 때는 `escHtml()`
- 서버 요청은 `.then()`으로 버리지 말고 실패를 `logErr()`에 남긴다. 잡힌 오류는 기기에 30건 남고 콘솔에서 `errLog()`로 본다

## 명령어 (Commands)
빌드 시스템·패키지 매니저 없음 (순수 정적 파일). 점검 도구는 Node(22+)만 있으면 돈다.

- **로컬 실행**: `index.html`을 브라우저로 직접 열거나, PWA/Service Worker 테스트가 필요하면 로컬 서버 사용 (`npx serve` 등). `file://`로 열면 Supabase·Service Worker 관련 코드가 자동으로 비활성화됨 (`location.protocol === 'file:'` 체크)
- **검증 (수정할 때마다, 커밋 전에 반드시 둘 다)**:
  - `node tools/check.mjs` — 정적 점검 (1초). 문법, 파일 목록 일치, 이름 충돌, 죽은 코드, 3개 언어 문구 누락, 콘텐츠 빈 조합, 금지 패턴. `--deps`를 붙이면 파일 간 의존 관계와 localStorage 키 목록
  - `node tools/smoke.mjs` — 실행 점검 (약 1분). PC의 Chrome/Edge를 화면 없이 띄워 18개 시나리오를 실제로 눌러 봄. 이름 일부를 주면 그 시나리오만 (`node tools/smoke.mjs 날짜`), `--url=https://…`로 배포본 대상 실행, `--shots=폴더`로 시나리오 안의 `p.shot('이름')` 지점을 PNG로 저장 (디자인을 눈으로 확인할 때)
  - `node tools/api-test.mjs` — 서버 함수 점검 (1초). `lib/server.mjs`를 그대로 돌리고 Supabase·토스·OpenRouter만 가짜로 바꿔 결제·해지·갱신·AI 규칙을 확인. `api/`·`lib/`를 고치면 반드시 실행
  - 버그를 고칠 때는 **먼저 그 버그를 재현하는 시나리오를 `tools/smoke.mjs`에 추가**하고 고친다. 새 기능도 시나리오를 함께 추가
- **배포**: `main` 브랜치 push → Vercel 자동 배포. 별도 빌드 스텝 없음. 다른 브랜치를 push하면 Vercel이 미리보기 주소를 만들어 주므로, 큰 변경은 브랜치 → 미리보기에서 `--url=`로 점검 → main 병합 순서를 권장. 웹에 공개하지 않을 파일은 `.vercelignore`
- **캐시 무효화**: Service Worker 캐시를 갱신하려면 `sw.js`의 `CACHE` 상수(현재 `'god-app-v28'`) 버전 문자열을 올려야 함. 사용자 화면에 보이는 버전은 `js/core.js`의 `APP_VERSION` (CHANGELOG 최신 항목과 맞출 것)

## 아키텍처 (Architecture)
`index.html`에는 마크업과 스크립트 목록만 있음. 코드 안의 `═══...═══` 배너 주석이 섹션 구분자.

| 파일 | 내용 |
|---|---|
| `css/app.css` | 전체 스타일. 끝부분에 v2.7 블록 |
| `js/data.js` | 말씀·묵상·응원 콘텐츠 (`VERSE_POOL`/`REFLECTIONS`/`ENCS` + `_EN`), 감정·주제·필요 라벨 함수 |
| `js/core.js` | 전역 상태(`sel` 등), 오류 격리(`safe`/`later`/`logErr`), 저장소(`lsGet`·`getMoods` 등), 날짜 도구, `escHtml`. **화면(DOM)을 건드리지 않음** |
| `js/i18n.js` | `LANG_DATA`(ko/en/ja), `applyLang()` |
| `js/effects.js` | 화면 연출 (별·별똥별·꽃잎·리플·타이핑·오프닝) |
| `js/audio.js` | 효과음, 배경 찬송가 |
| `js/pwa.js` | 홈 화면 설치 안내, Service Worker 등록·업데이트 |
| `js/auth.js` | Supabase 로그인, 기기↔클라우드 기록 맞추기(`syncWithServer`) |
| `js/flow.js` | 이름, 글자 크기, 스트릭, 절기, 스텝 전환, 결과 생성, 말씀 선택, 복사·공유·저장, 감사 일기, 연속 감정 인식 |
| `js/vault.js` | 보관함, 주간 감정 차트 |
| `js/ui.js` | 설정, 언어·테마, 내보내기·초기화, 오버레이, 토스트, 다시 시작, 마무리(클로징) |
| `js/premium.js` | `isPremium()`, 구독 확인(`refreshEntitlement`), `onPremiumChanged()`, 프리미엄 안내 모달 |
| `js/billing.js` | 구독 결제(토스 결제창 호출·돌아온 뒤 마무리)·해지·설정의 구독 줄·유료 약관 조항. `PAYMENTS.on`이 꺼져 있으면 아무것도 보이지 않음 |
| `js/aireport.js` | AI 돌아보기 버튼·별도 동의·결과 표시. `AI_REPORT.on`이 꺼져 있으면 보이지 않음 |
| `api/*.mjs` | 서버 함수 진입점 (Vercel이 `/api/이름` 주소로 실행). 내용은 전부 `lib/server.mjs` |
| `lib/server.mjs` | 서버 공용 코드: 로그인 토큰 확인, 토스 결제·해지·갱신, AI 호출. **비밀 키는 환경 변수에서만** (파일 맨 위에 목록) |
| `js/dashboard.js` | 나의 이야기 — 이번 주 (서사 카드·감정 막대·요일 흐름·패턴·일기). 무료, 기기 기록만 |
| `js/history.js` | 기록 달력, 월간·연간 리포트, PDF 일기장. **무료/프리미엄 경계가 여기 모여 있음**. 기록 읽기는 `loadYear()` 하나 (프리미엄+로그인이면 클라우드) |
| `js/demo.js` | **시연·개발자 전용**: 개발자 모드, 프리미엄 체험 비밀번호, 체험 페르소나, 데모 데이터 |
| `js/sheep.js` | 양 배회 |
| `js/care.js` | 처리방침·동의, 계정 삭제, 회고 카드, 돌봄 안내, 접근성 |
| `js/boot.js` | 앱 시작 순서 (`init()`, 맨 마지막에 불러옴) |
| `tools/` | 점검 스크립트 (배포 제외) |
| `docs/supabase_schema.sql` | DB 전체 스키마 (새 프로젝트를 이 파일로 다시 만들 수 있음) |
| `docs/archive/` | 지금 화면에 쓰지 않는 콘텐츠 원고 (기도문·한 문장) |

- **안전장치**: `index.html`의 스크립트 목록 바로 위 인라인 스크립트가 파일 로딩 실패를 감지해 "다시 불러오기" 안내를 띄움
- **Service Worker** (`sw.js`): 우리 사이트의 GET 요청만 다룸. `index.html`·`css/`·`js/`는 네트워크 우선(실패 시 캐시), 나머지는 캐시 우선. 새 버전은 "지금 업데이트"를 눌렀을 때만 교체·새로고침
- **콘텐츠 풀**: 감정(6)×필요(4) 또는 감정(6)×주제(5) 조합 키(`감정_필요`)로 매핑. 한국어/영어가 별도 상수이고 **구절 수가 서로 달라도 됨**(언어별로 따로 고름). 콘텐츠를 추가하면 양쪽 다 수정. 일본어 화면은 UI만 일본어이고 말씀·묵상은 한국어가 나옴 (일본어 콘텐츠 없음)
- **상태**: 전역 `sel = {emotion, topic, need}`가 현재 플로우 선택값
- **스트릭**: `updateStreak()`, `calcStreak()` — 방문일(`visitDates`) 기반. 기기에는 감정 기록·방문일을 최근 62일(`LOCAL_KEEP_DAYS`)만 둠
- **게스트 vs 로그인 사용자**: 비로그인 시 전 데이터가 `localStorage`에만 저장. 로그인하면 `syncWithServer()`가 기기에만 있는 기록은 올리고 클라우드에만 있는 기록은 내려받아 합침 (같은 날짜·감정·주제·필요 = 같은 기록). 기기 기록의 주인은 `dataOwner`에 남기며, 다른 계정이 로그인하면 올리지 않고 그 계정 기록으로 바꿈. 두 경로 모두 유지·테스트 필요
- **프리미엄**: 서버 `subscriptions` 행이 기준 (`active`, 또는 `canceled`인데 `current_period_end`가 남음). 그 행은 결제 웹훅만 씀
- **무료/프리미엄 경계** (안내 모달 `pm_f1~5`에는 실제로 구현된 것만 적는다): 무료 = 묵상 플로우·보관함·나의 이야기(이번 주)·달력(이번 달·지난달)·한 달 전 회고. 프리미엄 = 모든 달의 달력·월간/연간 리포트·PDF 일기장·3개월 이상 지난 회고·테마 4종. 로그인한 무료 사용자의 오래된 기록은 서버에 그대로 있고 화면에서만 닫혀 있음 (구독하면 바로 열림)
- **문구를 코드 파일에 둘 때**: `DB_TEXT`(dashboard)·`HIST_TEXT`(history)·`V27_TEXT`(care)처럼 ko/en/ja를 함께 두고 `LANG_DATA`에 병합

## 에이전트 역할 정의 (4개)

### 1. 제품 전략 에이전트 (Product Strategy)
**언제 쓰나**: 기능 추가/삭제 결정, UX 방향 결정, 경쟁 앱 비교, 수익화 구조 논의 시
**역할**: 이 앱의 아이덴티티("감성·감정·쉼" 방향)와 타겟 사용자(독실한 크리스천, 30~50대 여성 중심)에 맞는지 검토. 로드맵 우선순위 조율.
**사용 방법**: `Agent(subagent_type: "fork")` — 컨텍스트 공유가 핵심

### 2. 구현 검증 에이전트 (Verify)
**언제 쓰나**: 코드 수정 후 실제 동작 확인이 필요할 때
**역할**: 배포된 앱(https://god-bless-you.vercel.app/)을 Chrome에서 열어 핵심 플로우(감정선택→결과화면→저장)가 정상 동작하는지 테스트. 모바일 뷰포트에서도 확인.
**사용 방법**: 먼저 `node tools/check.mjs` 와 `node tools/smoke.mjs` (로컬). 배포 후에는 `node tools/smoke.mjs --url=https://god-bless-you.vercel.app/`. 눈으로 봐야 하는 것(디자인·실제 Google 로그인)은 `claude-in-chrome` 도구로 확인

### 3. 목사님 에이전트 (Pastoral Review)
**언제 쓰나**: 새 말씀 추가, 묵상글·기도문 작성, 새 기능의 신앙적 적절성 검토 시
**역할**: 한국 개신교 목회자 관점에서 콘텐츠를 검토. 신학적 오류, 불적절한 표현, 기독교 문화와 맞지 않는 UX 방향 지적. 반대로 신앙적으로 강점이 되는 부분도 피드백.
**검토 기준**: ① 말씀 해석이 원문 맥락에 맞는가 ② 감정-말씀 매핑이 신앙적으로 자연스러운가 ③ 기도문 언어가 한국 개신교 예배 문화에 맞는가 ④ 비신자가 접해도 거부감 없는 수위인가
**사용 방법**: `/god` 스킬 (`.claude/skills/god/SKILL.md`) — "이요한 목사" 페르소나로 즉시 호출. 또는 `Agent(subagent_type: "fork")` 로 컨텍스트 공유 후 요청.
**교단 설정**: 한국 개신교 장로교 (한국기독교총연합회 인정 기준, 이단 제외). 말씀 해석은 개혁주의 신학 기반, 한국 장로교 예배 문화 기준으로 검토.

### 4. 코드 리뷰 에이전트 (Code Review)
**언제 쓰나**: 커밋 전, PR 생성 전, 큰 리팩터링 후 — `tools/`의 점검이 잡지 못하는 것(설계·보안·신앙적 맥락)을 보는 단계
**역할**: 변경분(diff)에서 버그, 보안 이슈(특히 Supabase 키·RLS 관련), 코드 구조 원칙·연쇄 고장 방지 규칙 위반 여부, 불필요한 리팩터링/중복 점검. 발견 사항은 심각도순 1줄 요약.
**사용 방법**:
- 로컬 작업 중인 diff → `/code-review` (레벨: low/medium/high/max/ultra), `--fix`로 바로 적용 가능
- GitHub PR → `/review`
- 간단한 1~2파일 diff만 빠르게 볼 땐 `caveman:cavecrew-reviewer` 서브에이전트로 위임 가능 (출력 압축, 컨텍스트 절약)

## 핵심 플로우 (테스트 기준)
1. 감정 선택 (6종) → 주제 선택 → 필요 선택 → 결과 화면
2. 결과: 말씀 + 오늘의 이야기(묵상) + 응원 + 감사 일기 → "오늘 묵상 마치기"(마무리 카드)
3. 말씀 보관함 저장/조회
4. Google 로그인 → 클라우드 동기화

## DB 테이블 (Supabase)
- `profiles` — 사용자 설정
- `visit_dates` — 스트릭
- `mood_history` — 감정 기록
- `saved_verses` — 저장 말씀

## v2.7 메모 (2026-11-16)
- **글꼴**: `--font-ui`(Pretendard) / `--font-verse`(나눔명조) 변수로 관리. 산돌 성경체는 유료이며 웹폰트 탑재는 산돌에 별도 문의가 필요해 쓰지 않음
- **글씨 크기**: 고정 px 대신 `--fs-2xs`~`--fs-2xl` 토큰 사용 (글자 크기 설정에 연동). 12px 미만 금지
- **이모지**: 버튼당 1개까지. 배경·장식 이모지와 달 이모지는 쓰지 않음 (달은 `.moon-shape`)
- **프리미엄**: `isPremium()` = 서버 `subscriptions` 조회 결과 또는 시연용 `DEMO_UNLOCK`. 실결제를 여는 날 `DEMO_UNLOCK = false`
- **Supabase 추가 SQL**: `docs/supabase_v2.7.sql` (계정 삭제 함수 `delete_my_account`, `subscriptions` 테이블). 실행 전에는 계정 삭제가 기록만 지우고, 프리미엄은 항상 무료로 판정
- **처리방침**: `OPERATOR`(운영자 정보)와 서버 위치가 빈칸 — 정식 출시 전 기재
- **앱 이름**: "밤의 목장"은 임시. 설문 반응이 좋지 않아 변경 가능 → 상표 출원은 확정 뒤
- v2.7 코드는 `js/care.js`와 `css/app.css` 끝의 v2.7 블록에 모여 있음

## 결제·AI를 켜는 순서 (2026-11-17 작성, 아직 꺼져 있음)
코드는 들어가 있고 `js/core.js`의 `PAYMENTS.on`·`AI_REPORT.on`이 false라 화면에 나타나지 않는다. 켜려면 순서대로:
1. Supabase 프로젝트를 살리고 `docs/supabase_schema.sql` 실행, `js/core.js`의 URL·키 교체
2. Vercel 환경 변수: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `TOSS_SECRET_KEY`, `CRON_SECRET`, `APP_ORIGIN` (+ AI: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`)
3. `PAYMENTS.clientKey`에 토스 **테스트** 클라이언트 키(`test_ck_…`, API 개별 연동 키)를 넣고 `on: true` → 브랜치 미리보기에서 실제 테스트 결제 (테스트 키는 돈이 나가지 않음)
4. 실제 확인이 필요한 것(가짜 서버로는 못 본 것): 토스 결제창이 뜨고 돌아오는지, 실패 주소의 `code` 값, 빌링키 발급·결제 응답 모양, Cron이 하루 한 번 `/api/billing-renew`를 부르는지, OpenRouter 응답
5. 토스 자동결제(빌링) 계약·심사 통과 후 라이브 키로 교체, `js/premium.js`의 `DEMO_UNLOCK = false`, `js/care.js`의 `OPERATOR` 기재
- 서버 규칙: 금액·대상은 서버가 정함(브라우저 값 무시), 갱신은 끝나기 24시간 안쪽에 결제, 3번 연속 실패하면 종료, 해지하면 빌링키 삭제(다시 구독하려면 카드 재등록)
- 환불은 자동화하지 않음 → 토스 상점관리자에서 취소한 뒤 Supabase `subscriptions` 행을 직접 고침
- 환불 조건 문구(`js/billing.js`의 `PAID_TERMS`: 7일 이내 미사용 시 전액)는 초안 — 운영자가 확정할 것
- AI 프롬프트(`lib/server.mjs`의 `AI_SYSTEM`)는 2026-11-17에 `/god` 목회 검토를 거침 (하나님의 음성으로 말하기·결과 약속·신앙 평가 금지를 추가). 지시문을 고치면 다시 검토
- Vercel 무료(Hobby) 요금제의 상업적 이용 가능 여부는 약관을 확인하지 못함 — 유료 판매 전에 확인. Hobby의 Cron은 하루 한 번·시각 부정확(±1시간)이라 그에 맞춰 설계해 둠

## v2.9 메모 (2026-11-17)
- 프리미엄 안내 문구와 실제 기능을 맞춤 (달력·월간/연간 리포트·PDF 구현, 시즌 챌린지·양 꾸미기는 문구에서 뺌 — 만들게 되면 그때 다시 넣기)
- `mood_history.verse_ref` 열 추가 → Supabase에서 `docs/supabase_schema.sql` 재실행 필요 (실행 전에도 기록 저장은 됨)
- 가격 문구에 "연 ₩19,000"이 있음 → 결제를 붙일 때 연간 요금제도 함께 만들거나 문구에서 뺄 것
- 달력의 프리미엄 제한은 화면에서만 막는 것 (자기 기록은 RLS상 본인이 읽을 수 있음 — 의도된 것). 결제 없이는 열 수 없어야 하는 것은 서버가 판정하는 `subscriptions` 뿐
- PDF는 `window.print()` — 아이폰 홈 화면 앱(standalone)에서 인쇄 창이 뜨는지 실기기 확인 필요
- (해결) 보관함 주간 차트도 로그인 없이 보임
- **화면을 바꾸면 눈으로 확인**: `node tools/smoke.mjs 둘러보기 --shots=폴더` → 주요 화면 12장 PNG. 2026-11-17 중간 점검에서 테스트는 통과하지만 화면에서만 보이는 문제(설치 안내가 버튼을 가림, 단어 중간 줄바꿈)를 이 방법으로 찾음
- 설치 안내(`install-nudge`)는 메인 화면에서만 뜨고 `go()`·`showOverlay()`가 내린다 — 화면 아래에 고정되는 요소를 새로 만들면 같은 규칙을 따를 것
- 저장소에 있지만 앱이 쓰지 않는 파일: `At the End of the Day.mp3`, `card_preview.html`, `docs/죄짐맡은우리구주_CC0.mp3` (배포에서만 제외해 둠 — 지울지는 사용자 결정)

## v2.8 메모 (2026-11-17)
- **Supabase 프로젝트(`pzakpaomnmahcugkzdff`) 주소가 DNS에 없음** — 장기 미사용으로 정지·삭제된 것으로 보임. 대시보드에서 복구하거나 새 프로젝트를 만들어 `docs/supabase_schema.sql` 실행 후 `js/core.js`의 URL·키 교체. 그 전까지 로그인·동기화·프리미엄 서버 확인이 동작하지 않음 (앱 자체는 게스트로 정상 동작)
- 기기↔클라우드 맞추기(`syncWithServer`)는 가짜 서버로만 검증됨 → Supabase 복구 후 실제 Google 로그인으로 확인 필요
- (v2.9에서 해결) 프리미엄 안내 문구와 실제 기능 불일치
- `js/demo.js`의 시연 비밀번호와 `DEMO_UNLOCK`은 브라우저 코드에 그대로 보임 — 실결제를 여는 날 `DEMO_UNLOCK = false`
- `docs/`의 기획서·발표자료 html은 지금 웹에 공개되어 있음 (`.vercelignore`에 넣으면 비공개)

## 다음 마일스톤 (v3.0)
감정 통계 대시보드 + Premium 플랜(₩1,900/월) 런칭
