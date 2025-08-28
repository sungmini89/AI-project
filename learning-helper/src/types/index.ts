// Core Types for AI Study Helper

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: number; // 0-5 scale
  interval: number; // days until next review
  repetitions: number;
  efactor: number; // easiness factor for SM-2
  nextReview: Date;
  created: Date;
  lastReviewed?: Date;
  tags: string[];
  documentId?: string; // 문서별 관리용 ID
}

export interface StudySession {
  id: string;
  cards: Flashcard[];
  startTime: Date;
  endTime?: Date;
  correctAnswers: number;
  totalAnswers: number;
  sessionType: "review" | "new" | "mixed";
}

export interface TextDocument {
  id: string;
  title: string;
  content: string;
  summary?: string;
  keywords: string[];
  uploadDate: Date;
  fileType: "pdf" | "txt" | "md";
  processedCards: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit?: number; // minutes
  created: Date;
  sourceDocument?: string;
}

export interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "fill-blank" | "short-answer";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface StudyProgress {
  totalCards: number;
  masteredCards: number;
  reviewsDue: number;
  dailyGoal: number;
  streak: number;
  lastStudyDate?: Date;
  weeklyStats: {
    date: string;
    cardsStudied: number;
    accuracy: number;
  }[];
}

export interface AIServiceConfig {
  provider: "gemini" | "huggingface" | "offline";
  apiKey?: string;
  dailyQuota: number;
  usedQuota: number;
  lastReset: Date;
}

export interface FreeAIServiceConfig extends AIServiceConfig {
  provider: "gemini" | "huggingface" | "offline";
  mode: "mock" | "free" | "offline" | "custom";
  huggingfaceToken?: string;
  customEndpoint?: string;
  monthlyQuota: number;
  usedMonthlyQuota: number;
  lastMonthlyReset: Date;
}

export interface APIUsageInfo {
  daily: {
    used: number;
    total: number;
    remaining: number;
  };
  monthly: {
    used: number;
    total: number;
    remaining: number;
  };
  canUseAI: boolean;
  currentMode: "mock" | "free" | "offline" | "custom";
}

export interface UserSettings {
  language: "ko" | "en";
  theme: "light" | "dark" | "system";
  dailyGoal: number;
  notifications: boolean;
  aiService: AIServiceConfig;
}
