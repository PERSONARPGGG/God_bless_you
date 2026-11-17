// 캐시 버전 — 이름이 바뀌면 이전 캐시 자동 삭제
const CACHE = 'god-app-v25';
// 오프라인 폴백용으로 캐싱할 에셋 (js 파일을 추가·삭제하면 여기도 함께 — tools/check.mjs가 확인)
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg', './css/app.css',
    './js/data.js', './js/core.js', './js/i18n.js', './js/effects.js', './js/audio.js', './js/pwa.js',
    './js/auth.js', './js/flow.js', './js/vault.js', './js/ui.js', './js/premium.js', './js/dashboard.js',
    './js/demo.js', './js/sheep.js', './js/care.js', './js/boot.js'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
    // 첫 설치일 때만 바로 활성화한다.
    // 이미 쓰고 있는 버전이 있으면 기다린다 → 앱이 "새 버전이 있어요" 배너를 띄우고, 사용자가 누르면 교체.
    // (바로 교체하면 화면이 저절로 새로고침되어, 쓰고 있던 일기가 사라진다)
    if (!self.registration.active) self.skipWaiting();
});

self.addEventListener('activate', e => {
    // 이전 버전 캐시 삭제
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const req = e.request;
    const url = new URL(req.url);
    // 우리 사이트의 GET 요청만 다룬다. 로그인·DB(Supabase)·글꼴·QR 등 바깥 요청과 쓰기 요청은 브라우저에 그대로 맡김
    if (req.method !== 'GET' || url.origin !== self.location.origin) return;

    const isHTML = req.mode === 'navigate' || req.destination === 'document' ||
                   url.pathname === '/' || url.pathname.endsWith('index.html');
    // 앱 코드(css/js)도 index.html과 같은 방식으로 받아야 화면과 코드의 버전이 어긋나지 않음
    const isAppCode = url.pathname.includes('/js/') || url.pathname.includes('/css/');

    if (isHTML || isAppCode) {
        // index.html·앱 코드: 네트워크 우선 → 실패 시 캐시 폴백 (오프라인 지원)
        e.respondWith(
            fetch(req)
                .then(res => {
                    // 정상 응답만, 주소에 ?code=… 같은 꼬리가 없을 때만 캐시에 저장 (오류 화면·로그인 복귀 주소를 쌓지 않음)
                    if (res.ok && !url.search) {
                        const clone = res.clone();
                        caches.open(CACHE).then(c => c.put(req, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(req, { ignoreSearch: true })
                    .then(r => r || (isHTML ? caches.match('./index.html') : undefined))
                    .then(r => r || Response.error()))
        );
    } else {
        // 아이콘·manifest 등 정적 에셋: 캐시 우선 → 없으면 네트워크
        // 오디오(찬송가 음원)는 첫 로딩 후 캐시에 저장 (재다운로드 방지)
        e.respondWith(
            caches.match(req).then(r => r || fetch(req).then(res => {
                if (res.status === 200 && url.pathname.includes('/audio/')) {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(req, clone));
                }
                return res;
            }))
        );
    }
});

// 앱의 "지금 업데이트" 버튼 → 기다리던 새 버전을 활성화
self.addEventListener('message', e => {
    if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
