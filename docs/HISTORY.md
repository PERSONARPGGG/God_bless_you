# 밤의 목장 — 작업 이력·운영 메모 (HISTORY)

이 파일은 CLAUDE.md에서 덜어 낸 **날짜별 작업 메모와 켜는 순서**입니다. 매 세션 자동으로 읽히지 않으므로(토큰 절약), 해당 주제를 다룰 때만 찾아 읽으세요. 결제·AI를 켜기 전, Supabase를 복구할 때가 그때입니다.

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
- 저장소에 있지만 앱이 쓰지 않는 파일: `card_preview.html` (배포에서만 제외해 둠 — 지울지는 사용자 결정)

## v2.8 메모 (2026-11-17)
- **Supabase 프로젝트(`pzakpaomnmahcugkzdff`) 주소가 DNS에 없음** — 장기 미사용으로 정지·삭제된 것으로 보임. 대시보드에서 복구하거나 새 프로젝트를 만들어 `docs/supabase_schema.sql` 실행 후 `js/core.js`의 URL·키 교체. 그 전까지 로그인·동기화·프리미엄 서버 확인이 동작하지 않음 (앱 자체는 게스트로 정상 동작)
- 기기↔클라우드 맞추기(`syncWithServer`)는 가짜 서버로만 검증됨 → Supabase 복구 후 실제 Google 로그인으로 확인 필요
- (v2.9에서 해결) 프리미엄 안내 문구와 실제 기능 불일치
- `js/demo.js`의 시연 비밀번호와 `DEMO_UNLOCK`은 브라우저 코드에 그대로 보임 — 실결제를 여는 날 `DEMO_UNLOCK = false`
- `docs/`의 기획서·발표자료 html은 지금 웹에 공개되어 있음 (`.vercelignore`에 넣으면 비공개)

## v3.0 메모 (2026-11-18)
- **로컬에서 바로 보기**: 프로젝트 폴더에서 `python -m http.server 5500` → `http://127.0.0.1:5500` (브라우저 F12의 기기 모양 아이콘으로 모바일 화면). 별도 진행판·문서 만들지 말고 앱 자체로 확인한다
- **영어·일본어 임시 잠금**: `js/core.js`의 `ENABLED_LANGS = ['ko']`. 말씀 번역본 이용 조건을 확인하기 전까지 닫음. 데이터(`LANG_DATA` en·ja, `*_EN`)와 저장된 `appLang`은 지우지 않았고, 다시 열 때는 목록에 `'en','ja'`만 추가. 점검 시나리오는 `OPEN_LANGS`로 열어서 데이터가 망가지지 않았는지 계속 본다
- **감정 화면은 한 화면**: 감정 버튼 5개 + 기도 버튼(`.emotion-pray`)이 스크롤 없이 보여야 한다 (360~1920px, 글자 크기 3단계, 이어하기 바가 떠 있어도). `tools/smoke.mjs`의 '여러 기기에서 스크롤 없이 한 화면'이 잰다. 감정 칸 위에 높이를 차지하는 요소를 새로 넣지 말 것 (회고 카드는 버튼 아래)
- **출퇴근길 보완**: 이어하기(`resumeSel`, 45분·같은 날), 홈 화면 바로가기(`manifest.json shortcuts`, 주소 `?e=worry|tired|hurt|pray`, Android만), 탭 진동(직접 누른 경우만), 운전 안내(`#drive-note`). 사용자 선택을 담는 `resumeSel`은 설정 초기화·계정 삭제 때 함께 지운다
- 감정을 6개째로 늘리면(예정: 외로움) 격자가 짝수가 되어 마지막 칸이 혼자 한 줄 쓰는 지금 모양이 자연스럽게 풀린다

## Supabase 복구·안정화 (2026-11-18)
- 2026-11-18 현재 `pzakpaomnmahcugkzdff.supabase.co`가 DNS에서 사라져 있음(NXDOMAIN, 다른 도메인은 정상). 가장 유력한 원인: 무료 플랜의 **7일 저활동 자동 일시정지** 후 복원 기한 경과. 공식 문서는 복원 기한을 90일(변경 로그·문제 해결 문서)과 1년(정지 안내 문서)으로 달리 적어 둠 → 대시보드의 프로젝트 상태에서 확인
- 복구 확인은 **`node tools/supabase-check.mjs`** 한 줄: 주소·REST·테이블 5개·RLS(로그인 없이 남의 기록이 안 보이는지)·Google 로그인 켜짐을 점검
- 되살릴 수 있으면: 대시보드 → 프로젝트 → Restore project. 불가하면 새 프로젝트(서울 리전) → SQL Editor에서 `docs/supabase_schema.sql`, `docs/supabase_v2.7.sql` 실행 → Authentication > Providers > Google 켜기(Google Cloud의 OAuth 클라이언트, 리디렉션 `https://<ref>.supabase.co/auth/v1/callback`) → URL Configuration의 Site URL·Redirect URLs에 운영 주소·미리보기 주소·`http://127.0.0.1:5500` 추가 → `js/core.js`의 `SUPABASE_URL`·`SUPABASE_KEY`(공개 키)만 교체
- 재발 방지: `.github/workflows/supabase-keepalive.yml`이 3일마다 가볍게 호출하고 실패하면 GitHub이 메일로 알림. 결제를 받기 시작하면 **Pro 플랜**(정지 없음, 자동 백업)으로 올릴 것 — 무료 플랜은 백업이 없고 정지될 수 있어 유료 서비스의 기반으로 부적합

## 3단계 + 보류 보완 처리 (2026-11-18)
- 말씀 풀: 목사님 검토로 맥락이 어긋나는 22건 추가 정리, 사 41:10 7→3곳, 같은 장절 중복 버전 제거, 시편 34:4·126:5·100:4·107:1 보충(개역한글 본문). 모든 조합 9~14개. 건너뛰기 기본 필요(`DEFAULT_NEED`)는 목사님 확인: 감사·평안·지침=쉼, 걱정·아픔·기도=위로
- 건너뛴 기록은 `entry.skip=1`(기기에만) → 나의 이야기의 "자주 필요했던 것"에서 제외
- 동기화: 기기에서 지운 즐겨찾기는 `savedDeleted`에 남겨 다음 동기화 때 클라우드에서도 지움(되살아나지 않음). 같은 날 서로 다른 일기는 이어 붙여 둘 다 보존. 같은 날 같은 감정·주제·필요 중복 기록이 한 건으로 합쳐지는 것은 스키마를 바꿔야 해서 그대로 둠(운영 기준에 안내)
- 설정 > "서비스 운영 기준"(`openPolicy('standards')`): 말씀 출처, 기록 보관(62일·동기화), 무료/프리미엄, 말씀 선정 기준, 위기 안내, 운영자 정보. 내용이 바뀌면 함께 고칠 것
- 보안: 크론 비밀 비교 상수시간(`safeEqual`), CSP는 `Content-Security-Policy-Report-Only`로 먼저 관찰(콘솔 위반 메시지 확인 후 enforcing 전환), CDN 스크립트 SRI는 이미 적용
- 유료 버전용 음원 준비는 후순위로 미룸

## 출시 전 알려진 한계 (2026-11-20 코드 리뷰, Supabase 복구 때 함께 처리)
- 건너뛴 기록 표시(`skip`)와 1년 보관 일기는 기기에만 있음: 서버에는 저장·복원되지 않고, 동기화 창은 62일(`syncWithServer`)이라 62일~1년 지난 일기는 백업되지 않음. 복구 때 `mood_history`에 skip 열을 추가하고 일기 있는 행은 동기화 창을 넓힐 것
- 영어 말씀 풀(`VERSE_POOL_EN`)은 ESV로 보임 → 영어를 열기 전 WEB(퍼블릭 도메인)로 교체. 영어·일본어는 `ENABLED_LANGS`로 계속 잠금
