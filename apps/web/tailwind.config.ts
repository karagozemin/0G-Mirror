import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#05070f",
        panel: "rgba(11, 15, 29, 0.72)",
        line: "rgba(181, 201, 255, 0.16)",
        silver: "#dce7ff",
        cyan: "#67e8f9",
        violet: "#a78bfa",
        mint: "#5eead4",
        danger: "#fb7185",
        warn: "#facc15"
      },
      boxShadow: {
        glow: "0 0 32px rgba(103, 232, 249, 0.18)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.34)"
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at top left, rgba(103,232,249,0.12), transparent 32rem), radial-gradient(circle at 78% 18%, rgba(167,139,250,0.12), transparent 28rem), linear-gradient(180deg, #05070f 0%, #080b16 52%, #05070f 100%)"
      }
    }
  },
  plugins: []
};

export default config;
