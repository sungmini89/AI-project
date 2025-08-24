/**
 * Tailwind CSS 설정 파일
 * AI Recipe 애플리케이션의 스타일링 시스템을 구성합니다.
 * 
 * @description
 * - CSS 프레임워크 설정 및 커스터마이징
 * - 다크 모드 지원 설정
 * - 커스텀 색상 팔레트 정의
 * - 애니메이션 및 전환 효과 설정
 * - 컴포넌트별 스타일 변수 정의
 * 
 * @features
 * - CSS 변수를 활용한 테마 시스템
 * - 다크/라이트 모드 자동 전환
 * - 커스텀 애니메이션 (fade-in, slide-in 등)
 * - 반응형 디자인 지원
 * - shadcn/ui 컴포넌트와의 호환성
 * 
 * @author AI Recipe Team
 * @version 1.0.0
 */

/** @type {import('tailwindcss').Config} */
export default {
  /** 다크 모드 설정 - CSS 클래스 기반 */
  darkMode: ['class'],
  /** Tailwind가 스캔할 파일 경로 */
  content: [
    './src/**/*.{ts,tsx}',
    './index.html'
  ],
  /** 테마 확장 설정 */
  theme: {
    extend: {
      /** 커스텀 색상 팔레트 */
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      /** 테두리 반경 설정 */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      /** 커스텀 키프레임 애니메이션 */
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      /** 커스텀 애니메이션 클래스 */
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  /** Tailwind 플러그인 목록 */
  plugins: [],
}