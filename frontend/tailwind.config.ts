import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background, #08080c)",
        foreground: "var(--color-foreground, #f8fafc)",
        brand: {
          red: "var(--color-primary, #e50914)",
          redHover: "var(--color-accent, #ff1f2d)",
          gold: "#f5c518",
          dark: "var(--color-background, #08080c)",
          surface: "var(--color-card, #121218)",
          card: "var(--color-card, #161622)",
          cardHover: "#1c1c2b",
          border: "var(--color-border, #232334)",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(229, 9, 20, 0.4)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.8)",
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
