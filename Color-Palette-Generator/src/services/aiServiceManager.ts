/**
 * @fileoverview AI 색상 생성 서비스의 중앙 관리자
 * 
 * 이 파일은 다양한 AI 서비스(Mock, Free API, Offline, Custom API)를 통합 관리하며,
 * 전역 상태 관리, 설정 동기화, 자동 폴백 등의 기능을 제공합니다.
 * 싱글톤 패턴을 사용하여 애플리케이션 전반에서 일관된 서비스 인스턴스를 보장합니다.
 * 
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // 서비스 인스턴스 가져오기
 * const aiService = getAIService();
 * 
 * // 색상 생성
 * const result = await generateColors('바다', 'complementary', {
 *   colorCount: 5
 * });
 * 
 * // 서비스 상태 확인
 * const status = getServiceStatus();
 * console.log('현재 모드:', status.currentMode);
 * ```
 */

import { FreeAIService, type AIServiceConfig } from './freeAIService';

/**
 * AI 서비스의 기본 설정값
 * 
 * @constant {AIServiceConfig} defaultConfig
 * @default
 */
const defaultConfig: AIServiceConfig = {
  mode: 'mock',
  fallbackToOffline: true,
  quotaTracking: true,
  retryCount: 3,
  timeout: 10000
};

/**
 * 전역 AI 서비스 인스턴스
 * 싱글톤 패턴을 위한 내부 변수
 * 
 * @private
 * @type {FreeAIService | null}
 */
let aiServiceInstance: FreeAIService | null = null;

/**
 * AI 서비스 인스턴스를 가져옵니다 (싱글톤 패턴)
 * 
 * 최초 호출 시 localStorage에서 설정을 로드하여 새로운 인스턴스를 생성하고,
 * 이후 호출에서는 동일한 인스턴스를 반환합니다.
 * 설정 변경 이벤트 리스너도 자동으로 등록됩니다.
 * 
 * @function getAIService
 * @returns {FreeAIService} AI 서비스 인스턴스
 * 
 * @example
 * ```typescript
 * const service = getAIService();
 * const colors = await service.generateColors('바다', 'complementary');
 * ```
 */
export function getAIService(): FreeAIService {
  if (!aiServiceInstance) {
    // localStorage에서 설정 로드
    const savedConfig = loadConfigFromStorage();
    aiServiceInstance = new FreeAIService(savedConfig);
    
    // 설정 변경 이벤트 리스너 등록
    setupConfigListener();
  }
  
  return aiServiceInstance;
}

/**
 * localStorage에서 설정 로드
 */
function loadConfigFromStorage(): AIServiceConfig {
  try {
    const saved = localStorage.getItem('ai-service-config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultConfig, ...parsed };
    }
  } catch (error) {
    console.error('AI 서비스 설정 로드 실패:', error);
  }
  
  return defaultConfig;
}

/**
 * 설정 변경 이벤트 리스너 설정
 */
function setupConfigListener(): void {
  // 설정 페이지에서 발생하는 설정 업데이트 이벤트 감지
  window.addEventListener('ai-config-updated', (event: any) => {
    if (aiServiceInstance && event.detail) {
      const newConfig = event.detail as AIServiceConfig;
      console.log('AI 서비스 설정 업데이트 감지:', newConfig);
      
      // 서비스 인스턴스 재생성 (더 안전한 방법)
      aiServiceInstance = new FreeAIService(newConfig);
    }
  });

  // localStorage 변경 감지 (다른 탭에서 설정 변경 시)
  window.addEventListener('storage', (event) => {
    if (event.key === 'ai-service-config' && event.newValue && aiServiceInstance) {
      try {
        const newConfig = JSON.parse(event.newValue);
        console.log('다른 탭에서 AI 서비스 설정 변경 감지:', newConfig);
        
        // 서비스 인스턴스 재생성
        aiServiceInstance = new FreeAIService(newConfig);
      } catch (error) {
        console.error('설정 파싱 오류:', error);
      }
    }
  });
}

/**
 * 현재 서비스 설정 가져오기
 */
export function getCurrentConfig(): AIServiceConfig {
  const service = getAIService();
  return service.getServiceStatus().currentMode === 'mock' 
    ? loadConfigFromStorage() 
    : loadConfigFromStorage();
}

/**
 * 서비스 상태 확인
 */
export function getServiceStatus() {
  const service = getAIService();
  return service.getServiceStatus();
}

/**
 * 색상 생성 요청 (메인 API)
 */
export async function generateColors(keyword: string, harmonyType: any, options: any = {}) {
  const service = getAIService();
  return await service.generateColors(keyword, harmonyType, options);
}