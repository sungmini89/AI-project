export const TASK_CATEGORIES = [
  "업무",
  "개인",
  "건강",
  "쇼핑",
  "약속",
  "학습",
  "운동",
  "기타",
] as const;

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
};

export const CATEGORY_COLORS = {
  업무: "bg-purple-100 text-purple-800",
  개인: "bg-green-100 text-green-800",
  건강: "bg-pink-100 text-pink-800",
  쇼핑: "bg-yellow-100 text-yellow-800",
  약속: "bg-indigo-100 text-indigo-800",
  학습: "bg-cyan-100 text-cyan-800",
  운동: "bg-red-100 text-red-800",
  기타: "bg-gray-100 text-gray-800",
};

export const CATEGORY_KEYWORDS = {
  업무: [
    "회의",
    "미팅",
    "업무",
    "일",
    "프로젝트",
    "보고서",
    "이메일",
    "연락",
    "출장",
    "발표",
    "기획",
    "개발",
    "디자인",
    "마케팅",
    "영업",
    "회사",
    "직장",
    "동료",
  ],
  건강: [
    "병원",
    "의원",
    "치과",
    "검진",
    "진료",
    "약국",
    "운동",
    "헬스",
    "요가",
    "필라테스",
    "다이어트",
    "건강",
    "의료",
    "치료",
    "약속",
  ],
  쇼핑: [
    "쇼핑",
    "구매",
    "마트",
    "백화점",
    "온라인",
    "주문",
    "배송",
    "택배",
    "쿠팡",
    "11번가",
    "네이버",
    "이마트",
    "롯데",
  ],
  약속: [
    "약속",
    "만남",
    "모임",
    "식사",
    "저녁",
    "점심",
    "커피",
    "술",
    "친구",
    "가족",
    "연인",
    "데이트",
    "만나기",
  ],
  학습: [
    "공부",
    "학습",
    "강의",
    "수업",
    "세미나",
    "교육",
    "시험",
    "자격증",
    "독서",
    "책",
    "온라인강의",
    "유튜브",
    "블로그",
  ],
  운동: [
    "운동",
    "헬스",
    "요가",
    "필라테스",
    "수영",
    "축구",
    "농구",
    "테니스",
    "골프",
    "조깅",
    "달리기",
    "산책",
    "하이킹",
    "등산",
  ],
};

export const PRIORITY_KEYWORDS = {
  urgent: ["긴급", "급함", "당장", "즉시", "ASAP", "중요", "빨리"],
  high: ["중요", "우선", "먼저", "빠르게", "신속", "곧"],
  medium: ["보통", "일반", "평소"],
  low: ["나중에", "여유", "틈날때", "시간될때"],
};

export const TIME_KEYWORDS = {
  morning: ["아침", "오전", "새벽", "AM"],
  afternoon: ["오후", "점심", "PM"],
  evening: ["저녁", "밤", "야간"],
};

export const DEFAULT_POMODORO_SETTINGS = {
  workTime: Number(import.meta.env.VITE_POMODORO_WORK_TIME) || 25,
  shortBreak: Number(import.meta.env.VITE_POMODORO_SHORT_BREAK) || 5,
  longBreak: Number(import.meta.env.VITE_POMODORO_LONG_BREAK) || 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export const FREE_API_LIMITS = {
  huggingface: {
    daily: 1000,
    monthly: 30000,
  },
  gemini: {
    daily: 15,
    monthly: 500,
  },
};

export const STORAGE_KEYS = {
  TASKS: "smart-todo-tasks",
  SETTINGS: "smart-todo-settings",
  POMODORO_SESSIONS: "smart-todo-pomodoro",
  TIME_ENTRIES: "smart-todo-time-entries",
  API_USAGE: "smart-todo-api-usage",
};

export * from "./translations";
