export interface AppConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  features: {
    enableSentry: boolean;
    enableAnalytics: boolean;
    enableDebugMode: boolean;
  };
}

export const config: AppConfig = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  logLevel: import.meta.env.PROD ? 'error' : 'debug',
  features: {
    enableSentry: import.meta.env.PROD,
    enableAnalytics: import.meta.env.PROD,
    enableDebugMode: import.meta.env.DEV,
  },
};

export const API_ENDPOINTS = {
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
} as const;

export function getApiUrl(service: keyof typeof API_ENDPOINTS): string {
  return API_ENDPOINTS[service];
}