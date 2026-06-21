# Changelog — 오늘은 어땠나요?

> 모든 변경사항은 이 파일에 기록됩니다.  
> 형식: [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)

---

## [v2.3] — 2026-06-21 · 모바일 최종 점검 + 다국어 완성도 향상

### 수정
- 영어 모드에서 긴 단어 줄바꿈: `word-break:keep-all` → `word-break:break-word;overflow-wrap:break-word` (전체 적용)
- 히어로 티저 구절 2줄 클램핑: `white-space:nowrap` 제거, `-webkit-line-clamp:2` 적용
- 업데이트 배너 좁은 화면 넘침 방지: `white-space:nowrap` 제거, `max-width:min(90vw,380px)` 적용
- iOS Safari 주소바 높이 이슈: `min-height:100svh` 추가 (100vh fallback 유지)

### 추가
- 히어로 티저 라벨 다국어 처리: `ht_label` (ko/en/ja) + `applyLang()`에서 동적 업데이트
- 언어 변경 시 `<html lang>` 속성 자동 갱신 (ko/en/ja)
- 언어 변경 시 `<body>` 에 `lang-ko/en/ja` 클래스 자동 적용

---

## [v2.2] — 2026-06-21 · 영어 콘텐츠 + QR 공유 + 최적화

### 추가
- 영어 모드 결과 화면 전체 번역: 성경 구절 144개(ESV), 묵상·기도·응원·한 문장
- 히어로 티저 카드 영어 구절 표시
- 설정 > QR로 공유: QR 코드 즉시 생성 + 링크 복사 버튼
- 설정 > 앱 정보 버전 번호 동적 표시 (APP_VERSION 상수)
- `mobile-web-app-capable` 메타태그 추가

### 수정
- 메인 홈(Step 1) 하단 여백 100px → 36px 축소
- manifest.json CORS 오류 수정: file:// 환경에서 정적 링크 제거, http/https에서만 동적 추가
- E_LABEL/T_LABEL/N_LABEL → eLabel()/tLabel()/nLabel() 언어 동적 함수 교체
- WELCOME 상수 제거 (LANG_DATA 중복)

---

## [v2.1] — 2026-06-21 · 모바일 중앙 정렬 + 완전 다국어 지원

### 개선
- 메뉴 페이지(Step 1·2·3) 세로 중앙 정렬: `page-wrap` safe-area 대응 padding-top + Step 2·3 `margin-top: 16vh` (compact 10vh / SE 5vh)
- Step 2·3의 `style="margin-top:12px"` 인라인 제거 → CSS 클래스 통합 관리

### 추가 (영어·일본어 완전 번역)
- 설정 오버레이 전체: 제목, 뒤로 버튼, 섹션 라벨(언어/테마/폰트/개인정보/데이터/앱), 테마·폰트 버튼 텍스트
- 설정 행: 이름 변경, 기록 내보내기, 데이터 초기화, 업데이트 확인, 앱 설명, 개인정보 안내
- 보관함 오버레이: 제목, 뒤로 버튼, 빈 상태 문구, 페이지네이션(이전/다음)
- 결과 화면: 말씀·이야기·기도·한 문장·일기·응원 섹션 라벨
- 일기 카드: 라벨, 플레이스홀더, 저장 버튼, 저장 완료 메시지
- 체크인 필: 출석 문구, 연속 단위
- 날짜 포맷: locale 기반 (`ko-KR` / `en-US` / `ja-JP`)
- 환영 문구: 언어별 welcome_msgs 배열 (en 7개, ja 7개)
- 보관함 날짜: 언어별 월/요일 표기
- 토스트 메시지 전체 언어화 (복사, 즐겨찾기, 일기저장, 내보내기, 초기화 등)
- 데이터 초기화 confirm 메시지 언어화

---

## [v2.0] — 2026-06-20 · 최종 완성본

### 추가
- 설정 > 개인정보 안내 "저장된 기록은 기기 내에만 보관, 외부 수집 없음" 표시
- 보관함·설정 버튼 우상단 독립 고정 (absolute 레이아웃)
- 달·환영문구·날짜 완전 가운데 정렬

### 수정
- welcome-text 한 줄 강제 표시 (white-space:nowrap + text-overflow:ellipsis)
- PC 로컬(file://) 환경에서 Service Worker 관련 SecurityError 해결
  - `checkUpdateManual`, `openSettings`, `applyUpdate` 모두 protocol 체크 추가

---

## [v1.9] — 묵상 텍스트 + 보관함 페이지네이션

### 추가
- 설정 > 수동 업데이트 확인 버튼 (최신 버전 체크 + 즉시 적용)
- 히어로 티저 한 줄 표시 (white-space:nowrap)

### 개선
- 묵상 본문 줄 간격·들여쓰기·word-break:keep-all 적용
- 기도 카드 배경색·테두리 스타일링
- 보관함 저장 말씀 5개씩 페이지네이션
- 감정 기록 7개씩 페이지네이션 + 월별 빠른 이동 버튼
- SW 업데이트 배너 버튼 정상 동작 수정

---

## [v1.8] — 모바일 레이아웃 최적화

### 개선
- step 1·2·3 모바일 한 화면에 맞춤 (scroll 없이 전체 노출)
- 히어로 티저 step2+ 자동 숨김
- 폰트 크기 미디어쿼리 압축 (max-height: 820px / 700px)

---

## [v1.7] — SW 캐시 전략 개선

### 수정
- index.html: 캐시 우선 → **네트워크 우선**으로 전환 (업데이트 즉시 반영)
- `updatefound` / `statechange` 이벤트 체인으로 새 버전 배너 감지
- `controllerchange` → 자동 새로고침 패턴 추가
- 캐시 버전: `god-app-v6`

---

## [v1.6] — 설정창 + 언어/테마 + 데이터 내보내기

### 추가
- 설정창 언어 선택 (한국어 / English / 日本語)
- 배경 테마 선택 (밤 / 새벽 / 숲)
- 개인 설정: 이름 변경, 폰트 크기 조절
- 데이터 내보내기 (JSON 다운로드)
- 말씀 공유 버그 수정 (Web Share API 3단계 폴백)

---

## [v1.5] — 첫 방문 + 다국어

### 추가
- 첫 방문 환영 화면 특별 연출 (이름 입력 + 환영 메시지)
- 한국어 / 영어 / 일본어 i18n (`LANG_DATA`, `applyLang()`)

---

## [v1.4] — 보관함 개편 + 디자인 통일

### 변경
- 오버레이 디자인 통일 (보관함 / 설정 동일 스타일)
- 보관함 탭: 저장 말씀 + 감정 기록 분리
- moon-rays 제거 (성능 최적화)

---

## [v1.3] — 메인화면 강화 + 스트릭

### 추가
- 출석 스트릭 compact 칩 UI (`#checkin-pill`)
- 히어로 티저 글라스 카드 (랜덤 성경 구절 미리보기)
- 떠다니는 꽃 파티클 (🌸✨🍃🌷🌟)
- 결과 카드 shimmer 순차 애니메이션

---

## [v1.2] — UI 전체 리뉴얼

### 변경
- 전체 UI 테마: 꽃/자연/달빛 테마
- 달 이모지 + 오비탈 파티클 5개 + float 애니메이션
- 오로라 블롭 배경 (3개, GPU 가속)

---

## [v1.1] — 성경 구절 확장 + PWA 기반

### 추가
- 즐겨찾기(보관함) 기능
- PWA 홈화면 추가 프롬프트 (iOS / Android)
- 말씀 공유 기능 (Web Share API)
- VERSE_POOL 144구절 (6감정 × 4필요 × 6구절) + 반복 방지
- 오프라인 지원 (Service Worker)

---

## [v1.0] — 최초 릴리즈

### 기본 기능
- 4단계 감정 기록 플로우: 감정 선택 → 주제 → 필요 → 결과
- 결과 화면: 성경 말씀 + 묵상 이야기 + 기도 + 한 문장 + 일기 + 격려
- localStorage 기반 데이터 저장 (기기 내 보관)
- 스타 배경 파티클 애니메이션
