/**
 * @fileoverview 파일 업로드 상태 관리 훅
 * @description PDF 파일 업로드와 텍스트 추출 과정의 상태를 관리하는 React 훅입니다.
 * 파일 검증, 업로드 진행률, 텍스트 추출, 오류 처리 등의 기능을 제공합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import { useState, useCallback } from "react";
import { PDFParser } from "@/services/pdf-parser";
import type { FileUploadState } from "@/types/analysis";

/**
 * 파일 업로드 상태 관리 훅
 * @description PDF 파일 업로드와 텍스트 추출 과정의 상태를 관리합니다.
 * 파일 검증, 업로드 진행률 추적, 오류 처리 등의 기능을 제공합니다.
 *
 * @returns {Object} 파일 업로드 관련 상태와 함수들을 포함한 객체
 *
 * @example
 * ```tsx
 * const {
 *   file,
 *   text,
 *   uploading,
 *   processing,
 *   error,
 *   uploadFile,
 *   clearFile
 * } = useFileUpload();
 *
 * const handleFileSelect = (file) => {
 *   uploadFile(file).then(result => {
 *     console.log('추출된 텍스트:', result.text);
 *   });
 * };
 * ```
 */
export const useFileUpload = () => {
  /**
   * 파일 업로드 상태
   * @description 파일 업로드 과정의 모든 상태 정보를 관리합니다.
   */
  const [state, setState] = useState<FileUploadState>({
    file: null,
    text: "",
    uploading: false,
    processing: false,
    error: null,
    progress: 0,
  });

  /**
   * 파일 업로드 및 텍스트 추출 함수
   * @description 선택된 파일을 검증하고 업로드한 후 PDF에서 텍스트를 추출합니다.
   *
   * @param {File} file - 업로드할 PDF 파일
   * @returns {Promise<{text: string, error?: string}>} 텍스트 추출 결과
   * @throws {Error} 파일 검증 실패 또는 텍스트 추출 오류 시
   *
   * @example
   * ```tsx
   * try {
   *   const result = await uploadFile(selectedFile);
   *   console.log('추출된 텍스트:', result.text);
   * } catch (error) {
   *   console.error('업로드 실패:', error.message);
   * }
   * ```
   */
  const uploadFile = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, uploading: true, error: null }));

    try {
      // 파일 검증
      const validation = PDFParser.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      setState((prev) => ({
        ...prev,
        file,
        uploading: false,
        processing: true,
      }));

      // PDF 텍스트 추출
      const result = await PDFParser.parseFile(file);

      if (result.error) {
        throw new Error(result.error);
      }

      setState((prev) => ({
        ...prev,
        text: result.text,
        processing: false,
        error: null,
      }));

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "파일 처리 중 오류가 발생했습니다.";
      setState((prev) => ({
        ...prev,
        uploading: false,
        processing: false,
        error: errorMessage,
        file: null,
        text: "",
      }));
      throw error;
    }
  }, []);

  /**
   * 파일 상태 초기화 함수
   * @description 업로드된 파일과 추출된 텍스트를 모두 제거하고 상태를 초기화합니다.
   *
   * @example
   * ```tsx
   * const handleClear = () => {
   *   clearFile();
   * };
   * ```
   */
  const clearFile = useCallback(() => {
    setState({
      file: null,
      text: "",
      uploading: false,
      processing: false,
      error: null,
      progress: 0,
    });
  }, []);

  /**
   * 파일 업로드 재시도 함수
   * @description 이전에 업로드했던 파일을 다시 업로드합니다.
   * 파일이 존재하는 경우에만 동작합니다.
   *
   * @example
   * ```tsx
   * const handleRetry = () => {
   *   retryUpload();
   * };
   * ```
   */
  const retryUpload = useCallback(() => {
    if (state.file) {
      uploadFile(state.file);
    }
  }, [state.file, uploadFile]);

  return {
    ...state,
    uploadFile,
    clearFile,
    retryUpload,
    /** 파일이 업로드되었는지 여부 */
    hasFile: !!state.file,
    /** 텍스트가 추출되었는지 여부 */
    hasText: !!state.text,
    /** 파일 처리 중인지 여부 (업로드 또는 텍스트 추출) */
    isProcessing: state.uploading || state.processing,
  };
};
