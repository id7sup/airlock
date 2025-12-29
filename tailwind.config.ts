import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        apple: {
          gray: "#F5F5F7",
          primary: "#212020",
          surface: "#FFFFFF",
          text: "#1D1D1F",
          secondary: "#86868B",
        },
        brand: {
          primary: "#96A982", // Ce vert restera uniquement pour les icônes et touches subtiles
          secondary: "#B7C5A9",
        }
      },
      borderRadius: {
        'apple-xl': '1.25rem',
        'apple-2xl': '1.5rem',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

