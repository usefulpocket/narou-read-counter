/** @type {import('tailwindcss').Config} */
export default {
  content: ['./options-src/**/*.{html,js,svelte,ts}'],
  theme: {
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },
  extend: {},
  plugins: [require("daisyui")],
}

