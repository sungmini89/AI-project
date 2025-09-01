// API 관련 타입 정의

export type APIMode = "mock" | "free" | "offline" | "custom";

export interface ColorServiceConfig {
  mode: APIMode;
  primaryAPI: "colormind" | "thecolorapi" | "local";
  apiKey?: string;
  fallbackToOffline: boolean;
  enableHuggingFace: boolean;
}

export interface ColormindRequest {
  model: string;
  input?: Array<number[] | "N">;
}

export interface ColormindResponse {
  result: number[][]; // RGB 배열
}

export interface TheColorAPIResponse {
  hex: {
    value: string;
    clean: string;
  };
  rgb: {
    fraction: { r: number; g: number; b: number };
    r: number;
    g: number;
    b: number;
    value: string;
  };
  hsl: {
    fraction: { h: number; s: number; l: number };
    h: number;
    s: number;
    l: number;
    value: string;
  };
  name: {
    value: string;
    closest_named_hex: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}