/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      /* ---------- 陶瓷白设计标记 ---------- */
      colors: {
        // 主背景：陶瓷白
        canvas: "#F7F4EF",
        // 卡片：实色陶瓷白（绝不做半透明）
        card: {
          DEFAULT: "#FFFFFF",
          soft: "#FAFAFA",
        },
        // 文字：炭灰
        ink: "#2C2A29",
        muted: "#8A857D",
        faint: "#B7B1A7",
        // 极细边框 / 骨架底色
        line: "#ECECEE",
        mist: "#F0EDE7",
        // 点缀色：陶土与沙
        sand: "#C9B79C",
        clay: "#B9A489",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"Noto Sans SC"',
          "sans-serif",
        ],
        serif: [
          '"Instrument Serif"',
          "Georgia",
          '"Times New Roman"',
          '"Songti SC"',
          '"Noto Serif SC"',
          "ui-serif",
          "serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        card: "24px",
        frame: "28px",
      },
      /* ---------- 双层软阴影 ---------- */
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.04)",
        "soft-lg": "0 2px 4px rgba(0,0,0,0.04), 0 18px 50px rgba(0,0,0,0.06)",
        "soft-inset": "inset 0 1px 0 rgba(255,255,255,0.85)",
        frame: "0 1px 2px rgba(0,0,0,0.05), 0 24px 70px rgba(0,0,0,0.06)",
      },
      transitionTimingFunction: {
        ceramic: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      /* ---------- Magic UI / Bento 动效 keyframes ---------- */
      keyframes: {
        // 骨架屏微弱闪烁
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.62" },
        },
        // 骨架屏流光
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        // BorderBeam 沿卡片边框巡游
        "border-beam": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // 开场光标缓浮
        "float-soft": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        // 开场 Logo 呼吸环
        "ring-pulse": {
          "0%": { transform: "scale(0.86)", opacity: "0.5" },
          "70%": { transform: "scale(1.55)", opacity: "0" },
          "100%": { transform: "scale(1.55)", opacity: "0" },
        },
      },
      animation: {
        "skeleton-pulse": "skeleton-pulse 2.6s ease-in-out infinite",
        shimmer: "shimmer 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "border-beam": "border-beam 9s linear infinite",
        "border-beam-slow": "border-beam 16s linear infinite",
        "float-soft": "float-soft 6s ease-in-out infinite",
        "ring-pulse": "ring-pulse 2.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
