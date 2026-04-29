import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        "oestra-purple": "#3D2B4E",
        "oestra-cream": "#FAF7F2",
        "oestra-blush": "#C84A5C",
        "oestra-mist": "#E8E4DD",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
