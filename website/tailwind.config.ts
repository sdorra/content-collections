import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import typographyPlugin from "@tailwindcss/typography";
import animatePlugin from "tailwindcss-animate";

const config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: colors.orange,
        base: colors.slate,
      },
    },
  },
  plugins: [typographyPlugin, animatePlugin],
} satisfies Config;

export default config;
