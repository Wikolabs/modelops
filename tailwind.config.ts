import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Josefin Sans'", "sans-serif"],
        body: ["'Hind'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
