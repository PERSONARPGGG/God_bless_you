// 캐시 버전 — 이름이 바뀌면 이전 캐시 자동 삭제
const CACHE = 'god-app-v20';
// 오프라인 폴백용으로 캐싱할 에셋
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

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

    if (isHTML) {
        // index.html: 네트워크 우선 → 실패 시 캐시 폴백 (오프라인 지원)
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    // 새 응답을 캐시에 저장
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                    return res;
                })
                .catch(() => caches.match(e.request))
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
