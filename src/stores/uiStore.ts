/**
 * UI 상태 관리 스토어
 * 사이드바, 패널, 모달, 알림, 로딩 상태 등 UI 관련 상태를 중앙에서 관리
 * @module stores/uiStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * UI 상태 인터페이스
 * 레이아웃, 패널, 모달, 알림, 로딩 상태와 관련 액션들을 정의
 */
interface UIState {
  /** 레이아웃 상태 */
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  /** 패널 상태 */
  analysisPanelOpen: boolean;
  historyPanelOpen: boolean;
  settingsPanelOpen: boolean;

  /** 모달 상태 */
  modals: {
    apiSettings: boolean;
    about: boolean;
    help: boolean;
    export: boolean;
    import: boolean;
  };

  /** 알림 상태 */
  notifications: Array<{
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    timestamp: number;
    autoClose?: boolean;
    duration?: number;
  }>;

  /** 로딩 상태 */
  loadingStates: {
    [key: string]: boolean;
  };

  /** 액션들 */
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;

  toggleAnalysisPanel: () => void;
  setAnalysisPanelOpen: (open: boolean) => void;

  toggleHistoryPanel: () => void;
  setHistoryPanelOpen: (open: boolean) => void;

  toggleSettingsPanel: () => void;
  setSettingsPanelOpen: (open: boolean) => void;

  /** 모달 관리 */
  openModal: (modalName: keyof UIState["modals"]) => void;
  closeModal: (modalName: keyof UIState["modals"]) => void;
  closeAllModals: () => void;

  /** 알림 관리 */
  addNotification: (
    notification: Omit<UIState["notifications"][0], "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  /** 로딩 상태 관리 */
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;

  /** 유틸리티 */
  resetUI: () => void;
}

/**
 * UI 상태 관리 스토어
 * Zustand를 사용하여 UI 관련 상태를 관리하고 로컬 스토리지에 지속
 */
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      sidebarOpen: true,
      sidebarCollapsed: false,
      analysisPanelOpen: true,
      historyPanelOpen: false,
      settingsPanelOpen: false,

      modals: {
        apiSettings: false,
        about: false,
        help: false,
        export: false,
        import: false,
      },

      notifications: [],
      loadingStates: {},

      /**
       * 사이드바 관리
       * 사이드바 토글
       */
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      /**
       * 사이드바 열기/닫기 설정
       * @param open - 사이드바 열기 여부
       */
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleSidebarCollapsed: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      // 분석 패널 관리
      toggleAnalysisPanel: () => {
        set((state) => ({ analysisPanelOpen: !state.analysisPanelOpen }));
      },

      setAnalysisPanelOpen: (open: boolean) => {
        set({ analysisPanelOpen: open });
      },

      // 히스토리 패널 관리
      toggleHistoryPanel: () => {
        set((state) => ({ historyPanelOpen: !state.historyPanelOpen }));
      },

      setHistoryPanelOpen: (open: boolean) => {
        set({ historyPanelOpen: open });
      },

      // 설정 패널 관리
      toggleSettingsPanel: () => {
        set((state) => ({ settingsPanelOpen: !state.settingsPanelOpen }));
      },

      setSettingsPanelOpen: (open: boolean) => {
        set({ settingsPanelOpen: open });
      },

      // 모달 관리
      openModal: (modalName: keyof UIState["modals"]) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: true,
          },
        }));
      },

      closeModal: (modalName: keyof UIState["modals"]) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: false,
          },
        }));
      },

      closeAllModals: () => {
        set({
          modals: {
            apiSettings: false,
            about: false,
            help: false,
            export: false,
            import: false,
          },
        });
      },

      // 알림 관리
      addNotification: (notification) => {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newNotification = {
          ...notification,
          id,
          timestamp: Date.now(),
          autoClose: notification.autoClose ?? true,
          duration: notification.duration ?? 5000,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // 자동 제거
        if (newNotification.autoClose) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // 로딩 상태 관리
      setLoading: (key: string, loading: boolean) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading,
          },
        }));
      },

      isLoading: (key: string) => {
        const state = get();
        return state.loadingStates[key] || false;
      },

      // UI 초기화
      resetUI: () => {
        set({
          sidebarOpen: true,
          sidebarCollapsed: false,
          analysisPanelOpen: true,
          historyPanelOpen: false,
          settingsPanelOpen: false,
          modals: {
            apiSettings: false,
            about: false,
            help: false,
            export: false,
            import: false,
          },
          notifications: [],
          loadingStates: {},
        });
      },
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        // 레이아웃 상태만 영속화
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        analysisPanelOpen: state.analysisPanelOpen,
        historyPanelOpen: state.historyPanelOpen,
        settingsPanelOpen: state.settingsPanelOpen,
      }),
    }
  )
);
