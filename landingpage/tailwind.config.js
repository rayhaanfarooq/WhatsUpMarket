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
        ink: "#05060a",
        panel: "#0b0d14",
      },
      animation: {
        aurora: "aurora 8s ease-in-out infinite alternate",
        meteor: "meteor 5s linear infinite",
        "shiny-text": "shiny-text 8s ease-in-out infinite",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        shine: "shine var(--duration) infinite linear",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        aurora: {
          "0%": { backgroundPosition: "0% 50%", transform: "rotate(-3deg) scale(1)" },
          "25%": { backgroundPosition: "50% 100%", transform: "rotate(3deg) scale(1.05)" },
          "50%": { backgroundPosition: "100% 50%", transform: "rotate(-2deg) scale(0.97)" },
          "75%": { backgroundPosition: "50% 0%", transform: "rotate(2deg) scale(1.03)" },
          "100%": { backgroundPosition: "0% 50%", transform: "rotate(-3deg) scale(1)" },
        },
        meteor: {
          "0%": { transform: "rotate(var(--angle)) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": { transform: "rotate(var(--angle)) translateX(-500px)", opacity: "0" },
        },
        "shiny-text": {
          "0%, 90%, 100%": { backgroundPosition: "calc(-100% - var(--shiny-width)) 0" },
          "30%, 60%": { backgroundPosition: "calc(100% + var(--shiny-width)) 0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "shimmer-slide": {
          to: { transform: "translate(calc(100cqb - 100%), 0)" },
        },
        "spin-around": {
          "0%": { transform: "translateZ(0) rotate(0deg)" },
          "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
          "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
          "100%": { transform: "translateZ(0) rotate(360deg)" },
        },
        shine: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          to: { backgroundPosition: "0% 0%" },
        },
      },
    },
  },
  plugins: [],
};
