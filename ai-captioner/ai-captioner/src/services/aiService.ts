import { canProceedRateLimited } from "./rateLimiter";
import { addHistory, CaptionRecord } from "./storage";
import { callMock } from "./mockService";
import { callFreeApi, isFreeLimitExceeded } from "./freeAiService";
import { callOllama } from "./offlineOllamaService";

/** 캡션 타입 정의 */
export type CaptionType = "seo" | "sns" | "accessible";

/**
 * AI 서비스 설정 인터페이스
 *
 * @interface AiServiceConfig
 * @property {'Mock' | 'Free' | 'Offline' | 'Custom'} mode - 사용할 AI 모드
 * @property {string} [apiKey] - Custom 모드에서 사용할 API 키
 * @property {boolean} fallbackToOffline - Free 모드 실패 시 Offline 모드로 폴백할지 여부
 */
export interface AiServiceConfig {
  mode: "Mock" | "Free" | "Offline" | "Custom";
  apiKey?: string;
  fallbackToOffline: boolean;
}

/** AI 서비스 상태 타입 */
export type AiStatus = "idle" | "loading" | "success" | "error" | "rate_limited" | "fallback";

/**
 * AI 캡션 생성 결과 인터페이스
 *
 * @interface GenerateResult
 * @property {AiStatus} status - 생성 상태
 * @property {string} [caption] - 생성된 캡션 (성공 시)
 * @property {string} [error] - 에러 메시지 (실패 시)
 * @property {string} usedMode - 실제로 사용된 AI 모드
 */
export type GenerateResult = {
  status: AiStatus;
  caption?: string;
  error?: string;
  usedMode: string;
};

/**
 * 캡션 타입에 따른 프롬프트를 생성하는 함수
 *
 * @param {CaptionType} type - 캡션 타입
 * @returns {string} 생성된 프롬프트
 */
function buildPrompt(type: CaptionType): string {
  switch (type) {
    case "seo":
      return "이미지를 설명하는 한국어 캡션을 작성하되, 120자 내외로 핵심 키워드를 포함하고 자연스럽게 연결하세요. 키워드는 해시태그 없이 문장 내에 녹여주세요.";
    case "sns":
      return "이미지를 친근하게 한국어로 설명하고, 1~2개의 이모지를 포함하세요. 너무 길지 않게 80자 내외.";
    case "accessible":
      return "시각장애인을 위한 대체텍스트(alt)로 사용할 한국어 설명을 구체적으로 작성하세요. 인물/사물/배경/색감/상황을 간결히.";
  }
}

/**
 * AI를 사용하여 이미지 캡션을 생성하는 메인 함수
 *
 * @description
 * - 레이트 리미트 확인
 * - 설정된 모드에 따라 적절한 AI 서비스 호출
 * - 실패 시 폴백 모드로 전환
 * - 생성된 캡션을 히스토리에 자동 저장
 *
 * @param {string} fileDataUrl - 이미지 파일의 Data URL
 * @param {CaptionType} type - 생성할 캡션의 타입
 * @param {Partial<AiServiceConfig>} [config] - AI 서비스 설정 (선택사항)
 * @returns {Promise<GenerateResult>} 캡션 생성 결과
 *
 * @example
 * ```tsx
 * const result = await generateCaption(imageDataUrl, 'seo');
 * if (result.status === 'success') {
 *   console.log('생성된 캡션:', result.caption);
 * }
 * ```
 */
export async function generateCaption(
  fileDataUrl: string,
  type: CaptionType,
  config?: Partial<AiServiceConfig>,
): Promise<GenerateResult> {
  // 레이트 리미트 확인
  const perMinute = Number(import.meta.env.VITE_RATE_LIMIT_PER_MINUTE || 30);
  if (!canProceedRateLimited("generate", perMinute)) {
    return {
      status: "rate_limited",
      usedMode: "N/A",
      error: `레이트 리미트 초과(${perMinute}/분)`,
    };
  }

  // 기본 설정과 사용자 설정 병합
  const defaultConfig: AiServiceConfig = {
    mode: (import.meta.env.VITE_API_MODE as AiServiceConfig["mode"]) || "Mock",
    fallbackToOffline: false, // Mock 모드 사용 시 폴백 비활성화
  };
  const cfg: AiServiceConfig = { ...defaultConfig, ...config };

  // 이미지를 Base64로 변환하고 프롬프트 생성
  const imageBase64 = fileDataUrl.split(",")[1];
  const prompt = buildPrompt(type);

  try {
    // Mock 모드 우선 처리 (환경 변수 또는 설정으로 Mock 모드일 때)
    if (cfg.mode === "Mock" || import.meta.env.VITE_USE_MOCK_DATA === "true") {
      console.log("Mock 모드로 캡션 생성 중...");
      const c = await callMock(type);
      const rec: CaptionRecord = {
        id: crypto.randomUUID(),
        imageDataUrl: fileDataUrl,
        type,
        caption: c,
        createdAt: Date.now(),
      };
      addHistory(rec);
      return { status: "success", caption: c, usedMode: "Mock" };
    }

    // Free API 모드 처리
    if (cfg.mode === "Free") {
      // Free API 한도 확인
      if (isFreeLimitExceeded()) {
        if (cfg.fallbackToOffline) {
          // 폴백: Offline 모드로 전환
          console.log("Free API 한도 초과, Offline 모드로 폴백...");
          const c = await callOllama(imageBase64, prompt);
          const rec: CaptionRecord = {
            id: crypto.randomUUID(),
            imageDataUrl: fileDataUrl,
            type,
            caption: c,
            createdAt: Date.now(),
          };
          addHistory(rec);
          return { status: "fallback", caption: c, usedMode: "Offline" };
        }
        return { status: "error", usedMode: "Free", error: "Free 한도 초과" };
      }

      try {
        // Free API 호출
        console.log("Free API 모드로 캡션 생성 중...");
        const c = await callFreeApi(imageBase64, prompt);
        const rec: CaptionRecord = {
          id: crypto.randomUUID(),
          imageDataUrl: fileDataUrl,
          type,
          caption: c,
          createdAt: Date.now(),
        };
        addHistory(rec);
        return { status: "success", caption: c, usedMode: "Free" };
      } catch (e: any) {
        // Free API 실패 시 폴백
        if (cfg.fallbackToOffline) {
          console.log("Free API 실패, Offline 모드로 폴백...");
          const c = await callOllama(imageBase64, prompt);
          const rec: CaptionRecord = {
            id: crypto.randomUUID(),
            imageDataUrl: fileDataUrl,
            type,
            caption: c,
            createdAt: Date.now(),
          };
          addHistory(rec);
          return { status: "fallback", caption: c, usedMode: "Offline" };
        }
        return { status: "error", usedMode: "Free", error: e?.message || "Free API 실패" };
      }
    }

    // Custom API 모드 처리
    if (cfg.mode === "Custom") {
      const base = (import.meta.env.VITE_CUSTOM_API_BASE_URL as string) || "";
      if (!base || !cfg.apiKey)
        throw new Error("Custom 모드: API Base URL 또는 API Key가 필요합니다");

      console.log("Custom API 모드로 캡션 생성 중...");
      const res = await fetch(`${base}/caption`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({ image: imageBase64, prompt }),
      });

      if (!res.ok) throw new Error(`Custom API 실패: ${res.status}`);
      const data = await res.json();
      const c = (data.caption || "").trim();
      const rec: CaptionRecord = {
        id: crypto.randomUUID(),
        imageDataUrl: fileDataUrl,
        type,
        caption: c,
        createdAt: Date.now(),
      };
      addHistory(rec);
      return { status: "success", caption: c, usedMode: "Custom" };
    }

    // Offline 모드 처리 (기본값)
    console.log("Offline 모드로 캡션 생성 중...");
    const c = await callOllama(imageBase64, prompt);
    const rec: CaptionRecord = {
      id: crypto.randomUUID(),
      imageDataUrl: fileDataUrl,
      type,
      caption: c,
      createdAt: Date.now(),
    };
    addHistory(rec);
    return { status: "success", caption: c, usedMode: "Offline" };
  } catch (e: any) {
    // 에러 발생 시 Mock 모드로 폴백 (Offline 모드 실패 시)
    if (cfg.mode === "Offline") {
      console.log("Offline 모드 실패, Mock 모드로 폴백...");
      try {
        const c = await callMock(type);
        const rec: CaptionRecord = {
          id: crypto.randomUUID(),
          imageDataUrl: fileDataUrl,
          type,
          caption: c,
          createdAt: Date.now(),
        };
        addHistory(rec);
        return { status: "fallback", caption: c, usedMode: "Mock" };
      } catch (e2: any) {
        return { status: "error", usedMode: "Offline", error: "Mock 폴백 실패" };
      }
    }
    
    // 다른 모드에서 에러 발생 시 Mock 모드로 폴백
    if (cfg.fallbackToOffline) {
      try {
        console.log("에러 발생, Mock 모드로 폴백...");
        const c = await callMock(type);
        const rec: CaptionRecord = {
          id: crypto.randomUUID(),
          imageDataUrl: fileDataUrl,
          type,
          caption: c,
          createdAt: Date.now(),
        };
        addHistory(rec);
        return { status: "fallback", caption: c, usedMode: "Mock" };
      } catch (e2: any) {
        return { status: "error", usedMode: cfg.mode, error: "Mock 폴백 실패" };
      }
    }
    
    return { status: "error", usedMode: cfg.mode, error: e?.message || "실패" };
  }
}
