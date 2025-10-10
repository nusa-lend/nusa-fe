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
        primary: {
          DEFAULT: "#6BCBFF",
          blue: "#6BCBFF",
        },
        secondary: {
          DEFAULT: "#4FD1C5",
          teal: "#4FD1C5",
        },
        background: {
          DEFAULT: "#F8FAFC",
          light: "#F8FAFC",
        },
        text: {
          DEFAULT: "#1E293B",
          charcoal: "#1E293B",
        },
        success: {
          DEFAULT: "#34D399",
          green: "#34D399",
        },
        error: {
          DEFAULT: "#FB7185",
          coral: "#FB7185",
        },
        white: "#FFFFFF",
        black: "#000000",
      },
      backgroundImage: {
        "gradient-soft": "linear-gradient(90deg, #6BCBFF 0%, #4FD1C5 100%)",
      },
      fontFamily: {
        sans: ["SF UI Text", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
