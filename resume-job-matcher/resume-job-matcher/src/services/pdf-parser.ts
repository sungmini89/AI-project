/**
 * @fileoverview PDF 파싱 서비스 클래스
 * @description PDF 파일에서 텍스트를 추출하고 메타데이터를 파싱하는 서비스입니다.
 * PDF.js 라이브러리를 사용하여 클라이언트 사이드에서 PDF 처리가 가능하며,
 * 파일 검증, 텍스트 추출, 메타데이터 추출 등의 기능을 제공합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * PDF 파싱 결과 인터페이스
 * @description PDF 파싱 작업의 결과를 담는 객체입니다.
 */
export interface PDFParsingResult {
  /** 추출된 텍스트 내용 */
  text: string;
  /** PDF 페이지 수 */
  pageCount: number;
  /** PDF 메타데이터 (선택사항) */
  metadata?: any;
  /** 파싱 오류 메시지 (선택사항) */
  error?: string;
}

/**
 * PDF 파싱 서비스 클래스
 * @description PDF 파일을 파싱하여 텍스트와 메타데이터를 추출하는 정적 메서드들을 제공합니다.
 * 파일 검증, 텍스트 추출, 메타데이터 추출 등의 기능을 포함합니다.
 *
 * @example
 * ```tsx
 * // PDF 파일 파싱
 * const result = await PDFParser.parseFile(file);
 * if (!result.error) {
 *   console.log('추출된 텍스트:', result.text);
 *   console.log('페이지 수:', result.pageCount);
 * }
 *
 * // 파일 검증
 * const validation = PDFParser.validateFile(file);
 * if (validation.isValid) {
 *   // 파일 처리 진행
 * }
 * ```
 */
export class PDFParser {
  /**
   * PDF 파일을 파싱하여 텍스트를 추출하는 함수
   * @description PDF.js를 사용하여 파일에서 모든 페이지의 텍스트를 추출합니다.
   *
   * @param {File} file - 파싱할 PDF 파일
   * @returns {Promise<PDFParsingResult>} 파싱 결과 객체
   *
   * @throws {Error} PDF 로딩 또는 텍스트 추출 실패 시
   *
   * @example
   * ```tsx
   * try {
   *   const result = await PDFParser.parseFile(pdfFile);
   *   if (result.error) {
   *     console.error('파싱 오류:', result.error);
   *   } else {
   *     setExtractedText(result.text);
   *   }
   * } catch (error) {
   *   console.error('PDF 처리 실패:', error);
   * }
   * ```
   */
  static async parseFile(file: File): Promise<PDFParsingResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      const pageCount = pdf.numPages;

      // 모든 페이지의 텍스트를 추출
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        fullText += pageText + "\n";
      }

      // 메타데이터 추출
      const metadata = await pdf.getMetadata();

      return {
        text: fullText.trim(),
        pageCount,
        metadata: metadata.info,
      };
    } catch (error) {
      console.error("PDF parsing error:", error);
      return {
        text: "",
        pageCount: 0,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * PDF 파일 유효성을 검증하는 함수
   * @description 파일 타입과 크기를 검증하여 업로드 가능한지 확인합니다.
   *
   * @param {File} file - 검증할 파일
   * @returns {{isValid: boolean, error?: string}} 검증 결과 객체
   *
   * @example
   * ```tsx
   * const validation = PDFParser.validateFile(selectedFile);
   * if (!validation.isValid) {
   *   alert(validation.error);
   *   return;
   * }
   * // 파일 처리 진행
   * ```
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // 파일 타입 검증
    if (file.type !== "application/pdf") {
      return { isValid: false, error: "PDF 파일만 업로드 가능합니다." };
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "파일 크기는 10MB를 초과할 수 없습니다.",
      };
    }

    return { isValid: true };
  }

  /**
   * PDF 파일의 메타데이터를 추출하는 함수
   * @description PDF 파일의 제목, 작성자, 주제, 생성일 등의 메타데이터를 추출합니다.
   *
   * @param {File} file - 메타데이터를 추출할 PDF 파일
   * @returns {Promise<Object | null>} 메타데이터 객체 또는 null (실패 시)
   *
   * @example
   * ```tsx
   * const metadata = await PDFParser.extractMetadata(pdfFile);
   * if (metadata) {
   *   console.log('제목:', metadata.title);
   *   console.log('작성자:', metadata.author);
   *   console.log('페이지 수:', metadata.pageCount);
   * }
   * ```
   */
  static async extractMetadata(file: File) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const metadata = await pdf.getMetadata();

      return {
        title: (metadata.info as any)?.Title || file.name,
        author: (metadata.info as any)?.Author || "Unknown",
        subject: (metadata.info as any)?.Subject || "",
        creator: (metadata.info as any)?.Creator || "",
        producer: (metadata.info as any)?.Producer || "",
        creationDate: (metadata.info as any)?.CreationDate || null,
        modificationDate: (metadata.info as any)?.ModDate || null,
        pageCount: pdf.numPages,
        fileSize: file.size,
      };
    } catch (error) {
      console.error("Metadata extraction error:", error);
      return null;
    }
  }
}
