import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskStatus } from "../types";
import { generateId } from "@/utils";
import { STORAGE_KEYS } from "@/constants";

/**
 * 할일 관리를 위한 Zustand 스토어 인터페이스
 * @interface TaskStore
 */
interface TaskStore {
  /** 모든 할일 목록 */
  tasks: Task[];
  /** 현재 선택된 할일 (편집용) */
  currentTask: Task | null;
  /** 할일 필터링 옵션 */
  filter: {
    /** 상태별 필터 (할일/진행중/완료) */
    status?: TaskStatus;
    /** 카테고리별 필터 */
    category?: string;
    /** 우선순위별 필터 */
    priority?: string;
    /** 검색어 필터 */
    search?: string;
  };

  // === 할일 관리 함수들 ===
  /** 새로운 할일 추가 */
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  /** 할일 정보 업데이트 */
  updateTask: (id: string, updates: Partial<Task>) => void;
  /** 할일 삭제 */
  deleteTask: (id: string) => void;
  /** 같은 상태 내에서 할일 순서 변경 */
  reorderTasks: (
    status: TaskStatus,
    oldIndex: number,
    newIndex: number
  ) => void;
  /** 할일 상태 토글 (할일 → 진행중 → 완료 → 할일) */
  toggleTaskStatus: (id: string) => void;
  /** 현재 선택된 할일 설정 */
  setCurrentTask: (task: Task | null) => void;

  // === 필터링 및 검색 함수들 ===
  /** 필터 조건 설정 */
  setFilter: (filter: Partial<TaskStore["filter"]>) => void;
  /** 필터링된 할일 목록 조회 */
  getFilteredTasks: () => Task[];
  /** 상태별 할일 목록 조회 */
  getTasksByStatus: (status: TaskStatus) => Task[];
  /** 카테고리별 할일 목록 조회 */
  getTasksByCategory: (category: string) => Task[];

  // === 특수 조회 함수들 ===
  /** 마감일이 지난 할일 목록 조회 */
  getOverdueTasks: () => Task[];
  /** 오늘 마감인 할일 목록 조회 */
  getTodayTasks: () => Task[];
  /** 향후 예정된 할일 목록 조회 */
  getUpcomingTasks: () => Task[];
  /** 완료된 할일 모두 삭제 */
  clearCompleted: () => void;
}

/**
 * 주어진 날짜가 오늘인지 확인하는 유틸리티 함수
 * @description 날짜 객체나 날짜 문자열을 받아 오늘 날짜와 비교합니다
 * @param {Date | undefined} date - 확인할 날짜
 * @returns {boolean} 오늘이면 true, 아니면 false
 */
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

const isOverdue = (date: Date | undefined): boolean => {
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

  return dateObj < new Date() && !isToday(date);
};

// 초기 샘플 데이터
const createSampleTasks = (): Task[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(10, 0, 0, 0);

  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(15, 30, 0, 0);

  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(11, 0, 0, 0);

  return [
    {
      id: "sample-1",
      title: "프로젝트 기획서 작성",
      description:
        "새로운 웹 애플리케이션 프로젝트의 기획서를 작성해야 합니다.",
      status: "in-progress",
      priority: "high",
      category: "업무",
      dueDate: tomorrow,
      estimatedTime: 120,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      tags: ["기획", "프로젝트", "중요"],
    },
    {
      id: "sample-2",
      title: "운동하기",
      description: "헬스장에서 1시간 운동하기",
      status: "todo",
      priority: "medium",
      category: "건강",
      dueDate: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      estimatedTime: 60,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      tags: ["헬스", "건강관리"],
    },
    {
      id: "sample-3",
      title: "장보기",
      description: "마트에서 생필품 구매",
      status: "todo",
      priority: "low",
      category: "쇼핑",
      dueDate: nextWeek,
      estimatedTime: 45,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      tags: ["생필품", "마트"],
    },
    {
      id: "sample-4",
      title: "친구와 저녁 약속",
      description: "대학교 친구와 저녁 식사",
      status: "done",
      priority: "medium",
      category: "약속",
      dueDate: yesterday,
      estimatedTime: 90,
      completedAt: new Date(yesterday.getTime() + 90 * 60 * 1000),
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: yesterday,
      tags: ["친구", "저녁"],
    },
    {
      id: "sample-5",
      title: "리액트 강의 수강",
      description: "온라인 리액트 강의 3강 수강하기",
      status: "todo",
      priority: "urgent",
      category: "학습",
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      estimatedTime: 180,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 10 * 60 * 1000),
      tags: ["리액트", "온라인강의", "개발"],
    },
    {
      id: "sample-6",
      title: "병원 예약 (놓친 일정)",
      description: "3일 전 치과 예약이었는데 놓쳤음",
      status: "todo",
      priority: "high",
      category: "건강",
      dueDate: threeDaysAgo,
      estimatedTime: 60,
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      tags: ["치과", "예약", "놓침"],
    },
    {
      id: "sample-7",
      title: "지난주 회의 자료 정리",
      description: "지난주 팀 회의 자료를 정리해야 함",
      status: "todo",
      priority: "medium",
      category: "업무",
      dueDate: lastWeek,
      estimatedTime: 90,
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      tags: ["회의", "자료정리", "팀"],
    },
    {
      id: "sample-8",
      title: "8월14일 홍콩여행",
      description: "홍콩 여행 계획",
      status: "todo",
      priority: "medium",
      category: "개인",
      dueDate: new Date(2025, 7, 14, 10, 0, 0), // 2025년 8월 14일
      estimatedTime: 480, // 8시간
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      tags: ["여행", "홍콩", "휴가"],
    },
  ];
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTask: null,
      filter: {},

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          currentTask: state.currentTask?.id === id ? null : state.currentTask,
        }));
      },

      reorderTasks: (status, oldIndex, newIndex) => {
        set((state) => {
          // 해당 상태의 tasks만 필터링
          const statusTasks = state.tasks.filter(
            (task) => task.status === status
          );
          const otherTasks = state.tasks.filter(
            (task) => task.status !== status
          );

          // 배열 순서 변경
          const reorderedTasks = [...statusTasks];
          const [movedTask] = reorderedTasks.splice(oldIndex, 1);
          reorderedTasks.splice(newIndex, 0, movedTask);

          // 전체 tasks 배열 재구성
          return {
            tasks: [...otherTasks, ...reorderedTasks],
          };
        });
      },

      toggleTaskStatus: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        let newStatus: TaskStatus;
        if (task.status === "todo") {
          newStatus = "in-progress";
        } else if (task.status === "in-progress") {
          newStatus = "done";
        } else {
          newStatus = "todo";
        }

        const updates: Partial<Task> = {
          status: newStatus,
          updatedAt: new Date(),
        };

        if (newStatus === "done") {
          updates.completedAt = new Date();
        } else if (task.completedAt) {
          updates.completedAt = undefined;
        }

        get().updateTask(id, updates);
      },

      setCurrentTask: (task) => {
        set({ currentTask: task });
      },

      setFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }));
      },

      getFilteredTasks: () => {
        const { tasks, filter } = get();

        return tasks.filter((task) => {
          if (filter.status && task.status !== filter.status) return false;
          if (filter.category && task.category !== filter.category)
            return false;
          if (filter.priority && task.priority !== filter.priority)
            return false;
          if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            return (
              task.title.toLowerCase().includes(searchLower) ||
              task.description?.toLowerCase().includes(searchLower) ||
              task.tags.some((tag) => tag.toLowerCase().includes(searchLower))
            );
          }
          return true;
        });
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status);
      },

      getTasksByCategory: (category) => {
        return get().tasks.filter((task) => task.category === category);
      },

      getOverdueTasks: () => {
        return get().tasks.filter(
          (task) => isOverdue(task.dueDate) && task.status !== "done"
        );
      },

      getTodayTasks: () => {
        return get().tasks.filter((task) => isToday(task.dueDate));
      },

      getUpcomingTasks: () => {
        const today = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(today.getDate() + 7);

        return get().tasks.filter((task) => {
          if (!task.dueDate || task.status === "done") return false;

          // dueDate가 Date 객체가 아닌 경우 Date 객체로 변환
          let dueDateObj: Date;
          if (task.dueDate instanceof Date) {
            dueDateObj = task.dueDate;
          } else if (
            typeof task.dueDate === "string" ||
            typeof task.dueDate === "number"
          ) {
            dueDateObj = new Date(task.dueDate);
          } else {
            return false;
          }

          // 유효한 날짜인지 확인
          if (isNaN(dueDateObj.getTime())) {
            return false;
          }

          return dueDateObj > today && dueDateObj <= weekFromNow;
        });
      },

      clearCompleted: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.status !== "done"),
        }));
      },
    }),
    {
      name: STORAGE_KEYS.TASKS,
      partialize: (state) => ({ tasks: state.tasks }),
      onRehydrateStorage: () => (state) => {
        // 저장된 데이터가 없거나 비어있을 때 샘플 데이터 추가
        if (!state || !state.tasks || state.tasks.length === 0) {
          const sampleTasks = createSampleTasks();
          state && (state.tasks = sampleTasks);
        } else {
          // 새로운 샘플 데이터가 추가되었는지 확인 (sample-6, sample-7, sample-8)
          const hasSample6 = state.tasks.some((t) => t.id === "sample-6");
          const hasSample7 = state.tasks.some((t) => t.id === "sample-7");
          const hasSample8 = state.tasks.some((t) => t.id === "sample-8");

          if (!hasSample6 || !hasSample7 || !hasSample8) {
            const sampleTasks = createSampleTasks();
            // 기존 샘플과 새로운 샘플을 병합
            const existingIds = new Set(state.tasks.map((t) => t.id));
            const newSamples = sampleTasks.filter(
              (t) => !existingIds.has(t.id)
            );
            state.tasks.push(...newSamples);
          }

          // 로컬 스토리지에서 불러온 데이터의 날짜 필드들을 Date 객체로 변환
          state.tasks.forEach((task) => {
            if (task.dueDate && !(task.dueDate instanceof Date)) {
              task.dueDate = new Date(task.dueDate);
            }
            if (task.createdAt && !(task.createdAt instanceof Date)) {
              task.createdAt = new Date(task.createdAt);
            }
            if (task.updatedAt && !(task.updatedAt instanceof Date)) {
              task.updatedAt = new Date(task.updatedAt);
            }
            if (task.completedAt && !(task.completedAt instanceof Date)) {
              task.completedAt = new Date(task.completedAt);
            }
          });
        }
      },
    }
  )
);
