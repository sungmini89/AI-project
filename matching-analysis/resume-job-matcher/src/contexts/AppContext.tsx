/**
 * @fileoverview 애플리케이션의 전역 상태 관리 컨텍스트
 * @description React Context API와 useReducer를 사용하여 애플리케이션의 전역 상태를 관리합니다.
 * 파일 업로드, 채용공고 입력, 분석 결과 등의 상태를 중앙에서 관리합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import React, { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type {
  AnalysisResult,
  AnalysisOptions,
  FileUploadState,
  JobDescriptionState,
} from "@/types/analysis";

/**
 * 애플리케이션의 전역 상태 인터페이스
 * @description 애플리케이션에서 관리하는 모든 상태 정보를 정의합니다.
 */
interface AppState {
  /** 파일 업로드 관련 상태 */
  fileUpload: FileUploadState;
  /** 채용공고 입력 관련 상태 */
  jobDescription: JobDescriptionState;
  /** 분석 결과 관련 상태 */
  analysis: {
    result: AnalysisResult | null;
    analyzing: boolean;
    error: string | null;
  };
  /** 애플리케이션 설정 관련 상태 */
  settings: {
    options: AnalysisOptions;
    theme: "light" | "dark";
  };
}

/**
 * 애플리케이션 상태 변경 액션 타입
 * @description useReducer에서 사용하는 액션들의 유니온 타입을 정의합니다.
 */
type AppAction =
  | { type: "SET_FILE_UPLOAD"; payload: Partial<FileUploadState> }
  | { type: "SET_JOB_DESCRIPTION"; payload: Partial<JobDescriptionState> }
  | { type: "SET_ANALYSIS"; payload: Partial<AppState["analysis"]> }
  | { type: "SET_SETTINGS"; payload: Partial<AppState["settings"]> }
  | { type: "RESET_STATE" };

/**
 * 애플리케이션의 초기 상태
 * @description 모든 상태의 기본값을 정의합니다.
 */
const initialState: AppState = {
  fileUpload: {
    file: null,
    text: "",
    uploading: false,
    processing: false,
    error: null,
    progress: 0,
  },
  jobDescription: {
    text: "",
    wordCount: 0,
    isValid: false,
    keywords: [],
  },
  analysis: {
    result: null,
    analyzing: false,
    error: null,
  },
  settings: {
    options: {
      mode: "mock",
      depth: "standard",
      language: "ko",
      analysisDepth: "standard",
      useAI: false,
      includeATS: true,
    },
    theme: "light",
  },
};

/**
 * 애플리케이션 상태 리듀서 함수
 * @description 상태 변경 액션에 따라 새로운 상태를 반환합니다.
 *
 * @param {AppState} state - 현재 상태
 * @param {AppAction} action - 수행할 액션
 * @returns {AppState} 새로운 상태
 *
 * @example
 * ```tsx
 * const [state, dispatch] = useReducer(appReducer, initialState);
 * dispatch({ type: 'SET_FILE_UPLOAD', payload: { file: newFile } });
 * ```
 */
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_FILE_UPLOAD":
      return {
        ...state,
        fileUpload: { ...state.fileUpload, ...action.payload },
      };
    case "SET_JOB_DESCRIPTION":
      return {
        ...state,
        jobDescription: { ...state.jobDescription, ...action.payload },
      };
    case "SET_ANALYSIS":
      return {
        ...state,
        analysis: { ...state.analysis, ...action.payload },
      };
    case "SET_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
};

/**
 * 애플리케이션 컨텍스트
 * @description 전역 상태와 디스패치 함수를 제공하는 React Context입니다.
 */
const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
    }
  | undefined
>(undefined);

/**
 * 애플리케이션 컨텍스트 제공자 컴포넌트
 * @description 하위 컴포넌트들에게 전역 상태와 디스패치 함수를 제공합니다.
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {ReactNode} props.children - 하위 컴포넌트들
 * @returns {JSX.Element} 컨텍스트 제공자 컴포넌트
 *
 * @example
 * ```tsx
 * <AppProvider>
 *   <App />
 * </AppProvider>
 * ```
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * 애플리케이션 컨텍스트 사용 훅
 * @description 컴포넌트에서 전역 상태와 디스패치 함수에 접근할 수 있게 해줍니다.
 *
 * @returns {Object} state와 dispatch를 포함한 컨텍스트 값
 * @throws {Error} AppProvider 외부에서 사용할 경우 에러를 발생시킵니다.
 *
 * @example
 * ```tsx
 * const { state, dispatch } = useAppContext();
 * dispatch({ type: 'SET_FILE_UPLOAD', payload: { file: newFile } });
 * ```
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
