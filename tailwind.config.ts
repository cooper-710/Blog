import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F4EFE6",
        paper: "#E8DFD2",
        ink: "#111111",
        charcoal: "#2B2A27",
        navy: "#1F3342",
        teal: "#4F7475",
        clay: "#A55632",
        stone: "#D6CEC2",
        brass: "#B59A5B"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(17, 17, 17, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
