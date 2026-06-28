/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 纸张黄主题 · 全季酒店东方简约气质
        paper: {
          50: "#FBF9F1",
          100: "#F5F2E8", // 主背景
          200: "#EDE7D6",
          300: "#E2D9BF",
          400: "#C9BD9C",
          500: "#A89B7A",
          600: "#857A5C",
          700: "#5C5440",
          800: "#3D3829",
          900: "#241F14",
        },
        ink: {
          400: "#7A6F58",
          500: "#5A503C",
          600: "#3A3324",
          700: "#241F14",
        },
        // 仪式色(对应 demo 的金灯,改用偏暖的「宣纸金」)
        ember: {
          50: "#FFF6E5",
          100: "#FFE8B8",
          200: "#FFD58A",
          300: "#F0BB5D",
          400: "#D9A03E",
          500: "#B6822C",
          600: "#8E6420",
          700: "#664718",
        },
        // 收入 = 暖光 · 净储蓄点亮色
        glow: {
          400: "#E8B960",
          500: "#C79436",
        },
        // 资产 = 冷月光
        moon: {
          400: "#9FB1C4",
          500: "#6B7E96",
        },
      },
      fontFamily: {
        serif: [
          "Noto Serif SC",
          "Cormorant Garamond",
          "Songti SC",
          "serif",
        ],
        sans: [
          "Noto Sans SC",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      boxShadow: {
        paper: "0 1px 0 rgba(60, 50, 30, 0.04), 0 4px 16px rgba(60, 50, 30, 0.06)",
        ring: "0 0 0 1px rgba(60, 50, 30, 0.06)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
