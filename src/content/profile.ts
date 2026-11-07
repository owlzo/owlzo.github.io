/**
 * 个人主页内容配置
 * ------------------------------------------------------------------
 * 只改这一个文件：页面与开场搭建动画都会自动跟随。
 * 所有字段都允许替换成你自己的信息；数组长度可自由增减。
 */

export type WorkTone = "sand" | "clay" | "ink";
export type SocialIconKey = "github" | "x" | "xiaohongshu" | "douyin";

export interface WorkItem {
  /** 作品名 */
  title: string;
  /** 副信息：年份 / 类型 */
  meta: string;
  /** 一句话描述（作品卡第二行） */
  description: string;
  /** 跳转链接，暂可填 "#" */
  href: string;
  /** 封面图：放到 public/ 下后填 "/covers/xxx.svg"；留空则用 tone 色块兜底 */
  cover?: string;
  /** 无封面时的兜底色：sand 米白 / clay 陶土 / ink 墨黑 */
  tone: WorkTone;
  /** 详情文档：对应 src/content/projects/<doc>.md 的文件名 */
  doc?: string;
}

export interface SocialItem {
  label: string;
  href: string;
  icon: SocialIconKey;
}

export interface ProfileConfig {
  /** 页头字标（开场会被逐字敲出来） */
  brand: string;
  /** 页头右侧小字 */
  headerLabel: string;
  name: string;
  role: string;
  /** 头像：没有图片时用 initials 显示字母标记 */
  avatar: { initials: string; image?: string };
  /** 主标语（衬线体），建议 30–45 个字符 */
  headline: string;
  /** 标语下的一句话定位 */
  intro: string;
  /** 技术栈胶囊 */
  stack: string[];
  /** 当前关注领域 */
  focus: string[];
  /** 各区块小标题 */
  labels: {
    stack: string;
    focus: string;
    works: string;
    worksSubtitle: string;
    worksArchive: string;
    worksHint: string;
    worksCount: string;
    /** 社交卡顶部文案 */
    social: string;
  };
  /** 精选作品：works[0] 为旗舰大卡（左 1 列满高），works[1..2] 为右侧上下两张次级卡 */
  works: WorkItem[];
  /** 留言弹窗 */
  contact: {
    button: string;
    hint: string;
    success: string;
    /** 微信号（会编码成二维码） */
    wechat: string;
    /** 可选：换成你自己的二维码图片，如 `/art/wechat-qr.png` */
    wechatQr?: string;
  };
  /** 底部社交（FloatingDock） */
  socials: SocialItem[];
}

export const profile: ProfileConfig = {
  brand: "bento",
  headerLabel: "Portfolio — 2026",

  name: "Lei",
  role: "Design Engineer",
  avatar: { initials: "L" },

  headline: "Building interfaces that feel physical.",
  intro: "把空间感、材质与动效写进浏览器里。",

  stack: ["React", "TypeScript", "Three.js", "WebGL", "GSAP", "Python"],

  focus: ["Spatial UI", "Realtime Animation"],

  labels: {
    stack: "Stack",
    focus: "Focus",
    works: "Selected Works",
    worksSubtitle: "A few projects I keep coming back to — 2023 → 2026.",
    worksArchive: "Explore all archives",
    worksHint: "点击任一作品查看详情",
    worksCount: "Projects",
    social: "在这些地方可以了解我",
  },

  works: [
    {
      title: "Raycast Extension",
      meta: "2025 · Productivity",
      description: "把日常命令收进一个面板：40+ 动作、模糊搜索与实时预览。",
      href: "#",
      cover: "/covers/raycast.svg",
      tone: "sand",
      doc: "raycast",
    },
    {
      title: "Neural Canvas",
      meta: "2025 · Generative",
      description: "节点式生成画布与实时预览",
      href: "#",
      cover: "/covers/neural.svg",
      tone: "ink",
      doc: "neural-canvas",
    },
    {
      title: "Motion Atlas",
      meta: "2024 · Library",
      description: "可复用的 60 组缓动与编排",
      href: "#",
      cover: "/covers/atlas.svg",
      tone: "clay",
      doc: "motion-atlas",
    },
  ],

  contact: {
    button: "说些什么",
    hint: "Enter 发送 · Esc 关闭",
    success: "收到了，我会尽快回复。",
    wechat: "owlzo",
    wechatQr: "",
  },

  socials: [
    { label: "GitHub", href: "https://github.com", icon: "github" },
    { label: "X", href: "https://x.com", icon: "x" },
    { label: "小红书", href: "https://www.xiaohongshu.com", icon: "xiaohongshu" },
    { label: "抖音", href: "https://www.douyin.com", icon: "douyin" },
  ],
};



