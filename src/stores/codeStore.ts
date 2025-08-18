// 코드 편집 및 관리 상태 스토어

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  SupportedLanguage, 
  CodeHistory, 
  EditorState 
} from '../types';
import config from '../config';

interface CodeState {
  // 현재 에디터 상태
  currentCode: string;
  currentLanguage: SupportedLanguage;
  editorSettings: EditorState;
  
  // 코드 히스토리
  history: CodeHistory[];
  
  // 액션들
  setCode: (code: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
  updateEditorSettings: (settings: Partial<EditorState>) => void;
  saveToHistory: (title?: string) => void;
  loadFromHistory: (id: string) => void;
  deleteFromHistory: (id: string) => void;
  toggleBookmark: (id: string) => void;
  clearHistory: () => void;
  
  // 유틸리티
  getHistoryById: (id: string) => CodeHistory | undefined;
  getBookmarkedHistory: () => CodeHistory[];
  getRecentHistory: (limit?: number) => CodeHistory[];
}

const DEFAULT_EDITOR_SETTINGS: EditorState = {
  value: '',
  language: 'javascript',
  theme: 'vs-light',
  fontSize: 14,
  wordWrap: 'on',
  minimap: true
};

export const useCodeStore = create<CodeState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentCode: '',
      currentLanguage: 'javascript',
      editorSettings: DEFAULT_EDITOR_SETTINGS,
      history: [],

      // 코드 설정
      setCode: (code: string) => {
        set((state) => ({
          currentCode: code,
          editorSettings: {
            ...state.editorSettings,
            value: code
          }
        }));
      },

      setLanguage: (language: SupportedLanguage) => {
        set((state) => ({
          currentLanguage: language,
          editorSettings: {
            ...state.editorSettings,
            language
          }
        }));
      },

      updateEditorSettings: (settings: Partial<EditorState>) => {
        set((state) => ({
          editorSettings: {
            ...state.editorSettings,
            ...settings
          }
        }));
      },

      // 히스토리 관리
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
          title: title || `${currentLanguage} 코드 - ${new Date().toLocaleString('ko-KR')}`,
          code: currentCode,
          bookmarked: false
        };

        set((state) => ({
          history: [newEntry, ...state.history.slice(0, 99)] // 최대 100개까지 저장
        }));
      },

      loadFromHistory: (id: string) => {
        const state = get();
        const entry = state.history.find(h => h.id === id);
        
        if (entry) {
          set({
            currentCode: entry.code,
            currentLanguage: entry.language,
            editorSettings: {
              ...state.editorSettings,
              value: entry.code,
              language: entry.language
            }
          });
        }
      },

      deleteFromHistory: (id: string) => {
        set((state) => ({
          history: state.history.filter(h => h.id !== id)
        }));
      },

      toggleBookmark: (id: string) => {
        set((state) => ({
          history: state.history.map(h => 
            h.id === id ? { ...h, bookmarked: !h.bookmarked } : h
          )
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      // 유틸리티 함수들
      getHistoryById: (id: string) => {
        const state = get();
        return state.history.find(h => h.id === id);
      },

      getBookmarkedHistory: () => {
        const state = get();
        return state.history.filter(h => h.bookmarked);
      },

      getRecentHistory: (limit = 10) => {
        const state = get();
        return state.history
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
      }
    }),
    {
      name: config.storage.keys.codeHistory,
      partialize: (state) => ({
        // 에디터 설정과 히스토리만 영속화
        editorSettings: state.editorSettings,
        history: state.history
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 마이그레이션 로직 (필요시)
          return {
            ...persistedState,
            editorSettings: {
              ...DEFAULT_EDITOR_SETTINGS,
              ...persistedState.editorSettings
            }
          };
        }
        return persistedState;
      }
    }
  )
);