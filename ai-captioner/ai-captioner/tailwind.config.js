/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'system-ui', 'Segoe UI', 'Roboto', 'Apple SD Gothic Neo', 'Noto Sans KR',
          'Helvetica Neue', 'Arial', 'sans-serif'
        ]
      }
    },
  },
  plugins: [],
};
