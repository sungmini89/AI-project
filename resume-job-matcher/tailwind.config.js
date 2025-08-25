/**
 * @fileoverview Tailwind CSS 설정 파일
 * @description 이력서-채용공고 매칭 분석 애플리케이션의 Tailwind CSS 설정을 정의합니다.
 * 커스텀 색상, 애니메이션, 반응형 디자인 등의 스타일 설정을 포함합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

/** @type {import('tailwindcss').Config} */
export default {
  /** 다크 모드 설정: CSS 클래스를 통한 다크 모드 전환 */
  darkMode: ["class"],

  /** Tailwind CSS가 스캔할 파일 경로들 */
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  /** CSS 클래스 접두사 (기본값: 없음) */
  prefix: "",

  /** 테마 설정 */
  theme: {
    /** 컨테이너 컴포넌트 설정 */
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    /** 테마 확장 설정 */
    extend: {
      /** 커스텀 색상 팔레트 */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      /** 커스텀 테두리 반경 */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /** 커스텀 키프레임 애니메이션 */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },

      /** 커스텀 애니메이션 클래스 */
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
      },
    },
  },

  /** Tailwind CSS 플러그인 */
  plugins: [require("tailwindcss-animate")],
};
