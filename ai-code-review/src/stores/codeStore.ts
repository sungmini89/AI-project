/**
 * 코드 편집 및 관리 상태 스토어
 * 코드 내용, 프로그래밍 언어, 에디터 설정, 코드 히스토리를 관리
 * @module stores/codeStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupportedLanguage, CodeHistory, EditorState } from "../types";
import config from "../config";

/**
 * 코드 상태 인터페이스
 * 현재 코드, 언어, 에디터 설정, 히스토리와 관련 액션들을 정의
 */
interface CodeState {
  /** 현재 에디터 상태 */
  currentCode: string;
  /** 현재 프로그래밍 언어 */
  currentLanguage: SupportedLanguage;
  /** 에디터 설정 */
  editorSettings: EditorState;

  /** 코드 히스토리 */
  history: CodeHistory[];

  /** 액션들 */
  setCode: (code: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
  updateEditorSettings: (settings: Partial<EditorState>) => void;
  saveToHistory: (title?: string) => void;
  loadFromHistory: (id: string) => void;
  deleteFromHistory: (id: string) => void;
  toggleBookmark: (id: string) => void;
  clearHistory: () => void;

  /** 유틸리티 */
  getHistoryById: (id: string) => CodeHistory | undefined;
  getBookmarkedHistory: () => CodeHistory[];
  getRecentHistory: (limit?: number) => CodeHistory[];
}

/**
 * 기본 에디터 설정
 * 새로운 사용자를 위한 초기 에디터 설정값
 */
const DEFAULT_EDITOR_SETTINGS: EditorState = {
  value: "",
  language: "javascript",
  theme: "vs-light",
  fontSize: 14,
  wordWrap: "on",
  minimap: true,
};

/**
 * 코드 상태 관리 스토어
 * Zustand를 사용하여 코드 관련 상태를 관리하고 로컬 스토리지에 지속
 */
export const useCodeStore = create<CodeState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentCode: "",
      currentLanguage: "javascript",
      editorSettings: DEFAULT_EDITOR_SETTINGS,
      history: [],

      /**
       * 코드 설정
       * @param code - 설정할 코드 내용
       */
      setCode: (code: string) => {
        set((state) => ({
          currentCode: code,
          editorSettings: {
            ...state.editorSettings,
            value: code,
          },
        }));
      },

      /**
       * 프로그래밍 언어 설정
       * @param language - 설정할 프로그래밍 언어
       */
      setLanguage: (language: SupportedLanguage) => {
        set((state) => ({
          currentLanguage: language,
          editorSettings: {
            ...state.editorSettings,
            language,
          },
        }));
      },

      /**
       * 에디터 설정 업데이트
       * @param settings - 업데이트할 에디터 설정들
       */
      updateEditorSettings: (settings: Partial<EditorState>) => {
        set((state) => ({
          editorSettings: {
            ...state.editorSettings,
            ...settings,
          },
        }));
      },

      /**
       * 히스토리 관리
       * @param title - 저장할 코드의 제목 (선택사항)
       */
      saveToHistory: (title?: string) => {
        const state = get();
        const { currentCode, currentLanguage } = state;

        if (!currentCode.trim()) {
          return; // 빈 코드는 저장하지 않음
        }

        const newEntry: CodeHistory = {
          id: `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          language: currentLanguage,
          title:
            title ||
            `${currentLanguage} 코드 - ${new Date().toLocaleString("ko-KR")}`,
          code: currentCode,
          bookmarked: false,
        };

        set((state) => ({
          history: [newEntry, ...state.history.slice(0, 99)], // 최대 100개까지 저장
        }));
      },

      loadFromHistory: (id: string) => {
        const state = get();
        const entry = state.history.find((h) => h.id === id);

        if (entry) {
          set({
            currentCode: entry.code,
            currentLanguage: entry.language,
            editorSettings: {
              ...state.editorSettings,
              value: entry.code,
              language: entry.language,
            },
          });
        }
      },

      deleteFromHistory: (id: string) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        }));
      },

      toggleBookmark: (id: string) => {
        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, bookmarked: !h.bookmarked } : h
          ),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      // 유틸리티 함수들
      getHistoryById: (id: string) => {
        const state = get();
        return state.history.find((h) => h.id === id);
      },

      getBookmarkedHistory: () => {
        const state = get();
        return state.history.filter((h) => h.bookmarked);
      },

      getRecentHistory: (limit = 10) => {
        const state = get();
        return state.history
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
      },
    }),
    {
      name: config.storage.keys.codeHistory,
      partialize: (state) => ({
        // 에디터 설정과 히스토리만 영속화
        editorSettings: state.editorSettings,
        history: state.history,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 마이그레이션 로직 (필요시)
          return {
            ...persistedState,
            editorSettings: {
              ...DEFAULT_EDITOR_SETTINGS,
              ...persistedState.editorSettings,
            },
          };
        }
        return persistedState;
      },
    }
  )
);
