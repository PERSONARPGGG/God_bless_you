# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 매 세션 자동으로 읽는 **핵심 규칙**입니다. 길어지면 토큰이 매번 낭비되므로 날짜별 작업 메모·켜는 순서 같은 것은 `docs/HISTORY.md`에 두고, 여기에는 계속 지켜야 할 규칙만 남깁니다.

# 밤의 목장 — Claude 작업 가이드

## 프로젝트 개요
크리스천 감정 묵상 PWA "밤의 목장" (부제: "오늘 밤, 주님이 누이시는 곳", 구명: "오늘은 어땠나요?" — 이 질문은 메인 화면 인사말로 유지). `index.html`(마크업) + `css/` 3개 + `js/` 24개 + 서버 함수(`api/`, `lib/`) + Supabase + Vercel.
배포: https://god-bless-you.vercel.app/

## 절대 규칙 (어기지 말 것)
- **성경 본문은 절대 고치지 않는다.** 한국어는 개역한글 그대로, 사용자는 "본문을 내 마음대로 바꾸거나 왜곡하지 않는 조건"으로 이 데이터를 쓴다. 문구 순화·표현 수정은 **묵상글·응원글·화면 문구에만** 한다. 새 본문은 기억으로 쓰지 말고 기존 구절을 재사용한다. 구절 일부만 발췌할 때도 글자는 원문 그대로 (`js/data-verses.js`)
- **서버에 바로 올리지 않는다**: 아래 "작업 방식·배포 흐름" 참조
- 비밀 키는 브라우저 코드에 넣지 않는다 (Supabase anon key는 가능, service_role key는 절대 금지)

## 코드 구조 원칙
- **파일 구조**: 마크업 `index.html`, 스타일 `css/`, 스크립트 `js/` 아래 주제별 파일. 새 기능은 맞는 파일에 넣고, 파일을 새로 만들면 `index.html`의 `<script>`/`<link>` 목록과 `sw.js`의 `ASSETS`에 함께 추가 (빠뜨리면 `tools/check.mjs`가 오류로 잡음)
- 스크립트는 ES 모듈이 아닌 **일반 스크립트** (HTML의 `onclick="..."`이 전역 함수를 부르기 때문). 불러오는 순서: data → data-verses → data-text → core → i18n → effects → audio → pwa → auth → home → flow → share → diary → vault → ui → premium → billing → dashboard → history → aireport → demo → sheep → care → boot. 파일을 불러오는 즉시 실행되는 코드는 앞 파일의 것만 쓸 수 있음 (함수 안에서 부르는 건 상관없음)
- Vanilla JS 전용 — 프레임워크·번들러 도입 금지 (`tools/`는 앱에 실리지 않는 개발용, 설치할 의존성 없음)
- **파일이 길어지면 쪼갠다**: 코드 800줄·스타일 1200줄을 넘으면 `check.mjs`가 경고한다 (콘텐츠 `data-*.js` 제외). 주제별로 나눠 목록에 등록
- **함수에는 한 줄 주석**: 새 함수는 위에 `/* 무엇을 하는가 */` 한 줄 (핵심만). 파일 맨 위 주석은 파일의 역할·주의점
- **코드를 읽기 전에 지도부터**: `node tools/map.mjs`(파일 목록), `node tools/map.mjs flow`(그 파일의 구역·함수와 줄 번호), `node tools/map.mjs 함수이름`(정의·사용처). 큰 파일을 통째로 읽지 말고 위치를 찾은 뒤 필요한 줄만 읽는다

### 연쇄 고장을 막는 규칙
- **여러 일을 차례로 하는 곳은 단계마다 `safe('이름', () => …)`** (`js/core.js`). 앱 시작(`boot.js`), 결과 화면(`buildResult`), 마무리(`triggerClosing`), 언어 적용(`applyLang`), 프리미엄 변경(`onPremiumChanged`)이 그렇게 되어 있다. 나중에 실행되는 연출은 `later()`
- **저장소는 모양을 믿지 않는다**: 기록은 `getMoods()`/`getSaved()`/`getVisits()`, 배열은 `lsArr()`, 숫자 설정은 `lsInt()`로 읽는다. `lsGet('moodHistory') || []` 같은 직접 읽기 금지
- **날짜는 현지 기준**: `todayStr()`·`ymd(d)`·`parseYmd(s)`·`addDays()`·`monthsAgo()`. `toISOString().slice(0,10)`과 `new Date('YYYY-MM-DD')`는 금지 (한국 새벽에 하루가 밀림)
- **프리미엄 여부는 `isPremium()`만** 묻고, 상태가 바뀌면 `onPremiumChanged()` 한 곳에서 화면을 맞춘다
- 사용자 글(일기·이름)이나 서버에서 온 값을 `innerHTML`에 넣을 때는 `escHtml()`
- 서버 요청은 `.then()`으로 버리지 말고 실패를 `logErr()`에 남긴다. 잡힌 오류는 기기에 30건 남고 콘솔에서 `errLog()`로 본다

## 명령어 (Commands)
빌드 시스템·패키지 매니저 없음 (순수 정적 파일). 점검 도구는 Node(22+)만 있으면 돈다.

- **로컬 실행**: 프로젝트 폴더에서 `python -m http.server 5500 --bind 127.0.0.1` → `http://127.0.0.1:5500` (F12의 기기 모양 아이콘으로 모바일 화면). `file://`로 열면 Supabase·Service Worker 코드가 자동 비활성화됨. 별도 진행판·문서 만들지 말고 앱 자체로 확인
- **검증 (수정할 때마다, 커밋 전에)**:
  - `node tools/check.mjs` — 정적 점검 (1초). 문법, 파일 목록 일치, 이름 충돌, 죽은 코드, 3개 언어 문구 누락, 콘텐츠 빈 조합, 금지 패턴, 파일 길이. `--deps`로 파일 간 의존 관계와 localStorage 키
  - `node tools/smoke.mjs` — 실행 점검 (약 1분). Chrome/Edge를 화면 없이 띄워 시나리오를 실제로 눌러 봄. 이름 일부를 주면 그 시나리오만 (`node tools/smoke.mjs 날짜`), `--url=https://…`로 배포본, `--shots=폴더`로 `p.shot('이름')` 지점을 PNG 저장 (`둘러보기`는 주요 화면 12장)
  - `node tools/api-test.mjs` — 서버 함수 점검 (1초). Supabase·토스·OpenRouter를 가짜로 바꿔 결제·해지·갱신·AI 규칙 확인. `api/`·`lib/`를 고치면 반드시 실행
  - `node tools/supabase-check.mjs` — Supabase 연결·테이블·RLS 점검 (복구·교체 후)
  - 버그를 고칠 때는 **먼저 그 버그를 재현하는 시나리오를 `tools/smoke.mjs`에 추가**하고 고친다. 새 기능도 시나리오를 함께 추가
- **배포**: `main` push → Vercel 자동 배포 (빌드 없음). 다른 브랜치는 미리보기 주소가 생김. 웹에 공개하지 않을 파일은 `.vercelignore`
- **캐시 무효화**: 파일을 바꿔 배포할 때 `sw.js`의 `CACHE`(현재 `'god-app-v31'`) 버전 문자열을 올린다. 사용자에게 보이는 버전은 `js/core.js`의 `APP_VERSION`(CHANGELOG 최신 항목과 맞출 것)

## 아키텍처 (Architecture)
`index.html`에는 마크업과 스크립트 목록만 있음. 코드 안의 `═══...═══` 배너 주석이 섹션 구분자. 자세한 위치는 `node tools/map.mjs`.

| 파일 | 내용 |
|---|---|
| `css/app.css` → `fx.css` → `features.css` | 기본 화면 → 감성 연출·애니메이션 → 나중에 붙은 기능(PDF·v2.7·달력). **이 순서로 불러오며 순서를 바꾸면 덮어쓰기가 달라짐** |
| `js/data.js` | 감정·주제·필요 라벨 함수 (`eLabel`/`tLabel`/`nLabel`) |
| `js/data-verses.js` | 성경 말씀 풀 `VERSE_POOL`/`VERSE_POOL_EN` (키=감정_필요). **본문 수정 금지** |
| `js/data-text.js` | 묵상글 `REFLECTIONS`(키=감정_주제)·응원글 `ENCS`(키=감정_필요), 한/영 |
| `js/core.js` | 전역 상태(`sel` 등), 오류 격리(`safe`/`later`/`logErr`), 저장소, 날짜 도구, `escHtml`. **화면(DOM)을 건드리지 않음** |
| `js/i18n.js` | `LANG_DATA`(ko/en/ja), `applyLang()` |
| `js/effects.js` / `audio.js` / `pwa.js` | 화면 연출 / 효과음·찬송가 / 홈 화면 설치·Service Worker |
| `js/auth.js` | Supabase 로그인, 기기↔클라우드 기록 맞추기(`syncWithServer`) |
| `js/home.js` | 홈: 이름·인사말·날짜·글자 크기·스트릭·절기·히어로 묵상·연속 감정 인식 |
| `js/flow.js` | 묵상 흐름: 단계 전환·질문·이어하기·결과 생성(`buildResult`)·말씀 고르기(`getVerseForMood`)·다른 말씀(`nextVerse`)·기록 저장 |
| `js/share.js` / `diary.js` | 복사·공유·말씀 카드·즐겨찾기 / 오늘의 한 줄 일기 |
| `js/vault.js` | 보관함, 주간 감정 차트 |
| `js/ui.js` | 설정, 언어·테마, 내보내기·초기화, 오버레이, 토스트, 마무리(클로징) |
| `js/premium.js` / `billing.js` | `isPremium()`·구독 확인·안내 모달 / 토스 결제·해지·유료 약관 (`PAYMENTS.on` 꺼져 있으면 안 보임) |
| `js/aireport.js` | AI 돌아보기 (`AI_REPORT.on` 꺼져 있으면 안 보임) |
| `js/dashboard.js` | 나의 이야기 — 이번 주 (무료, 기기 기록만) |
| `js/history.js` | 기록 달력, 월간·연간 리포트, PDF 일기장. **무료/프리미엄 경계가 여기 모여 있음**. 기록 읽기는 `loadYear()` 하나 |
| `js/demo.js` | **시연·개발자 전용**: 개발자 모드, 프리미엄 체험, 페르소나, 데모 데이터 |
| `js/sheep.js` / `care.js` / `boot.js` | 양 배회 / 처리방침·동의·계정 삭제·회고 카드·돌봄 안내·접근성 / 앱 시작 순서(`init()`, 맨 마지막) |
| `api/*.mjs`, `lib/server.mjs` | 서버 함수 진입점 / 공용 코드(토큰 확인·토스·AI, 비밀 키는 환경 변수에서만) |
| `tools/` | 점검·지도 스크립트 (배포 제외) |
| `docs/` | `supabase_schema.sql`(DB 전체 스키마), `HISTORY.md`(작업 이력·켜는 순서), `archive/`(안 쓰는 콘텐츠) |

- **안전장치**: `index.html` 스크립트 목록 위 인라인 스크립트가 파일 로딩 실패를 감지해 "다시 불러오기" 안내를 띄움
- **Service Worker** (`sw.js`): 우리 사이트 GET만 다룸. `index.html`·`css/`·`js/`는 네트워크 우선(실패 시 캐시), 나머지는 캐시 우선. 새 버전은 "지금 업데이트"를 눌렀을 때만 교체
- **콘텐츠 풀**: 말씀은 감정(6)×필요(4), 묵상은 감정(6)×주제(5), 응원은 감정×필요. 한국어/영어 별도 상수이고 구절 수가 달라도 됨. 일본어는 UI만(말씀·묵상은 한국어). 콘텐츠를 추가하면 양쪽 다 수정
- **영어·일본어 임시 잠금**: `js/core.js`의 `ENABLED_LANGS = ['ko']` (말씀 번역본 이용 조건 확인 전까지). 데이터는 지우지 않았고 점검 시나리오는 `OPEN_LANGS`로 열어서 계속 봄
- **상태**: 전역 `sel = {emotion, topic, need}`가 현재 플로우 선택값
- **기록 보관**: 기기에는 감정 기록·방문일을 최근 62일(`LOCAL_KEEP_DAYS`), **일기를 쓴 기록은 1년**(`DIARY_KEEP_DAYS`) 둠. 로그인하면 클라우드에도 저장
- **게스트 vs 로그인**: 비로그인은 `localStorage`만. 로그인하면 `syncWithServer()`가 기기에만 있는 기록은 올리고 클라우드에만 있는 기록은 내려받아 합침 (같은 날짜·감정·주제·필요 = 같은 기록, 합치기 전에 확인창). 기기 기록의 주인은 `dataOwner`. 두 경로 모두 유지·테스트 필요
- **프리미엄**: 서버 `subscriptions` 행이 기준 (`active`, 또는 `canceled`인데 `current_period_end`가 남음). 그 행은 결제 웹훅만 씀
- **무료/프리미엄 경계** (안내 모달 `pm_f1~5`에는 실제 구현된 것만): 무료 = 묵상 플로우·보관함·나의 이야기(이번 주)·달력(이번 달·지난달)·한 달 전 회고. 프리미엄 = 모든 달의 달력·월간/연간 리포트·PDF 일기장·3개월 이상 지난 회고·테마 4종
- **문구를 코드 파일에 둘 때**: `DB_TEXT`(dashboard)·`HIST_TEXT`(history)·`V27_TEXT`(care)처럼 ko/en/ja를 함께 두고 `LANG_DATA`에 병합
- **디자인 규칙**: 글꼴은 `--font-ui`/`--font-verse` 변수, 글씨 크기는 `--fs-2xs`~`--fs-2xl` 토큰(12px 미만 금지), 이모지는 버튼당 1개까지(달 이모지 금지, 달은 `.moon-shape`). 감정 화면은 스크롤 없이 한 화면(감정 칸 위에 높이를 차지하는 요소를 넣지 말 것). 화면 아래 고정 요소는 `go()`·`showOverlay()`가 내리는 규칙을 따름. 화면을 바꾸면 `node tools/smoke.mjs 둘러보기 --shots=폴더`로 눈으로 확인
- **저작권**: 말씀은 개역한글(보호기간 소멸) 그대로. 개역개정 표현을 새로 넣지 말 것. 배경 찬송가 10곡(`audio/tracks/`)은 유료 버전에서 별도 음원으로 교체 예정(결제를 켜기 전)

## 에이전트 (필요할 때만)
- **목사님 검토**: `/god` 스킬 (이요한 목사, 한국 장로교·개혁주의). 새 말씀·묵상·기도문·신앙 관련 UX 문구를 바꿀 때. 검토 기준: 말씀 맥락 / 감정-말씀 매핑 / 장로교 예배 어투 / 비신자 거부감 / 상업 결정이 진정성을 해치지 않는가
- **코드 리뷰**: 커밋·PR 전 `/code-review`, PR은 `/review`. `tools/`가 못 잡는 설계·보안·신앙 맥락
- **구현 검증**: 먼저 `check`+`smoke`(로컬), 배포 후 `smoke --url=…`. 실제 Google 로그인·디자인은 `claude-in-chrome`으로
- **제품 전략**: 이 앱의 정체성("감성·감정·쉼", 타겟 30~50대 독실한 크리스천 여성)에 맞는지 볼 때 `Agent(subagent_type: "fork")`
- 서브에이전트는 사용자가 이름을 대거나 요청할 때만

## 핵심 플로우 (테스트 기준)
1. 감정 선택(6종) → 주제 → 필요 → 결과 화면 (질문은 건너뛰기 가능)
2. 결과: 말씀 + 오늘의 이야기(묵상) + 응원 + 오늘의 한 줄 일기 → "오늘 묵상 마치기"(마무리 카드). "다른 말씀"으로 같은 마음의 다른 구절
3. 말씀 보관함 저장/조회
4. Google 로그인 → 클라우드 동기화

DB 테이블(Supabase): `profiles`(설정) · `visit_dates`(스트릭) · `mood_history`(감정 기록·일기·말씀 출처) · `saved_verses`(저장 말씀) · `subscriptions`(구독, 웹훅만 씀)

## 작업 방식 · 토큰 절약 · 배포 흐름 (사용자 지시)
**토큰을 쓸데없이 쓰지 않는다.**
- 부가 산출물(진행판·아티팩트·문서·보고서 파일)을 **만들지 않는다.** 사용자가 요청할 때만
- 파일은 전체를 읽지 말고 `tools/map.mjs`나 `Grep`으로 위치를 찾은 뒤 필요한 범위만 읽는다. 고친 뒤 다시 읽어 확인하지 않는다
- 점검은 **먼저 좁게**: `node tools/smoke.mjs 이름일부` → 끝날 즈음 **전체 한 번**. 출력은 `| grep -E "✗|✓ 실행"`처럼 실패와 요약만. 같은 상태에서 전체 점검을 두 번 돌리지 않는다
- 스크린샷은 레이아웃을 바꿨을 때만, 필요한 한두 장
- 같은 단계의 변경은 모아서 한 번에 고치고, 점검하고, **단계당 커밋 1개**
- 결정이 꼭 필요한 것만 짧게 묻는다. 권장안이 있는 제안은 묻지 않고 적용하고 결과에 적는다. 보고는 짧게(바뀐 것·점검 결과·사용자가 할 일)
- 사용자가 거절한 도구 호출을 같은 모양으로 다시 시도하지 않는다
- 사용자가 "고객 입장에서 보고 합리적인 선에서 바로 적용"을 허락한 범위(오류·버그·UX 개선)는 묻지 않고 고친다. 단 성경 본문·결제·개인정보·삭제 같은 되돌리기 어려운 것은 예외

**배포 흐름**
1. 로컬에서 고치고 `check` + `smoke` 통과 (`api/`·`lib/`를 건드렸으면 `api-test`도)
2. 사용자가 로컬 서버에서 보고 OK 하거나, **사용자가 "점검 후 판단해 병합"하라고 맡긴 경우** 점검이 모두 통과하고 고려할 문제가 없을 때만 커밋·병합. 조금이라도 고려할 것이 있으면 사용자에게 묻는다
3. 작업 브랜치(`v2.8`)에 푸시 → Vercel 미리보기에서 `smoke --url=…`
4. 운영은 **`main` 기준**. 운영 반영은 `main` 병합·푸시할 때만

## 아직 꺼져 있는 것 · 출시 전 해야 할 일
- 결제(`PAYMENTS.on`)·AI(`AI_REPORT.on`)는 코드만 있고 꺼져 있음. 켜는 순서·서버 규칙은 `docs/HISTORY.md`
- **Supabase 프로젝트 주소가 DNS에서 사라진 상태** (무료 플랜 자동 정지로 추정). 사용자가 출시 직전에 복구·재연결하기로 함 → 그때 `docs/HISTORY.md`의 복구 절차, `docs/supabase_schema.sql`·`supabase_v2.7.sql` 실행, `js/core.js` URL·키 교체, `node tools/supabase-check.mjs`, 실제 Google 로그인으로 동기화 검증. 그전까지 앱은 게스트로 정상 동작
- 출시 전: `js/care.js`의 `OPERATOR`(운영자 정보)·서버 위치 기재, `js/premium.js`의 `DEMO_UNLOCK = false`, CSP를 Report-Only에서 enforcing으로, 환불 조건 문구(`PAID_TERMS`) 확정, Vercel Hobby 요금제의 상업 이용 약관 확인, Supabase Pro 전환
- 다음 마일스톤: v3.0 감정 통계 대시보드 + Premium(₩1,900/월). 단계 로드맵: 4단계(주제 확장·외로움 감정·시편 23편 카드) → 6단계(타이머 마지막 30초·표현·아론의 축복) → 7단계(출시 준비)
