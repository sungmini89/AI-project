// Service layer exports
import { ColorService, type ColorServiceConfig } from './colorService';
import { KeywordService } from './keywordService';
import { ImageService } from './imageService';
import { getAIService, getCurrentConfig, getServiceStatus, generateColors } from './aiServiceManager';

export { ColorService, KeywordService, ImageService, getAIService, getCurrentConfig, getServiceStatus, generateColors };

// API Configuration type
export interface APIConfig {
  colormindUrl?: string;
  theColorApiUrl?: string;
  mode?: 'online' | 'offline' | 'hybrid';
}

export type {
  KeywordSearchResult
} from './keywordService';

export type {
  ImageAnalysisResult,
  ProcessingOptions
} from './imageService';

// Service configuration helpers
export const createAPIConfig = (
  mode: 'online' | 'offline' | 'hybrid' = 'hybrid'
): APIConfig => ({
  colormindUrl: import.meta.env.VITE_COLORMIND_API_URL || 'http://colormind.io/api/',
  theColorApiUrl: import.meta.env.VITE_THECOLORAPI_URL || 'https://www.thecolorapi.com',
  mode
});

// APIConfig를 ColorServiceConfig로 변환
export const apiConfigToColorServiceConfig = (apiConfig: APIConfig): ColorServiceConfig => ({
  mode: apiConfig.mode === 'offline' ? 'offline' : 'free',
  primaryAPI: 'colormind',
  fallbackToOffline: true,
  enableHuggingFace: false,
  timeout: 10000
});

// Service factory
export class ServiceFactory {
  private static colorService: ColorService;
  private static keywordService: KeywordService;
  private static imageService: ImageService;

  static getColorService(config?: APIConfig): ColorService {
    if (!this.colorService) {
      const apiConfig = config || createAPIConfig();
      const colorServiceConfig = apiConfigToColorServiceConfig(apiConfig);
      this.colorService = new ColorService(colorServiceConfig);
    }
    return this.colorService;
  }

  static getKeywordService(colorService?: ColorService): KeywordService {
    if (!this.keywordService) {
      const cs = colorService || this.getColorService();
      this.keywordService = new KeywordService(cs);
    }
    return this.keywordService;
  }

  static getImageService(colorService?: ColorService): ImageService {
    if (!this.imageService) {
      const cs = colorService || this.getColorService();
      this.imageService = new ImageService(cs);
    }
    return this.imageService;
  }

  // Reset all services (useful for testing or config changes)
  static reset(): void {
    this.colorService = null as any;
    this.keywordService = null as any;
    this.imageService = null as any;
  }
}

// Service health check
export const performHealthCheck = async () => {
  try {
      const apiStatus = { colormind: false, theColorAPI: false, huggingFace: false };
    
    return {
      status: 'healthy',
      apis: apiStatus,
      timestamp: new Date().toISOString(),
      services: {
        colorService: true,
        keywordService: true,
        imageService: true
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      services: {
        colorService: false,
        keywordService: false,
        imageService: false
      }
    };
  }
};