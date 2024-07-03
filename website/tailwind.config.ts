import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import animatePlugin from "tailwindcss-animate";
import { createPreset } from "fumadocs-ui/tailwind-plugin";

const config = {
  darkMode: "class",
  content: [
    "./node_modules/fumadocs-ui/dist/**/*.js",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  presets: [createPreset({ preset: "ocean" })],
  theme: {
    extend: {
      colors: {
        primary: {
          ...colors.orange,
        },
        base: colors.slate,
        info: colors.sky,
        warn: colors.yellow,
        error: colors.red,
        success: colors.green,
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;

export default config;
