/**
 * AI 캡션 생성기 PWA Service Worker
 *
 * @description
 * - 기본 페이지 및 리소스 캐싱
 * - 오프라인 지원
 * - 캐시 관리 및 업데이트
 */

const CACHE = "ai-captioner-v1";
const ASSETS = ["/", "/index.html", "/manifest.webmanifest"];

// 설치 이벤트: 기본 리소스 캐싱
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

// 활성화 이벤트: 이전 캐시 정리
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
});

// fetch 이벤트: 캐시 우선, 실패 시 네트워크 요청
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((resp) => resp || fetch(e.request).catch(() => caches.match("/"))),
  );
});
