/**
 * 할일의 진행 상태를 나타내는 타입
 * @typedef {("todo" | "in-progress" | "done")} TaskStatus
 */
export type TaskStatus = "todo" | "in-progress" | "done";

/**
 * 할일의 우선순위를 나타내는 타입
 * @typedef {("low" | "medium" | "high" | "urgent")} TaskPriority
 */
export type TaskPriority = "low" | "medium" | "high" | "urgent";

/**
 * 할일의 카테고리를 나타내는 타입
 * @typedef {("업무" | "개인" | "건강" | "쇼핑" | "약속" | "학습" | "운동" | "기타")} TaskCategory
 */
export type TaskCategory =
  | "업무"
  | "개인"
  | "건강"
  | "쇼핑"
  | "약속"
  | "학습"
  | "운동"
  | "기타";

/**
 * 할일 데이터 구조
 * @interface Task
 */
export interface Task {
  /** 고유 식별자 */
  id: string;
  /** 할일 제목 */
  title: string;
  /** 할일 상세 설명 (선택사항) */
  description?: string;
  /** 현재 진행 상태 */
  status: TaskStatus;
  /** 우선순위 */
  priority: TaskPriority;
  /** 카테고리 */
  category: TaskCategory;
  /** 마감일 (선택사항) */
  dueDate?: Date;
  /** 예상 소요 시간(분) */
  estimatedTime?: number;
  /** 실제 소요 시간(분) */
  actualTime?: number;
  /** 완료 일시 */
  completedAt?: Date;
  /** 생성 일시 */
  createdAt: Date;
  /** 최종 수정 일시 */
  updatedAt: Date;
  /** 태그 목록 */
  tags: string[];
  /** 반복 할일 여부 */
  isRecurring?: boolean;
  /** 반복 패턴 */
  recurringPattern?: string;
  /** 상위 할일 ID (하위 할일인 경우) */
  parentTaskId?: string;
  /** 하위 할일 목록 */
  subtasks?: Task[];
}

/**
 * 포모도로 세션 데이터 구조
 * @interface PomodoroSession
 */
export interface PomodoroSession {
  /** 세션 고유 식별자 */
  id: string;
  /** 연결된 할일 ID (선택사항) */
  taskId?: string;
  /** 세션 타입 (작업/짧은휴식/긴휴식) */
  type: "work" | "short-break" | "long-break";
  /** 세션 지속 시간(분) */
  duration: number;
  /** 세션 시작 시간 */
  startTime: Date;
  /** 세션 종료 시간 (선택사항) */
  endTime?: Date;
  /** 세션 완료 여부 */
  isCompleted: boolean;
}

/**
 * 시간 추적 엔트리 데이터 구조
 * @interface TimeEntry
 */
export interface TimeEntry {
  /** 엔트리 고유 식별자 */
  id: string;
  /** 할일 ID */
  taskId: string;
  /** 작업 시작 시간 */
  startTime: Date;
  /** 작업 종료 시간 (선택사항) */
  endTime?: Date;
  /** 작업 지속 시간(분) */
  duration?: number;
  /** 작업 설명 (선택사항) */
  description?: string;
}

/**
 * 캘린더 이벤트 데이터 구조
 * @interface CalendarEvent
 */
export interface CalendarEvent {
  /** 이벤트 고유 식별자 */
  id: string;
  /** 이벤트 제목 */
  title: string;
  /** 이벤트 시작 시간 */
  start: Date;
  /** 이벤트 종료 시간 */
  end: Date;
  /** 종일 이벤트 여부 */
  allDay?: boolean;
  /** 연결된 할일 데이터 */
  resource?: Task;
}

/**
 * AI 서비스 모드 타입
 * @typedef {("mock" | "free" | "offline" | "userApiKey")} AIServiceMode
 */
export type AIServiceMode = "mock" | "free" | "offline" | "userApiKey";

/**
 * AI 서비스 설정 구조
 * @interface AIServiceConfig
 */
export interface AIServiceConfig {
  /** 현재 사용 중인 AI 서비스 모드 */
  mode: AIServiceMode;
  /** 사용자 API 키 (userApiKey 모드용) */
  apiKey?: string;
  /** 오프라인 모드로 폴백 여부 */
  fallbackToOffline: boolean;
  /** 사용량 추적 데이터 */
  usageTracking: {
    /** 일일 사용량 */
    daily: number;
    /** 월간 사용량 */
    monthly: number;
    /** 마지막 리셋 시간 */
    lastReset: Date;
  };
}

/**
 * AI가 제공하는 할일 인사이트 구조
 * @interface TaskInsights
 */
export interface TaskInsights {
  /** AI가 추천하는 카테고리 */
  category: TaskCategory;
  /** AI가 추천하는 우선순위 */
  priority: TaskPriority;
  /** AI가 추정하는 소요 시간(분) */
  estimatedTime?: number;
  /** AI가 추천하는 마감일 */
  suggestedDueDate?: Date;
  /** AI 추천의 신뢰도 (0-100) */
  confidence: number;
}

/**
 * 앱 전체 설정 구조
 * @interface AppSettings
 */
export interface AppSettings {
  /** 테마 설정 (라이트/다크) */
  theme: "light" | "dark";
  /** 언어 설정 (한국어/영어) */
  language: "ko" | "en";
  /** 포모도로 타이머 설정 */
  pomodoroSettings: {
    /** 작업 시간(분) */
    workTime: number;
    /** 짧은 휴식 시간(분) */
    shortBreak: number;
    /** 긴 휴식 시간(분) */
    longBreak: number;
    /** 휴식 자동 시작 여부 */
    autoStartBreaks: boolean;
    /** 포모도로 자동 시작 여부 */
    autoStartPomodoros: boolean;
  };
  /** 알림 설정 */
  notifications: {
    /** 알림 전체 활성화 여부 */
    enabled: boolean;
    /** 할일 리마인더 알림 */
    taskReminders: boolean;
    /** 포모도로 알림 */
    pomodoroAlerts: boolean;
  };
  /** AI 서비스 설정 */
  aiSettings: AIServiceConfig;
}
