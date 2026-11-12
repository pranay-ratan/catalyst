import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EC",
        ink: "#13282C",
        body: "#3F5357",
        teal: "#0E7B6D",
        water: "#4A9BE8",
        "water-dark": "#1F5FA8",
        dye: "#B0275F",
        amber: "#F2B94B",
        mist: "#E8F0EC",
        line: "#D9E2DD",
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 40px rgba(19, 40, 44, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
