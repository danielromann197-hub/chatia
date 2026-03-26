/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        c7: {
          black: '#000000',
          sidebar: '#222222', // Updated from 1A1A1A to 222222
          panel: '#222222',
          input: '#222222',
          yellow: '#FFD000',
          yellowAlt: '#FFD600',
          gray: '#554E4A',
        }
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}
