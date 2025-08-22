import type { EmotionType } from '../services/emotionAnalysisService';

export const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: "#10b981",
  sad: "#6b7280",
  angry: "#ef4444",
  neutral: "#9ca3af",
  excited: "#f59e0b",
  calm: "#3b82f6",
  anxious: "#8b5cf6",
  proud: "#ec4899",
  disappointed: "#dc2626",
  grateful: "#059669",
};

export const EMOTION_EMOJIS: Record<EmotionType, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
  excited: "🤩",
  calm: "😌",
  anxious: "😰",
  proud: "😎",
  disappointed: "😞",
  grateful: "🙏",
};

export const EMOTION_LABELS: Record<EmotionType, string> = {
  happy: "기쁨",
  sad: "슬픔", 
  angry: "분노",
  neutral: "중성",
  excited: "흥분",
  calm: "평온",
  anxious: "불안",
  proud: "자부심",
  disappointed: "실망",
  grateful: "감사",
};

export function getEmotionEmoji(emotion: EmotionType | string): string {
  return EMOTION_EMOJIS[emotion as EmotionType] || EMOTION_EMOJIS.neutral;
}

export function getEmotionColor(emotion: EmotionType | string): string {
  return EMOTION_COLORS[emotion as EmotionType] || EMOTION_COLORS.neutral;
}

export function getEmotionLabel(emotion: EmotionType | string): string {
  return EMOTION_LABELS[emotion as EmotionType] || EMOTION_LABELS.neutral;
}