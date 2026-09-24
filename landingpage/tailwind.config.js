/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        ink: "#14120f",
        paper: "#faf8f3",
        line: "#e7e2d6",
        muted: "#6b665c",
        forest: {
          50: "#eef5f0",
          600: "#1f6b4a",
          700: "#17563b",
          800: "#11432e",
          900: "#0c3022",
        },
      },
    },
  },
  plugins: [],
};
