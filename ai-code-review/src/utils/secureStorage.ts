/**
 * 보안 스토리지 유틸리티
 * API 키 등 민감한 정보를 암호화하여 로컬 스토리지에 안전하게 저장
 * @module utils/secureStorage
 */

/**
 * 보안 스토리지 클래스
 * XOR 암호화를 사용하여 데이터를 안전하게 저장하고 관리
 */
class SecureStorage {
  /** 암호화에 사용되는 고정 키 */
  private static readonly ENCRYPTION_KEY = "ai-code-review-key";
  /** 보안 데이터의 스토리지 키 접두사 */
  private static readonly STORAGE_PREFIX = "secure_";

  /**
   * 간단한 XOR 암호화 (브라우저 환경용)
   * @param text - 암호화할 텍스트
   * @returns Base64로 인코딩된 암호화된 텍스트
   */
  private static encrypt(text: string): string {
    let result = "";
    const key = this.ENCRYPTION_KEY;

    for (let i = 0; i < text.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const textChar = text.charCodeAt(i);
      result += String.fromCharCode(textChar ^ keyChar);
    }

    return btoa(result);
  }

  /**
   * XOR 복호화
   * @param encryptedText - 복호화할 암호화된 텍스트
   * @returns 복호화된 원본 텍스트
   */
  private static decrypt(encryptedText: string): string {
    try {
      const encoded = atob(encryptedText);
      let result = "";
      const key = this.ENCRYPTION_KEY;

      for (let i = 0; i < encoded.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const encodedChar = encoded.charCodeAt(i);
        result += String.fromCharCode(encodedChar ^ keyChar);
      }

      return result;
    } catch (error) {
      console.error("복호화 실패:", error);
      return "";
    }
  }

  /**
   * 보안 데이터 저장
   * @param key - 저장할 데이터의 키
   * @param value - 저장할 데이터 값
   */
  static setSecure(key: string, value: string): void {
    try {
      const encrypted = this.encrypt(value);
      localStorage.setItem(this.STORAGE_PREFIX + key, encrypted);
    } catch (error) {
      console.error("보안 저장 실패:", error);
    }
  }

  /**
   * 보안 데이터 가져오기
   * @param key - 가져올 데이터의 키
   * @returns 복호화된 데이터 값 또는 null
   */
  static getSecure(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!encrypted) return null;

      return this.decrypt(encrypted);
    } catch (error) {
      console.error("보안 데이터 가져오기 실패:", error);
      return null;
    }
  }

  /**
   * 보안 데이터 삭제
   * @param key - 삭제할 데이터의 키
   */
  static removeSecure(key: string): void {
    try {
      localStorage.removeItem(this.STORAGE_PREFIX + key);
    } catch (error) {
      console.error("보안 데이터 삭제 실패:", error);
    }
  }

  /**
   * API 키 유효성 검사
   * @param provider - API 제공자 (gemini, cohere, huggingface)
   * @param key - 검사할 API 키
   * @returns 유효성 검사 통과 여부
   */
  static validateAPIKey(provider: string, key: string): boolean {
    if (!key || key.length < 10) return false;

    const patterns = {
      gemini: /^AIza[0-9A-Za-z-_]{35}$/,
      cohere: /^[a-zA-Z0-9]{40}$/,
      huggingface: /^hf_[a-zA-Z0-9]{34}$/,
    };

    const pattern = patterns[provider as keyof typeof patterns];
    return pattern ? pattern.test(key) : key.length >= 20;
  }

  /**
   * API 키 마스킹 (표시용)
   * @param key - 마스킹할 API 키
   * @returns 마스킹된 API 키 (예: AIza****...abcd)
   */
  static maskAPIKey(key: string): string {
    if (!key) return "";
    if (key.length <= 8) return "***";

    const start = key.substring(0, 4);
    const end = key.substring(key.length - 4);
    const middle = "*".repeat(Math.min(key.length - 8, 20));

    return `${start}${middle}${end}`;
  }

  /**
   * 모든 보안 데이터 삭제
   * 보안 접두사가 붙은 모든 로컬 스토리지 항목을 제거
   */
  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.STORAGE_PREFIX)
      );

      keys.forEach((key) => localStorage.removeItem(key));
      console.log("모든 보안 데이터가 삭제되었습니다.");
    } catch (error) {
      console.error("보안 데이터 전체 삭제 실패:", error);
    }
  }
}

export default SecureStorage;
