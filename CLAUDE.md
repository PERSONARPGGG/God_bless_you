# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 오늘은 어땠나요? — Claude 작업 가이드

## 프로젝트 개요
크리스천 감정 묵상 PWA. 단일 파일(`index.html`, ~5,800줄) + Supabase + Vercel.
배포: https://god-bless-you.vercel.app/

## 코드 구조 원칙
- **절대 새 파일 금지**: 모든 기능은 index.html 한 파일 안에 구현 (사용자 강한 선호)
- Vanilla JS 전용 — 프레임워크·번들러 도입 금지
- Supabase anon key는 코드에 직접 기재 가능 (RLS로 보호됨, service_role key는 절대 금지)

## 명령어 (Commands)
빌드 시스템·패키지 매니저·테스트 러너 없음 (순수 정적 파일).

- **로컬 실행**: `index.html`을 브라우저로 직접 열거나, PWA/Service Worker 테스트가 필요하면 로컬 서버 사용 (`npx serve` 등). `file://`로 열면 Supabase·Service Worker 관련 코드가 자동으로 비활성화되도록 방어 코드 있음 (`location.protocol === 'file:'` 체크, index.html:4185 등).
- **배포**: `main` 브랜치 push → Vercel 자동 배포. 별도 빌드 스텝 없음.
- **검증**: 자동화된 테스트 없음. 수정 후 반드시 `/verify` 스킬로 실제 배포 페이지에서 핵심 플로우 동작 확인 (아래 "에이전트 역할" 참고).
- **캐시 무효화**: Service Worker 캐시를 갱신하려면 `sw.js`의 `CACHE` 상수(`'god-app-v6'`) 버전 문자열을 올려야 함.

## 아키텍처 (Architecture)
`index.html` 한 파일에 `<style>` → `<body>` 마크업 → 단일 `<script>` 순서로 전부 들어있음.

- **`<style>`** (약 16~1195행): 전역 CSS.
- **HTML 마크업** (약 1198~1815행): `#step1`~`#step4` (감정→주제→필요→결과 4단계 플로우), 보관함/설정/대시보드 오버레이.
- **메인 `<script>`** (약 1815~5768행): 아래 순서로 큰 블록이 이어짐. 코드 내 `═══...═══` 형태 배너 주석이 섹션 구분자 역할을 하므로 탐색 시 grep 기준으로 활용.
  - **콘텐츠 풀**: `SENTENCES*`, `VERSE_POOL`/`VERSE_POOL_EN`, `REFLECTIONS`/`REFLECTIONS_EN`, `ENCS`/`ENCS_EN`, `PRAYERS`/`PRAYERS_EN` — 감정(6)×필요(4) 조합 키(`emotion_need`)로 콘텐츠 매핑. 한국어/영어가 별도 상수로 분리되어 있어 콘텐츠 추가 시 항상 양쪽 다 수정 필요.
  - **`LANG_DATA`**: ko/en/ja 다국어 UI 텍스트 전체를 담는 단일 객체. `applyLang(lang)`이 이 객체 기준으로 DOM 텍스트를 일괄 교체.
  - **PWA 설치/업데이트**: `deferredInstall`, `doInstall`, Service Worker 등록·업데이트 배너 로직 (`sw.js`와 연동, `postMessage('SKIP_WAITING')`로 즉시 갱신).
  - **Supabase 연동**: `SUPABASE_URL`/`SUPABASE_KEY` 상수, `initSupabase()`, `loginWithGoogle()`/`sbLogout()`, `migrateLocalToServer()` (로컬 게스트 데이터를 로그인 시 서버로 1회 이관).
  - **상태**: 전역 `sel = {emotion, topic, need}`가 현재 플로우 선택값을 담음. `lsGet`/`lsSet`이 `localStorage` 읽기/쓰기 헬퍼 (JSON 자동 직렬화).
  - **스트릭/체크인**: `updateStreak()`, `calcStreak()` — 방문일(`visitDates`) 기반 연속 출석 계산, 60일 지난 기록은 자동 정리.
  - **테마/계절**: `checkSeason()` — 크리스마스/설/부활절/추석 기간에 UI 테마 자동 전환.
- **`sw.js`**: 네트워크 우선 전략(HTML)과 캐시 우선 전략(정적 에셋)을 분리 적용하는 Service Worker. 오프라인 폴백 담당.
- **게스트 vs 로그인 사용자**: 비로그인 시 전 데이터가 `localStorage`에만 저장되고, Google 로그인 시 `migrateLocalToServer()`로 Supabase 테이블에 병합 이관됨 — 두 경로 모두 유지·테스트 필요.

## 에이전트 역할 정의 (4개)

### 1. 제품 전략 에이전트 (Product Strategy)
**언제 쓰나**: 기능 추가/삭제 결정, UX 방향 결정, 경쟁 앱 비교, 수익화 구조 논의 시
**역할**: 이 앱의 아이덴티티("감성·감정·쉼" 방향)와 타겟 사용자(독실한 크리스천, 30~50대 여성 중심)에 맞는지 검토. 로드맵 우선순위 조율.
**사용 방법**: `Agent(subagent_type: "fork")` — 컨텍스트 공유가 핵심

### 2. 구현 검증 에이전트 (Verify)
**언제 쓰나**: index.html 수정 후 실제 동작 확인이 필요할 때
**역할**: 배포된 앱(https://god-bless-you.vercel.app/)을 Chrome에서 열어 핵심 플로우(감정선택→결과화면→저장)가 정상 동작하는지 테스트. 모바일 뷰포트에서도 확인.
**사용 방법**: `/verify` 스킬 또는 `claude-in-chrome` 도구 직접 사용

### 3. 목사님 에이전트 (Pastoral Review)
**언제 쓰나**: 새 말씀 추가, 묵상글·기도문 작성, 새 기능의 신앙적 적절성 검토 시
**역할**: 한국 개신교 목회자 관점에서 콘텐츠를 검토. 신학적 오류, 불적절한 표현, 기독교 문화와 맞지 않는 UX 방향 지적. 반대로 신앙적으로 강점이 되는 부분도 피드백.
**검토 기준**: ① 말씀 해석이 원문 맥락에 맞는가 ② 감정-말씀 매핑이 신앙적으로 자연스러운가 ③ 기도문 언어가 한국 개신교 예배 문화에 맞는가 ④ 비신자가 접해도 거부감 없는 수위인가
**사용 방법**: `/god` 스킬 (`.claude/skills/god/SKILL.md`) — "이요한 목사" 페르소나로 즉시 호출. 또는 `Agent(subagent_type: "fork")` 로 컨텍스트 공유 후 요청.
**교단 설정**: 한국 개신교 장로교 (한국기독교총연합회 인정 기준, 이단 제외). 말씀 해석은 개혁주의 신학 기반, 한국 장로교 예배 문화 기준으로 검토.

### 4. 코드 리뷰 에이전트 (Code Review)
**언제 쓰나**: index.html 수정 커밋 전, PR 생성 전, 큰 리팩터링 후 — 정식 테스트 스위트가 없는 프로젝트라 리뷰가 사실상 유일한 회귀 방지선
**역할**: 변경분(diff)에서 버그, 보안 이슈(특히 Supabase 키·RLS 관련), 코드 구조 원칙 위반("새 파일 금지", "vanilla JS 전용") 위반 여부, 불필요한 리팩터링/중복 점검. 발견 사항은 심각도순 1줄 요약.
**사용 방법**:
- 로컬 작업 중인 diff → `/code-review` (레벨: low/medium/high/max/ultra), `--fix`로 바로 적용 가능
- GitHub PR → `/review`
- 간단한 1~2파일 diff만 빠르게 볼 땐 `caveman:cavecrew-reviewer` 서브에이전트로 위임 가능 (출력 압축, 컨텍스트 절약)

## 핵심 플로우 (테스트 기준)
1. 감정 선택 (6종) → 주제 선택 → 필요 선택 → 결과 화면
2. 결과: 말씀 + 묵상 + 기도 + 한 문장 + 감사 일기
3. 말씀 보관함 저장/조회
4. Google 로그인 → 클라우드 동기화

## DB 테이블 (Supabase)
- `profiles` — 사용자 설정
- `visit_dates` — 스트릭
- `mood_history` — 감정 기록
- `saved_verses` — 저장 말씀

## 다음 마일스톤 (v3.0)
감정 통계 대시보드 + Premium 플랜(₩1,900/월) 런칭
