/**
 * 테스트 셋업 파일
 * Vitest 테스트 환경에서 필요한 전역 모킹과 설정을 제공
 * @module test/setup
 */

import "@testing-library/jest-dom";
import { vi } from "vitest";

/**
 * localStorage 모킹 객체
 * 테스트 환경에서 localStorage 기능을 시뮬레이션
 */
const localStorageMock = {
  /** 저장된 데이터를 보관하는 객체 */
  store: {} as Record<string, string>,
  /**
   * 저장된 아이템 가져오기
   * @param key - 가져올 데이터의 키
   * @returns 저장된 값 또는 null
   */
  getItem(key: string) {
    return this.store[key] || null;
  },
  /**
   * 아이템 저장
   * @param key - 저장할 데이터의 키
   * @param value - 저장할 데이터 값
   */
  setItem(key: string, value: string) {
    this.store[key] = value;
  },
  /**
   * 아이템 제거
   * @param key - 제거할 데이터의 키
   */
  removeItem(key: string) {
    delete this.store[key];
  },
  /**
   * 모든 데이터 삭제
   */
  clear() {
    this.store = {};
  },
  /** 저장된 데이터 개수 */
  get length() {
    return Object.keys(this.store).length;
  },
  /**
   * 인덱스로 키 가져오기
   * @param index - 키의 인덱스
   * @returns 해당 인덱스의 키 또는 null
   */
  key(index: number) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  },
};

/**
 * localStorage 모킹을 Object.keys()와 호환되도록 Proxy로 래핑
 * 테스트 환경에서 localStorage의 모든 기능을 정상적으로 사용할 수 있도록 함
 */
(global as any).localStorage = new Proxy(localStorageMock, {
  /**
   * 객체의 모든 키를 반환
   * @returns localStorage에 저장된 모든 키
   */
  ownKeys() {
    return Object.keys(localStorageMock.store);
  },
  /**
   * 객체에 특정 속성이 존재하는지 확인
   * @param target - 대상 객체
   * @param prop - 확인할 속성명
   * @returns 속성 존재 여부
   */
  has(target, prop) {
    return prop in localStorageMock.store || prop in target;
  },
  /**
   * 객체의 속성값 가져오기
   * @param target - 대상 객체
   * @param prop - 가져올 속성명
   * @returns 속성값
   */
  get(target, prop) {
    if (prop in target) {
      return target[prop as keyof typeof target];
    }
    return localStorageMock.store[prop as string];
  },
  /**
   * 객체 속성의 디스크립터 가져오기
   * @param target - 대상 객체
   * @param prop - 속성명
   * @returns 속성 디스크립터
   */
  getOwnPropertyDescriptor(target, prop) {
    if (prop in target) {
      return Object.getOwnPropertyDescriptor(target, prop);
    }
    if (prop in localStorageMock.store) {
      return {
        value: localStorageMock.store[prop as string],
        enumerable: true,
        configurable: true,
        writable: true,
      };
    }
    return undefined;
  },
});

/**
 * window 객체에 localStorage 모킹 설정
 * 테스트 환경에서 localStorage를 전역적으로 사용할 수 있도록 함
 */
Object.defineProperty(window, "localStorage", {
  value: (global as any).localStorage,
  writable: true,
});

/**
 * matchMedia 모킹 설정
 * 반응형 디자인 테스트를 위한 미디어 쿼리 기능을 시뮬레이션
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
