/**
 * @fileoverview Vite 빌드 도구 설정 파일
 * @description 이력서-채용공고 매칭 분석 애플리케이션의 빌드 설정을 정의합니다.
 * React 플러그인, PWA 설정, 경로 별칭, 번들 최적화 등의 설정을 포함합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */
/**
 * Vite 빌드 도구 설정
 * @description 애플리케이션의 빌드 프로세스와 개발 서버 설정을 정의합니다.
 *
 * 주요 설정:
 * - React 플러그인: JSX 및 React 컴포넌트 지원
 * - PWA 플러그인: Progressive Web App 기능 지원
 * - 경로 별칭: '@'를 src 디렉토리로 매핑
 * - 번들 최적화: 코드 스플리팅 및 청크 분리
 * - 개발 서버: 포트 3000에서 자동 실행
 *
 * @returns {import('vite').UserConfig} Vite 설정 객체
 *
 * @example
 * 이 파일은 Vite 빌드 도구에 의해 자동으로 로드됩니다.
 * 개발 시에는 `npm run dev` 명령으로 실행됩니다.
 */
declare const _default: import("vite").UserConfig;
export default _default;
