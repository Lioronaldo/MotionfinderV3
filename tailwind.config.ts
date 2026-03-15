import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["ui-sans-serif","system-ui","Inter","Segoe UI","Roboto","Arial"] },
      colors: {
        motion: {
          bg: "#07080B",
          panel: "#0D1017",
          panel2: "#0A0C12",
          border: "rgba(255,255,255,.10)",
          text: "rgba(255,255,255,.90)",
          muted: "rgba(255,255,255,.60)",
          faint: "rgba(255,255,255,.35)",
          orange: "#FF7A00",
          orange2: "#FF9A3D"
        }
      },
      boxShadow: { glow: "0 0 0 1px rgba(255,128,0,.25), 0 12px 40px rgba(0,0,0,.45)" }
    }
  },
  plugins: []
} satisfies Config;
