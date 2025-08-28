import { TextDocument } from "@/types";
import SecurityUtils from "../utils/security";
import MonitoringService from "../utils/monitoring";

/**
 * PDF 파일 처리 서비스
 * PDF.js를 사용하여 PDF 파일에서 텍스트를 추출하고 한국어 텍스트를 최적화합니다.
 */
export class PDFProcessor {
  private maxProcessingTime = 60000; // 60초
  private maxMemoryUsage = 100 * 1024 * 1024; // 100MB

  /**
   * PDF 파일에서 텍스트를 추출합니다.
   * 3단계 fallback 시스템을 사용하여 최적의 텍스트 추출을 시도합니다.
   * @param {File} file - 처리할 PDF 파일
   * @returns {Promise<string>} 추출된 텍스트
   * @throws {Error} 파일 검증 실패, 메모리 제한 초과, 처리 시간 초과 등
   */
  async extractTextFromPDF(file: File): Promise<string> {
    const startTime = Date.now();
    
    console.log("PDF 텍스트 추출 시작:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
    });

    try {
      // 보안 검증
      if (!await SecurityUtils.validateFileSignature(file)) {
        throw new Error("유효하지 않은 PDF 파일 서명입니다.");
      }

      if (!SecurityUtils.validateFileSize(file, 50)) {
        throw new Error("파일 크기가 제한을 초과합니다. (최대 50MB)");
      }

      // PDF.js를 사용한 실제 PDF 텍스트 추출
      const arrayBuffer = await file.arrayBuffer();
      console.log("ArrayBuffer 크기:", arrayBuffer.byteLength, "bytes");

      // 메모리 사용량 체크
      if (arrayBuffer.byteLength > this.maxMemoryUsage) {
        throw new Error("파일이 메모리 사용량 제한을 초과합니다.");
      }

      // 첫 16바이트 확인하여 PDF 파일인지 검증
      const firstBytes = new Uint8Array(arrayBuffer, 0, 16);
      const header = new TextDecoder("ascii").decode(firstBytes);
      console.log("파일 헤더:", header);

      if (!header.startsWith("%PDF")) {
        throw new Error("유효하지 않은 PDF 파일입니다.");
      }

      // PDF.js 동적 로딩 (Vite 환경에서 작동하도록 최적화)
      const pdfjsLib = await this.loadPDFJS();
      console.log("PDF.js 로딩 완료, PDF 문서 파싱 시작...");

      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      console.log("PDF 문서 로딩 완료, 총 페이지 수:", pdf.numPages);

      let fullText = "";
      let extractedPages = 0;

      // 모든 페이지에서 텍스트 추출
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`페이지 ${i}/${pdf.numPages} 처리 중...`);

        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          console.log(`페이지 ${i} 텍스트 항목 수:`, textContent.items.length);

          // 더 안정적인 텍스트 추출 방식 - PDF.js의 기본 방식 사용
          let pageText = "";
          
          // 방법 1: PDF.js의 기본 텍스트 추출 시도
          try {
            const textItems = textContent.items.map((item: any) => item.str || "").join(" ");
            if (textItems.trim().length > 0) {
              pageText = textItems;
            }
          } catch (basicError) {
            console.log("기본 텍스트 추출 실패, 고급 방식 시도...");
          }
          
          // 방법 2: 기본 방식이 실패하면 위치 기반 처리
          if (pageText.trim().length === 0) {
            const processedItems = textContent.items
              .map((item: any) => {
                const text = item.str || "";
                if (typeof text === "string" && text.trim().length > 0) {
                  return {
                    text: text.trim(),
                    x: item.transform[4] || 0,
                    y: item.transform[5] || 0,
                    width: item.width || 0
                  };
                }
                return null;
              })
              .filter((item: any) => item !== null)
              .sort((a: any, b: any) => {
                // Y좌표 차이가 5 이상이면 다른 줄
                const yDiff = Math.abs(b.y - a.y);
                if (yDiff > 5) {
                  return b.y - a.y; // 위에서 아래로
                }
                return a.x - b.x; // 같은 줄이면 왼쪽에서 오른쪽으로
              });
            
            // 간단한 텍스트 결합
            let prevY = null;
            const lines: string[] = [];
            let currentLine = "";
            
            for (const item of processedItems) {
              if (prevY !== null && Math.abs(prevY - item.y) > 5) {
                // 새 줄
                if (currentLine.trim()) {
                  lines.push(currentLine.trim());
                }
                currentLine = item.text;
              } else {
                // 같은 줄
                if (currentLine && !currentLine.endsWith(" ") && !item.text.startsWith(" ")) {
                  currentLine += " ";
                }
                currentLine += item.text;
              }
              prevY = item.y;
            }
            
            if (currentLine.trim()) {
              lines.push(currentLine.trim());
            }
            
            pageText = lines.join("\n");
          }
          
          // 방법 3: 그래도 실패하면 단순 결합
          if (pageText.trim().length === 0) {
            pageText = textContent.items
              .map((item: any) => (item.str || "").trim())
              .filter((text: string) => text.length > 0)
              .join(" ");
          }

          console.log(`페이지 ${i} 추출된 텍스트 길이:`, pageText.length);

          if (pageText.trim().length > 0) {
            fullText += pageText + "\n\n";
            extractedPages++;
          }
        } catch (pageError) {
          console.warn(`페이지 ${i} 처리 중 오류 발생:`, pageError);
          // 개별 페이지 오류는 무시하고 계속 진행
        }
      }

      console.log(
        "전체 텍스트 추출 완료, 총 길이:",
        fullText.length,
        "추출된 페이지:",
        extractedPages
      );

      // 텍스트 추출 실패 시 더 자세한 에러 메시지
      if (fullText.trim().length === 0) {
        throw new Error(`PDF에서 텍스트를 추출할 수 없습니다.

📋 파일 정보:
• 총 페이지 수: ${pdf.numPages}페이지
• 처리된 페이지: ${extractedPages}페이지
• 파일 크기: ${(file.size / 1024 / 1024).toFixed(1)}MB

🔍 가능한 원인:
• 이미지로만 구성된 PDF (스캔된 문서)
• 보호된 PDF (편집/복사 제한)
• 폰트 임베딩 문제
• 특수한 인코딩 방식

💡 해결 방법:
• PDF를 텍스트로 내보내기 후 .txt 파일로 업로드
• OCR 기능이 있는 PDF 변환기 사용
• 다른 PDF 파일로 시도`);
      }

      // 최소 텍스트 길이 확인 (플래시카드 생성에 필요한 최소량)
      if (fullText.trim().length < 100) {
        console.warn(`추출된 텍스트가 짧습니다 (${fullText.trim().length}자). 플래시카드 생성이 제한될 수 있습니다.`);
      }
      
      // 텍스트 품질 정보 제공
      const textStats = {
        totalLength: fullText.length,
        cleanLength: fullText.trim().length,
        lineCount: fullText.split('\n').filter(line => line.trim().length > 0).length,
        wordCount: fullText.trim().split(/\s+/).length,
        koreanCharCount: (fullText.match(/[가-힣]/g) || []).length
      };
      
      console.log("📊 텍스트 추출 통계:", {
        "전체 길이": textStats.totalLength + "자",
        "정리된 길이": textStats.cleanLength + "자", 
        "줄 수": textStats.lineCount + "줄",
        "단어 수": textStats.wordCount + "개",
        "한글 문자": textStats.koreanCharCount + "자"
      });

      const cleanedText = this.cleanExtractedText(fullText);
      const sanitizedText = SecurityUtils.sanitizeText(cleanedText);
      
      // 처리 시간 체크
      const processingTime = Date.now() - startTime;
      if (processingTime > this.maxProcessingTime) {
        MonitoringService.captureMessage(`PDF 처리 시간 초과: ${processingTime}ms`, 'warning');
      }
      
      console.log("텍스트 정리 및 보안 검증 완료, 최종 길이:", sanitizedText.length);

      return sanitizedText;
    } catch (error) {
      MonitoringService.captureError(error as Error, { 
        fileName: file.name, 
        fileSize: file.size,
        processingTime: Date.now() - startTime 
      });
      console.error("PDF 처리 실패:", {
        error: error,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      throw new Error(`PDF 파일 처리 실패: ${errorMessage}`);
    }
  }

  /**
   * PDF.js 라이브러리를 동적으로 로드합니다.
   * Vite 환경에서 작동하도록 최적화되어 있습니다.
   * @private
   * @returns {Promise<any>} PDF.js 라이브러리 인스턴스
   * @throws {Error} PDF.js 로드 실패 시
   */
  private async loadPDFJS(): Promise<any> {
    // PDF.js 라이브러리 동적 로딩
    try {
      console.log("PDF.js 라이브러리 로딩 시도...");

      // ES 모듈로 PDF.js 로딩 시도
      const pdfjsLib = await import("pdfjs-dist");
      console.log("PDF.js 라이브러리 로딩 성공:", {
        version: pdfjsLib.version,
        build: pdfjsLib.build,
      });

      // Worker 설정 - pdfjs-dist에서 제공하는 worker 사용
      console.log("PDF.js Worker 설정 시작...");

      // Vite 개발 환경에서 public 디렉터리의 worker 파일 사용
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      console.log("PDF.js Worker 설정 완료 (Vite 호환):", pdfjsLib.GlobalWorkerOptions.workerSrc);

      return pdfjsLib;
    } catch (error) {
      console.error("PDF.js 로딩 실패:", error);
      // 더 자세한 에러 정보 제공
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      throw new Error(
        `PDF.js 라이브러리 로드 실패: ${errorMessage}. 네트워크 연결을 확인하고 다시 시도해보세요.`
      );
    }
  }

  /**
   * 추출된 텍스트를 한글 환경에 맞게 정리합니다.
   * 한글 단어 재결합, 공백 정규화, 문장 구조 개선 등을 수행합니다.
   * @private
   * @param {string} text - 정리할 원본 텍스트
   * @returns {string} 정리된 텍스트
   */
  private cleanExtractedText(text: string): string {
    // 더 강력한 텍스트 정리 알고리즘
    let cleaned = text;
    
    // 1. 기본 공백과 특수문자 정리
    cleaned = cleaned
      .replace(/[\r\f\v]+/g, "\n") // 다른 종류의 줄바꿈을 \n으로 통일
      .replace(/[ \t]+/g, " ") // 연속 공백/탭을 하나로
      .replace(/\u00a0+/g, " "); // non-breaking space 제거
    
    // 2. 한글 텍스트 복구 - 가장 강력한 방식
    // 한글이 잘린 경우 (공백이나 줄바꿈으로 분리된 경우)
    cleaned = cleaned
      // 한글 단어 중간의 공백 제거 (데 이터 → 데이터)
      .replace(/([가-힣])\s+([가-힣])/g, (match, char1, char2) => {
        // 의미 있는 단어 경계가 아닌 경우만 결합
        const meaningfulBreaks = /[다니까에서으로와과의는을를이가]/;
        if (!meaningfulBreaks.test(char1) && !meaningfulBreaks.test(char2)) {
          return char1 + char2;
        }
        return char1 + " " + char2;
      })
      // 한글-숫자-한글 조합에서 불필요한 공백 제거 (1 장 → 1장)
      .replace(/([가-힣])\s+(\d+)\s+([가-힣])/g, "$1$2$3")
      // 숫자와 한글 사이 공백 최적화
      .replace(/(\d+)\s*-\s*(\d+)/g, "$1-$2") // 1 - 1 → 1-1
      .replace(/(\d+)\s+([가-힣]{1}(?:[가-힣]|의|이|을|를|에|는|과|와|로|으로)?)\b/g, "$1$2");
    
    // 3. 문장과 단락 구조 개선
    cleaned = cleaned
      // 불완전한 줄바꿈 복구 (문장 중간의 줄바꿈)
      .replace(/([가-힣a-zA-Z0-9,])\n+([가-힣a-zA-Z0-9])/g, "$1 $2")
      // 제목이나 항목 앞 줄바꿈 보존
      .replace(/(^|\n)(\s*(?:\d+[\.\)]|[가-힣]\.|[\u2022\u25cf\u25cb\-])\s*)/gm, "\n\n$2")
      // 문장 끝 처리
      .replace(/([.!?])\s*\n+([가-힣A-Z])/g, "$1\n\n$2");
    
    // 4. 불필요한 내용 제거
    cleaned = cleaned
      .replace(/\n\s*(?:page|페이지|Page)\s*\d+(?:\s*[\/\-of]\s*\d+)?\s*\n/gi, "\n")
      .replace(/\n\s*\d{1,3}\s*\n/g, "\n")
      .replace(/\n\s*[\-=_]{4,}\s*\n/g, "\n\n");
    
    // 5. 최종 정리
    cleaned = cleaned
      .replace(/\n{3,}/g, "\n\n") // 과도한 줄바꿈 제거
      .replace(/[ \t]+/g, " ") // 다시 한번 공백 정리
      .replace(/^\s+|\s+$/g, ""); // 앞뒤 공백 제거
    
    // 6. 품질 검증 및 복구
    if (cleaned.length < text.length * 0.5) {
      console.warn("텍스트 정리 과정에서 내용이 과도하게 손실됨, 원본 사용");
      return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    }
    
    return cleaned;
  }

  validateFileSize(file: File, maxSizeMB: number = 50): boolean {
    const maxSize = maxSizeMB * 1024 * 1024; // MB to bytes
    return file.size <= maxSize;
  }

  validateFileType(file: File): boolean {
    console.log("파일 타입 검증:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const allowedTypes = [
      "application/pdf",
      "application/haansoftpdf", // 한글과컴퓨터 PDF
      "application/x-pdf", // 다른 PDF 변형
      "text/plain",
      "text/markdown",
    ];

    // MIME 타입 검사
    if (allowedTypes.includes(file.type)) {
      return true;
    }

    // 파일 확장자 검사 (MIME 타입이 잘못 감지된 경우 대비)
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = ["pdf", "txt", "md"];

    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      console.log(
        `MIME 타입이 감지되지 않았지만 확장자(${fileExtension})로 파일 타입 인정`
      );
      return true;
    }

    console.log(
      "지원하지 않는 파일 타입:",
      file.type,
      "확장자:",
      fileExtension
    );
    return false;
  }

  /**
   * 파일을 처리하여 TextDocument 객체를 생성합니다.
   * PDF와 텍스트 파일을 모두 지원합니다.
   * @param {File} file - 처리할 파일 (PDF 또는 텍스트)
   * @returns {Promise<TextDocument>} 처리된 문서 객체
   * @throws {Error} 지원하지 않는 파일 형식 또는 처리 실패
   */
  async processFile(file: File): Promise<TextDocument> {
    // 파일 유효성 검사
    if (!this.validateFileType(file)) {
      throw new Error(
        "지원하지 않는 파일 형식입니다. PDF, TXT, MD 파일만 업로드 가능합니다."
      );
    }

    if (!this.validateFileSize(file, 50)) {
      throw new Error(
        "파일 크기가 너무 큽니다. 50MB 이하의 파일만 업로드 가능합니다."
      );
    }

    let content: string;
    let fileType: "pdf" | "txt" | "md";

    // 파일 타입별 처리 - PDF 타입 확장 감지
    const isPDF =
      file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");

    if (isPDF) {
      console.log("PDF 파일로 인식, PDF.js를 사용하여 텍스트 추출 시작...");
      content = await this.extractTextFromPDF(file);
      fileType = "pdf";
    } else {
      console.log("텍스트 파일로 인식, 직접 텍스트 읽기 시작...");
      content = await this.extractTextFromPlainFile(file);
      fileType = file.name.endsWith(".md") ? "md" : "txt";
    }

    // 빈 내용 체크
    if (!content || content.trim().length < 50) {
      throw new Error("파일에서 충분한 텍스트 내용을 추출할 수 없습니다.");
    }

    // TextDocument 객체 생성
    const document: TextDocument = {
      id: this.generateDocumentId(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      content,
      uploadDate: new Date(),
      fileType,
      processedCards: 0,
      keywords: [], // 나중에 텍스트 분석기에서 추출
    };

    return document;
  }

  /**
   * 일반 텍스트 파일(.txt, .md)에서 텍스트를 추출합니다.
   * @private
   * @param {File} file - 처리할 텍스트 파일
   * @returns {Promise<string>} 추출된 텍스트
   */
  private async extractTextFromPlainFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };

      reader.onerror = () => {
        reject(new Error("파일을 읽을 수 없습니다."));
      };

      reader.readAsText(file, "UTF-8");
    });
  }

  /**
   * 문서를 위한 고유 ID를 생성합니다.
   * @private
   * @returns {string} 생성된 고유 ID
   */
  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const pdfProcessor = new PDFProcessor();
