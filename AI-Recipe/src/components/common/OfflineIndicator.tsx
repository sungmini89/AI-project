import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";

export function OfflineIndicator() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);

      // 온라인 상태 복구 메시지를 3초 후 숨김
      setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("offline.onlineRestored")}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("offline.offlineMode")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
