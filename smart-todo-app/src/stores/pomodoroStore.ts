import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PomodoroSession } from "../types";
import { generateId } from "@/utils";
import { DEFAULT_POMODORO_SETTINGS, STORAGE_KEYS } from "@/constants";

interface PomodoroStore {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  isActive: boolean;
  timeRemaining: number;
  settings: typeof DEFAULT_POMODORO_SETTINGS;

  startSession: (type: PomodoroSession["type"], taskId?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  cancelSession: () => void;
  updateTimeRemaining: (time: number) => void;
  updateSettings: (settings: Partial<typeof DEFAULT_POMODORO_SETTINGS>) => void;

  getTodaySessions: () => PomodoroSession[];
  getCompletedSessions: () => PomodoroSession[];
  getSessionsByTask: (taskId: string) => PomodoroSession[];
  getTotalFocusTime: () => number;
  getSessionStats: () => {
    completed: number;
    totalTime: number;
    averageTime: number;
    todayCount: number;
  };
}

const isToday = (date: Date | undefined): boolean => {
  if (!date) return false;

  // date가 Date 객체가 아닌 경우 Date 객체로 변환
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string" || typeof date === "number") {
    dateObj = new Date(date);
  } else {
    return false;
  }

  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      isActive: false,
      timeRemaining: DEFAULT_POMODORO_SETTINGS.workTime * 60,
      settings: DEFAULT_POMODORO_SETTINGS,

      startSession: (type, taskId) => {
        const duration =
          type === "work"
            ? get().settings.workTime
            : type === "short-break"
            ? get().settings.shortBreak
            : get().settings.longBreak;

        const newSession: PomodoroSession = {
          id: generateId(),
          type,
          taskId,
          duration,
          startTime: new Date(),
          isCompleted: false,
        };

        set({
          currentSession: newSession,
          isActive: true,
          timeRemaining: duration * 60,
        });
      },

      pauseSession: () => {
        set({ isActive: false });
      },

      resumeSession: () => {
        set({ isActive: true });
      },

      completeSession: () => {
        const { currentSession, sessions } = get();

        if (currentSession) {
          const completedSession: PomodoroSession = {
            ...currentSession,
            endTime: new Date(),
            isCompleted: true,
          };

          set({
            sessions: [...sessions, completedSession],
            currentSession: null,
            isActive: false,
            timeRemaining: 0,
          });

          const { settings } = get();
          const nextType =
            currentSession.type === "work"
              ? sessions.filter((s) => s.type === "work" && s.isCompleted)
                  .length %
                  4 ===
                3
                ? "long-break"
                : "short-break"
              : "work";

          if (
            (currentSession.type === "work" && settings.autoStartBreaks) ||
            (currentSession.type !== "work" && settings.autoStartPomodoros)
          ) {
            setTimeout(() => {
              get().startSession(nextType, currentSession.taskId);
            }, 1000);
          }
        }
      },

      cancelSession: () => {
        set({
          currentSession: null,
          isActive: false,
          timeRemaining: get().settings.workTime * 60,
        });
      },

      updateTimeRemaining: (time) => {
        set({ timeRemaining: time });

        if (time <= 0 && get().isActive) {
          get().completeSession();
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      getTodaySessions: () => {
        return get().sessions.filter((session) => isToday(session.startTime));
      },

      getCompletedSessions: () => {
        return get().sessions.filter((session) => session.isCompleted);
      },

      getSessionsByTask: (taskId) => {
        return get().sessions.filter(
          (session) => session.taskId === taskId && session.isCompleted
        );
      },

      getTotalFocusTime: () => {
        return get()
          .sessions.filter(
            (session) => session.type === "work" && session.isCompleted
          )
          .reduce((total, session) => total + session.duration, 0);
      },

      getSessionStats: () => {
        const { sessions } = get();
        const completed = sessions.filter((s) => s.isCompleted);
        const workSessions = completed.filter((s) => s.type === "work");
        const todaySessions = get().getTodaySessions();

        const totalTime = workSessions.reduce((sum, s) => sum + s.duration, 0);
        const averageTime =
          workSessions.length > 0 ? totalTime / workSessions.length : 0;

        return {
          completed: completed.length,
          totalTime,
          averageTime,
          todayCount: todaySessions.length,
        };
      },
    }),
    {
      name: STORAGE_KEYS.POMODORO_SESSIONS,
      partialize: (state) => ({
        sessions: state.sessions,
        settings: state.settings,
      }),
    }
  )
);
