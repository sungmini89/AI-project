/**
 * @fileoverview 실시간 번역 엔진 서비스
 *
 * 이 서비스는 다양한 번역 API를 통합하고 캐싱을 통해
 * 효율적인 번역 서비스를 제공합니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

import type { TranslationResult, TranslationSettings } from "@/types";
import { detectLanguage } from "./languageDetection";
import {
  translateWithMyMemory,
  translateWithLibreTranslate,
  translateWithOfflineDictionary,
} from "./translationAPIs";

/**
 * 번역 결과를 캐싱하는 클래스
 *
 * @description
 * - LRU (Least Recently Used) 알고리즘으로 캐시 관리
 * - 메모리 효율성을 위한 해시 기반 키 생성
 * - 24시간 TTL (Time To Live) 지원
 * - 최대 2000개 번역 결과 저장
 */
class TranslationCache {
  private cache = new Map<
    string,
    { result: TranslationResult; timestamp: number; accessCount: number }
  >();
  private readonly maxSize = 2000; // Increased cache size
  private readonly maxAge = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * 캐시 키를 생성합니다
   *
   * @param {string} text - 번역할 텍스트
   * @param {string} source - 원본 언어 코드
   * @param {string} target - 대상 언어 코드
   * @returns {string} 캐시 키
   */
  private getCacheKey(text: string, source: string, target: string): string {
    // Use hash for longer texts to save memory
    const textKey =
      text.length > 100
        ? `${text.slice(0, 50)}...${text.slice(-50)}[${text.length}]`
        : text;
    return `${source}-${target}-${textKey}`;
  }

  /**
   * 캐시에서 번역 결과를 가져옵니다
   *
   * @param {string} text - 번역할 텍스트
   * @param {string} source - 원본 언어 코드
   * @param {string} target - 대상 언어 코드
   * @returns {TranslationResult | null} 캐시된 번역 결과 또는 null
   */
  get(text: string, source: string, target: string): TranslationResult | null {
    const key = this.getCacheKey(text, source, target);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update access info for LRU
    entry.accessCount++;
    entry.timestamp = Date.now();
    this.cache.set(key, entry);

    return entry.result;
  }

  /**
   * 번역 결과를 캐시에 저장합니다
   *
   * @param {string} text - 번역할 텍스트
   * @param {string} source - 원본 언어 코드
   * @param {string} target - 대상 언어 코드
   * @param {TranslationResult} result - 번역 결과
   */
  set(text: string, source: string, target: string, result: TranslationResult) {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const safeSource = source || "auto";
    const key = this.getCacheKey(text, safeSource, target);

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  /**
   * LRU 알고리즘을 사용하여 가장 오래된 캐시 항목을 제거합니다
   */
  private evictLRU() {
    let oldestKey = "";
    let oldestTime = Date.now();
    let lowestCount = Infinity;

    // Find least recently used entry
    for (const [key, entry] of this.cache) {
      if (
        entry.timestamp < oldestTime ||
        (entry.timestamp === oldestTime && entry.accessCount < lowestCount)
      ) {
        oldestKey = key;
        oldestTime = entry.timestamp;
        lowestCount = entry.accessCount;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 모든 캐시를 지웁니다
   */
  clear() {
    this.cache.clear();
  }
}

/**
 * 번역 엔진 클래스
 *
 * @description
 * - 싱글톤 패턴으로 구현
 * - 여러 번역 API 제공자 지원 (MyMemory, LibreTranslate, 오프라인)
 * - 자동 언어 감지 및 폴백 메커니즘
 * - 번역 결과 캐싱으로 성능 최적화
 */
export class TranslationEngine {
  private static instance: TranslationEngine;
  private cache = new TranslationCache();
  private settings: TranslationSettings = {
    preferredProvider: "auto",
    autoDetectLanguage: true,
    fallbackToOffline: true,
    cacheTranslations: true,
  };

  /**
   * TranslationEngine의 싱글톤 인스턴스를 반환합니다
   *
   * @returns {TranslationEngine} TranslationEngine 인스턴스
   */
  static getInstance(): TranslationEngine {
    if (!TranslationEngine.instance) {
      TranslationEngine.instance = new TranslationEngine();
    }
    return TranslationEngine.instance;
  }

  private constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const stored = localStorage.getItem("translation-settings");
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Error loading translation settings:", e);
    }
  }

  private saveSettings() {
    localStorage.setItem("translation-settings", JSON.stringify(this.settings));
  }

  updateSettings(newSettings: Partial<TranslationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): TranslationSettings {
    return { ...this.settings };
  }

  /**
   * Main translation method with fallback chain
   */
  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    try {
      // Clean input text
      const cleanText = text.trim();
      if (!cleanText) {
        throw new Error("Empty text provided");
      }

      // Detect source language if not provided
      const detectedSource =
        sourceLanguage ||
        (this.settings.autoDetectLanguage ? detectLanguage(cleanText) : "en");

      // Check if source and target are the same
      if (detectedSource === targetLanguage) {
        return {
          translatedText: cleanText,
          sourceLanguage: detectedSource,
          targetLanguage,
          confidence: 1.0,
          provider: "offline",
        };
      }

      // Clear cache for common words to ensure fresh translations
      const commonWords = [
        "hello",
        "hi",
        "thanks",
        "thank you",
        "bye",
        "goodbye",
      ];
      if (commonWords.some((word) => cleanText.toLowerCase().includes(word))) {
        console.log(
          "🧹 Clearing cache for common word to ensure fresh translation"
        );
        this.cache.clear();
      }

      // Check cache first (after potential clearing)
      if (this.settings.cacheTranslations) {
        const cached = this.cache.get(
          cleanText,
          detectedSource || "auto",
          targetLanguage
        );
        if (cached && cached.confidence && cached.confidence > 0.5) {
          // Only use high-confidence cached results
          console.log("Translation cache hit");
          return cached;
        }
      }

      // Try translation with fallback chain
      const result = await this.translateWithFallback(
        cleanText,
        detectedSource || "auto",
        targetLanguage
      );

      // Cache successful translation
      if (
        this.settings.cacheTranslations &&
        result.confidence &&
        result.confidence > 0.3
      ) {
        this.cache.set(
          cleanText,
          detectedSource || "auto",
          targetLanguage,
          result
        );
      }

      return result;
    } catch (error) {
      console.error("Translation failed:", error);
      throw error;
    }
  }

  /**
   * Translation with fallback chain: MyMemory → LibreTranslate → Offline
   */
  private async translateWithFallback(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResult> {
    const providers = this.getProviderChain();
    const errors: Error[] = [];

    for (const provider of providers) {
      try {
        console.log(`Trying translation with ${provider}`);

        switch (provider) {
          case "mymemory":
            return await translateWithMyMemory(
              text,
              sourceLanguage,
              targetLanguage
            );

          case "libretranslate":
            return await translateWithLibreTranslate(
              text,
              sourceLanguage,
              targetLanguage
            );

          case "offline":
            return await translateWithOfflineDictionary(
              text,
              sourceLanguage,
              targetLanguage
            );

          default:
            throw new Error(`Unknown provider: ${provider}`);
        }
      } catch (error) {
        console.warn(`${provider} translation failed:`, error);
        errors.push(error as Error);
        continue;
      }
    }

    // If all providers failed
    throw new Error(
      `All translation providers failed. Errors: ${errors
        .map((e) => e.message)
        .join(", ")}`
    );
  }

  /**
   * Get provider chain based on settings and availability
   */
  private getProviderChain(): string[] {
    const { preferredProvider, fallbackToOffline } = this.settings;

    if (preferredProvider !== "auto") {
      const chain = [preferredProvider];
      if (fallbackToOffline && preferredProvider !== "offline") {
        chain.push("offline");
      }
      return chain;
    }

    // Auto mode: try all providers in optimal order
    const chain = ["mymemory", "libretranslate"];
    if (fallbackToOffline) {
      chain.push("offline");
    }
    return chain;
  }

  /**
   * Translate to multiple languages simultaneously
   */
  async translateToMultipleLanguages(
    text: string,
    targetLanguages: string[],
    sourceLanguage?: string
  ): Promise<Record<string, TranslationResult>> {
    const results: Record<string, TranslationResult> = {};

    const promises = targetLanguages.map(async (lang) => {
      try {
        const result = await this.translate(text, lang, sourceLanguage);
        results[lang] = result;
      } catch (error) {
        console.error(`Translation to ${lang} failed:`, error);
        results[lang] = {
          translatedText: text,
          sourceLanguage: sourceLanguage || "unknown",
          targetLanguage: lang,
          confidence: 0,
          provider: "offline",
        };
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Get translation statistics
   */
  getStatistics() {
    return {
      cacheSize: this.cache["cache"].size,
      settings: this.settings,
    };
  }

  /**
   * Clear translation cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const translationEngine = TranslationEngine.getInstance();
