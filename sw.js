// 캐시 버전 — 이름이 바뀌면 이전 캐시 자동 삭제
const CACHE = 'god-app-v24';
// 오프라인 폴백용으로 캐싱할 에셋
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg', './css/app.css',
    './js/data.js', './js/core.js', './js/i18n.js', './js/auth.js', './js/flow.js', './js/vault.js',
    './js/ui.js', './js/premium.js', './js/audio.js', './js/persona.js', './js/sheep.js', './js/care.js'];

self.addEventListener('install', e => {
    // 설치 즉시 대기 없이 활성화
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
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
    const url = new URL(e.request.url);
    const isHTML = e.request.destination === 'document' ||
                   url.pathname === '/' || url.pathname.endsWith('index.html');

    // 앱 코드(css/js)도 index.html과 같은 방식으로 받아야 화면과 코드의 버전이 어긋나지 않음
    const isAppCode = url.origin === self.location.origin &&
                      (url.pathname.includes('/js/') || url.pathname.includes('/css/'));

    if (isHTML || isAppCode) {
        // index.html·앱 코드: 네트워크 우선 → 실패 시 캐시 폴백 (오프라인 지원)
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    // 새 응답을 캐시에 저장
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                    return res;
                })
                .catch(() => caches.match(e.request, { ignoreSearch: true }))
        );
    } else {
        // 아이콘·manifest 등 정적 에셋: 캐시 우선 → 없으면 네트워크
        // 오디오(피아노 샘플·찬송가 음원)는 첫 로딩 후 캐시에 저장 (재다운로드 방지)
        e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request).then(res => {
                if (res.status === 200 && url.pathname.includes('/audio/')) {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            }))
        );
    }
});

// 새 SW 설치 완료 메시지 → index.html의 navigator.serviceWorker.addEventListener('message') 로 수신
self.addEventListener('message', e => {
    if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
