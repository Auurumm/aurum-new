/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'cp-green': '#ADFF00',
          'cp-dark': '#1C1F18',
          'cp-black': '#000000',
          'cp-white': '#FFFFFF',
        },
        fontFamily: {
          'chakra': ['Chakra Petch', 'monospace'],
          'pretendard': ['Pretendard', 'system-ui', 'sans-serif'],
        },
        backdropBlur: {
          '6': '6px',
        },
        container: {
          center: true,
          padding: '1rem',
          screens: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
          },
        },
      },
    },
    plugins: [],
  }