import { useEffect, useRef, useCallback } from "react";
import { usePomodoroStore, useSettingsStore } from "@/stores";

export function usePomodoro() {
  const {
    currentSession,
    isActive,
    timeRemaining,
    updateTimeRemaining,
    completeSession,
    pauseSession,
    resumeSession,
    cancelSession,
  } = usePomodoroStore();

  const { pomodoroSettings: settings } = useSettingsStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.src =
          "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBqGR1+O3aiQJLHzJ8NOYPAoUWL7o5alZEgpCmNzuyI49CRSJ1eO1aSMNLn3J8NGYPwoUW73r6KhWEglGnN7zxnkrBHfO8dyQQQsTXbXq5alXEwpJmuHzw3wsBDR/yO/IfE0RBkur5OKvWREIPI/K8N2OQwkVa7zv4aZVGQhAmdrhzYk+CRSFz+PYZC0FKHbH7t6NQAkSYLji5KZYGAJIG+Tyw3kpBCyCyrfO8N6OQwoIJHPL7tyNQQoSY73n5J9SFQhCl9fzyH8lASl+yO3YfzQGCEu32+rGfCwPJ4zU49VZAg7i7c7XmjARE2OjqTYhAW7F8aBFWAQLmELKyQJJk2QAAAlD0ACEKqQAE0QiKwRCCQmJZw0AHIJCEgQAABtXAAEB7LbQ95k7AQRb2PGpTREISpTZ8Mp9JQXO7mQ0FaAwEEOr4t+idggYFGvF6taZDhANOqDt4q9NEw5Blt7wtW0hCCWN0eKrXRAMAAAUIVBFKJIBCZJJ2Q";
      }
      audioRef.current.play().catch(() => {});
    } catch (error) {
      console.warn("오디오 재생 실패:", error);
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  useEffect(() => {
    if (isActive && currentSession && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        updateTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentSession, timeRemaining, updateTimeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && currentSession && isActive) {
      playNotificationSound();

      const sessionType = currentSession.type;
      const nextType = sessionType === "work" ? "휴식" : "작업";

      showNotification(
        `${sessionType === "work" ? "작업" : "휴식"} 완료!`,
        `${
          sessionType === "work" ? "작업 시간이" : "휴식 시간이"
        } 끝났습니다. ${nextType} 시간을 시작하세요.`
      );
    }
  }, [
    timeRemaining,
    currentSession,
    isActive,
    playNotificationSound,
    showNotification,
  ]);

  // 설정이 변경될 때 현재 세션이 없으면 기본 시간을 업데이트
  useEffect(() => {
    if (!currentSession && !isActive) {
      // 현재 세션이 없을 때만 시간을 업데이트 (작업 시간으로 기본 설정)
      const newTimeRemaining = settings.workTime * 60;
      if (timeRemaining !== newTimeRemaining) {
        updateTimeRemaining(newTimeRemaining);
      }
    }
  }, [
    settings.workTime,
    currentSession,
    isActive,
    timeRemaining,
    updateTimeRemaining,
  ]);

  const getProgress = useCallback((): number => {
    if (!currentSession) return 0;
    const totalTime = currentSession.duration * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  }, [currentSession, timeRemaining]);

  const getSessionTypeText = useCallback((type: string): string => {
    switch (type) {
      case "work":
        return "작업 시간";
      case "short-break":
        return "짧은 휴식";
      case "long-break":
        return "긴 휴식";
      default:
        return "알 수 없음";
    }
  }, []);

  return {
    currentSession,
    isActive,
    timeRemaining,
    settings,
    formatTime,
    getProgress,
    getSessionTypeText,
    playNotificationSound,
    showNotification,
    requestNotificationPermission,
    pauseSession,
    resumeSession,
    cancelSession,
    completeSession,
  };
}
