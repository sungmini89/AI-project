// Service Worker for AI Diary PWA
const CACHE_NAME = "ai-diary-v2"; // 버전 업데이트
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/diary-icon.svg",
  // Add other static assets
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for diary entries
self.addEventListener("sync", (event) => {
  if (event.tag === "diary-sync") {
    event.waitUntil(syncDiaryEntries());
  }
});

async function syncDiaryEntries() {
  try {
    // Sync logic for when connection is restored
    console.log("Syncing diary entries...");
    // Implementation would depend on your backend sync strategy
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "일기를 작성할 시간이에요!",
    icon: "/icons/diary-icon.svg",
    badge: "/icons/diary-icon.svg",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "1",
    },
    actions: [
      {
        action: "write",
        title: "일기 쓰기",
      },
      {
        action: "close",
        title: "닫기",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("AI 감정 일기장", options)
  );
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "write") {
    event.waitUntil(clients.openWindow("/write"));
  } else if (event.action === "close") {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"));
  }
});
