/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 버셀 빌드 환경에서 안정적인 커스텀 클래스들 정의
      height: {
        '88': '22rem',
        '104': '26rem',
        '112': '28rem',
        '128': '32rem',
      },
      width: {
        '88': '22rem',
        '104': '26rem', 
        '112': '28rem',
        '128': '32rem',
      },
      spacing: {
        '88': '22rem',
        '104': '26rem',
        '112': '28rem', 
        '128': '32rem',
      },
      // 안정적인 브레이크포인트 재정의
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // 폰트 크기 표준화
      fontSize: {
        '22': ['1.375rem', { lineHeight: '1.75rem' }],
        '26': ['1.625rem', { lineHeight: '2rem' }],
        '28': ['1.75rem', { lineHeight: '2.25rem' }],
      }
    },
  },
  plugins: [],
  // 버셀 환경에서 CSS 최적화
  corePlugins: {
    preflight: true, // CSS 리셋 활성화
  },
  // JIT 모드 최적화
  mode: 'jit',
}