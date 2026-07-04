import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0A1F44", light: "#123163", dark: "#061530" },
        gold: { DEFAULT: "#D4AF37", light: "#E9CE6E", dark: "#A8862A" },
        cream: "#F8F7F2",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(10,31,68,0.15)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
export default config;
