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
        card: "#F7F7F7",
        line: "#E8E8E8",
        sub: "#666666",
        muted: "#999999",
        up: "#FF2D2D",
        down: "#2D6CFF",
        accent: "#00C176",
      },
    },
  },
  plugins: [],
};
export default config;
