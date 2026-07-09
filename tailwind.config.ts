import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        moss: "#4f6f52",
        clay: "#b86b4b",
        skysoft: "#dceaf7",
        paper: "#fbfaf6"
      }
    }
  },
  plugins: []
};

export default config;
