import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // South African-inspired palette
        za: {
          green: "#007A4D",
          gold: "#FFB612",
          red: "#DE3831",
          blue: "#002395",
          "green-light": "#00B56A",
        },
        surface: {
          DEFAULT: "#0F0F13",
          "1": "#16161D",
          "2": "#1E1E28",
          "3": "#252532",
          border: "#2E2E3E",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-za": "linear-gradient(135deg, #007A4D 0%, #002395 100%)",
        "gradient-gold": "linear-gradient(135deg, #FFB612 0%, #FF8C00 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
