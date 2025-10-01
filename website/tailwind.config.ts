import { createPreset } from "fumadocs-ui/tailwind-plugin";
import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import colors from "tailwindcss/colors";

const config = {
  darkMode: "class",
  content: [
    "./node_modules/fumadocs-ui/dist/**/*.js",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  presets: [
    createPreset({ preset: "ocean", addGlobalColors: true, cssPrefix: "" }),
  ],
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
