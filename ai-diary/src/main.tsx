import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Service Worker 등록 (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // 기존 서비스 워커 등록 해제
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log("Old SW unregistered");
      }

      // 새 서비스 워커 등록
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("New SW registered: ", registration);

      // 캐시 정리
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
        console.log("Old caches cleared");
      }
    } catch (registrationError) {
      console.log("SW registration failed: ", registrationError);
      // 서비스 워커 등록 실패는 앱 실행을 막지 않음
    }
  });
}

// 푸시 알림 권한 요청 (선택적)
if ("Notification" in window && navigator.serviceWorker) {
  // 사용자 상호작용 후에 권한 요청하도록 수정
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
    } catch (error) {
      console.log("Notification permission request failed:", error);
    }
  };

  // 권한이 허용되지 않은 경우에만 요청
  if (Notification.permission === "default") {
    // 사용자가 페이지와 상호작용한 후 권한 요청
    document.addEventListener("click", requestNotificationPermission, {
      once: true,
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
