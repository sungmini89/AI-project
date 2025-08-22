import { databaseService } from "./databaseService";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

class NotificationService {
  private permission: NotificationPermission = "default";

  constructor() {
    this.checkPermission();
  }

  private checkPermission() {
    if ("Notification" in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("이 브라우저는 알림을 지원하지 않습니다.");
      return "denied";
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error("알림 권한 요청 실패:", error);
      return "denied";
    }
  }

  async canSendNotification(): Promise<boolean> {
    try {
      const settings = await databaseService.getSettings();
      return (
        settings.notifications &&
        this.permission === "granted" &&
        "Notification" in window
      );
    } catch (error) {
      console.error("알림 설정 확인 실패:", error);
      return false;
    }
  }

  async sendNotification(options: NotificationOptions): Promise<void> {
    const canSend = await this.canSendNotification();
    if (!canSend) {
      console.log("알림을 보낼 수 없습니다:", {
        permission: this.permission,
        inWindow: "Notification" in window,
      });
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/icons/diary-icon.svg",
        badge: options.badge || "/icons/diary-icon.svg",
        tag: options.tag || "ai-diary",
        requireInteraction: options.requireInteraction || false,
        timestamp: Date.now(),
      });

      // 알림 클릭 시 앱으로 포커스
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 5초 후 자동 닫기 (requireInteraction이 false인 경우)
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error("알림 발송 실패:", error);
    }
  }

  // 일기 저장 완료 알림
  async notifyDiarySaved(title: string): Promise<void> {
    await this.sendNotification({
      title: "일기 저장 완료",
      body: `"${title}" 일기가 성공적으로 저장되었습니다.`,
      tag: "diary-saved",
    });
  }

  // 감정 분석 완료 알림
  async notifyEmotionAnalyzed(emotion: string): Promise<void> {
    await this.sendNotification({
      title: "감정 분석 완료",
      body: `오늘의 주요 감정: ${emotion}`,
      tag: "emotion-analyzed",
    });
  }

  // 백업 완료 알림
  async notifyBackupCreated(): Promise<void> {
    await this.sendNotification({
      title: "백업 생성 완료",
      body: "데이터가 안전하게 백업되었습니다.",
      tag: "backup-created",
    });
  }

  // 일기 작성 리마인더 (나중에 확장 가능)
  async notifyWritingReminder(): Promise<void> {
    await this.sendNotification({
      title: "일기 작성 시간",
      body: "오늘 하루는 어떠셨나요? 일기를 작성해보세요.",
      tag: "writing-reminder",
      requireInteraction: true,
    });
  }

  // 알림 권한 상태 확인
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // 알림 지원 여부 확인
  isSupported(): boolean {
    return "Notification" in window;
  }
}

export const notificationService = new NotificationService();