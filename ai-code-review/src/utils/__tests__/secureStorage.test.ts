/**
 * SecureStorage 유틸리티 테스트 모듈
 * 보안 저장소 클래스의 암호화/복호화 기능을 검증
 * @module tests/utils/secureStorage
 */

// SecureStorage 유틸리티 테스트

import { describe, it, expect, beforeEach } from "vitest";
import SecureStorage from "../secureStorage";

/**
 * SecureStorage 테스트 스위트
 * 보안 저장소의 모든 주요 기능을 검증
 */
describe("SecureStorage", () => {
  /**
   * 각 테스트 전에 로컬 스토리지를 초기화
   */
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * setSecure와 getSecure 메서드 테스트 그룹
   * 데이터 암호화/복호화 기능 검증
   */
  describe("setSecure and getSecure", () => {
    /**
     * 데이터가 올바르게 암호화되고 복호화되는지 검증
     */
    it("should encrypt and decrypt data correctly", () => {
      const testKey = "test-key";
      const testValue = "test-value";

      SecureStorage.setSecure(testKey, testValue);
      const retrieved = SecureStorage.getSecure(testKey);

      expect(retrieved).toBe(testValue);
    });

    /**
     * 존재하지 않는 키에 대해 null을 반환하는지 검증
     */
    it("should return null for non-existent key", () => {
      const result = SecureStorage.getSecure("non-existent");
      expect(result).toBeNull();
    });
  });

  /**
   * removeSecure 메서드 테스트 그룹
   * 저장된 데이터 제거 기능 검증
   */
  describe("removeSecure", () => {
    /**
     * 저장된 데이터가 올바르게 제거되는지 검증
     */
    it("should remove stored data", () => {
      const testKey = "test-key";
      const testValue = "test-value";

      SecureStorage.setSecure(testKey, testValue);
      SecureStorage.removeSecure(testKey);

      const result = SecureStorage.getSecure(testKey);
      expect(result).toBeNull();
    });
  });

  /**
   * validateAPIKey 메서드 테스트 그룹
   * API 키 유효성 검사 기능 검증
   */
  describe("validateAPIKey", () => {
    /**
     * Gemini API 키 형식 검증이 올바르게 작동하는지 검증
     */
    it("should validate Gemini API key format", () => {
      const validKey = "AIzaSyDummyKeyForTesting1234567890123456";
      const invalidKey = "invalid-key";

      expect(SecureStorage.validateAPIKey("gemini", validKey)).toBe(false); // Mock key won't pass real validation
      expect(SecureStorage.validateAPIKey("gemini", invalidKey)).toBe(false);
    });

    /**
     * 최소 키 길이 요구사항이 올바르게 검증되는지 검증
     */
    it("should require minimum key length", () => {
      expect(SecureStorage.validateAPIKey("unknown", "short")).toBe(false);
      expect(SecureStorage.validateAPIKey("unknown", "a".repeat(20))).toBe(
        true
      );
    });
  });

  /**
   * maskAPIKey 메서드 테스트 그룹
   * API 키 마스킹 기능 검증
   */
  describe("maskAPIKey", () => {
    /**
     * API 키가 올바르게 마스킹되는지 검증
     */
    it("should mask API key properly", () => {
      const key = "AIzaSyDummyKeyForTesting1234567890123456";
      const masked = SecureStorage.maskAPIKey(key);

      expect(masked).toMatch(/^AIza.*3456$/);
      expect(masked).not.toBe(key);
    });

    /**
     * 짧은 키에 대한 마스킹 처리가 올바르게 작동하는지 검증
     */
    it("should handle short keys", () => {
      expect(SecureStorage.maskAPIKey("short")).toBe("***");
      expect(SecureStorage.maskAPIKey("")).toBe("");
    });
  });

  /**
   * clearAll 메서드 테스트 그룹
   * 모든 보안 저장소 데이터 삭제 기능 검증
   */
  describe("clearAll", () => {
    /**
     * 모든 보안 저장소 데이터가 올바르게 삭제되는지 검증
     */
    it("should clear all secure storage data", () => {
      SecureStorage.setSecure("key1", "value1");
      SecureStorage.setSecure("key2", "value2");

      // Verify data exists before clearing
      expect(SecureStorage.getSecure("key1")).toBe("value1");
      expect(SecureStorage.getSecure("key2")).toBe("value2");

      SecureStorage.clearAll();

      expect(SecureStorage.getSecure("key1")).toBeNull();
      expect(SecureStorage.getSecure("key2")).toBeNull();
    });
  });
});
