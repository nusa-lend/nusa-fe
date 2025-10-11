import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Brand / Primary ───────────────────────────────
        primary: {
          DEFAULT: "#6BCBFF",
          light: "#E9F7FF",
          lighter: "#F0FAFF",
          dark: "#5098BF",
          darker: "#305B73",
        },

        // ─── Secondary / Teal ─────────────────────────────
        secondary: {
          DEFAULT: "#4FD1C5",
          light: "#EDFAF9",
          lighter: "#EBFBF5",
          dark: "#3FA79E",
          darker: "#2F7D76",
        },

        // ─── Success / Yield ──────────────────────────────
        success: {
          DEFAULT: "#34D399",
          light: "#E1F8F0",
          lighter: "#C0F1DF",
          dark: "#2FBE8A",
          darker: "#175F45",
        },

        // ─── Error / Risk ─────────────────────────────────
        error: {
          DEFAULT: "#FB7185",
          light: "#FFF1F3",
          lighter: "#FEEDF0",
          dark: "#E26678",
          darker: "#71333C",
        },

        // ─── Neutral / Text / Background ─────────────────
        neutral: {
          0: "#FFFFFF",
          10: "#FAFBFB",
          20: "#F5F6F7",
          30: "#EBEDF0",
          40: "#DFE2E6",
          50: "#C2C7D0",
          60: "#B3B9C4",
          70: "#A6AEBB",
          80: "#98A1B0",
          90: "#8993A4",
          100: "#7A8699",
          200: "#5D6B82",
          300: "#42526D",
          400: "#243757",
          500: "#15294B",
          600: "#091E42",
        },

        // ─── Contextual Helpers ──────────────────────────
        background: {
          DEFAULT: "#F8FAFC",
          light: "#F8FAFC",
          dark: "#1B2535",
        },
        text: {
          DEFAULT: "#1E293B",
          charcoal: "#1E293B",
          light: "#FAFBFB",
          muted: "#707071",
        },
        white: "#FFFFFF",
        black: "#000000",
      },

      // ─── Gradients / Visual Identity ────────────────────
      backgroundImage: {
        "gradient-soft": "linear-gradient(90deg, #6BCBFF 0%, #4FD1C5 100%)",
        "gradient-success": "linear-gradient(90deg, #34D399 0%, #2FBE8A 100%)",
        "gradient-error": "linear-gradient(90deg, #FB7185 0%, #E26678 100%)",
      },

      // ─── Typography ─────────────────────────────────────
      fontFamily: {
        sans: ["SF UI Text", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
