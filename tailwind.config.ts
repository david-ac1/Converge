import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D", // Charcoal
        foreground: "#FFFFFF", // White
        primary: "#00D1FF",    // Cyan (PRD Accent)
        "blueprint-accent": "rgba(0, 209, 255, 0.4)", // Cyan with opacity
      },
      fontFamily: {
        display: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "blueprint-grid": "linear-gradient(to right, rgba(0, 209, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 209, 255, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
