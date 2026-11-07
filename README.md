# Bento Home

一屏式 Bento 个人主页。开场由 9 只多光标在屏幕中央随机游走，随后把整页逐个元素「搭」出来，搭完后渐隐交棒，
留下一个不滚动、可交互的陶瓷白卡片界面。

**在线预览：<https://owlzo.github.io/>**

- 主页：左 4 列控制台（身份 / 技术栈 / 社交 + 留言入口）+ 右 8 列作品舞台（1+2 非对称拼图）
- 作品详情：右侧弹簧抽屉，内部是独立的 Markdown 文档阅读器（正文 + 粘性目录）
- 视觉：陶瓷白 `#F7F4EF`、实色白卡、1px 细边框、双层软阴影、织物纹理背景

## 特性

- **多光标搭建开场**：9 只具名光标，18 个任务（卡片 / 内容块 / 作品拼图），
  逐字打字 + 拉框，方向四向/四角打散，可暂停、重播、回退
- **一屏不滚动**：1280×720 → 1920×1080 全档位 `scrollHeight === clientHeight`
- **作品即文档**：每个作品是一份 Markdown，`##`/`###` 自动生成右侧目录并滚动高亮
- **物理动效**：抽屉弹簧过冲、3D 卡片 85% 强度倾斜、FloatingDock 放大、留言弹窗原位弹射
- **零自定义 CSS**：全部由 Tailwind 类名控制（唯一例外见 `AGENTS.md`）

## 技术栈

| 关注点 | 选型 |
| --- | --- |
| 构建 | Vite 8 + React 19 + TypeScript 7 |
| 样式 | Tailwind CSS 3 |
| 动效 | Framer Motion + Canvas 2D（开场光标层） |
| 组件 | Magic UI（BentoGrid / BorderBeam / InteractiveHoverButton）、Aceternity（FloatingDock / 3D Card / PlaceholdersAndVanishInput）、cult-ui（BackgroundImageTexture） |
| 文档 | Markdown + `marked` |

## 快速开始

要求 Node.js **>= 20.19**。

```bash
npm install
npm run dev        # http://localhost:5173
```

构建与本地预览：

```bash
npm run build      # tsc --noEmit && vite build
npm run preview    # 预览 dist，默认 http://localhost:4173
npm run typecheck  # 仅类型检查
```

## 目录结构

```
.
├─ .github/workflows/deploy.yml   # GitHub Pages 自动部署
├─ public/
│  ├─ covers/*.svg                # 作品封面（矢量）
│  ├─ textures/*.png              # 织物纹理（fabric-of-squares / inflicted）
│  ├─ favicon.svg
│  └─ .nojekyll
├─ src/
│  ├─ App.tsx                     # 只做布局与层级挂载
│  ├─ content/
│  │  ├─ profile.ts               # 所有个人内容（唯一需要改的配置文件）
│  │  └─ projects/*.md            # 作品详情文档（_TEMPLATE.md 为模板）
│  ├─ components/
│  │  ├─ PageShell.tsx            # 单屏外壳（页头 + 纹理背景）
│  │  ├─ BentoGridLayout.tsx      # 4 / 8 分栏拼装
│  │  ├─ CursorCanvasLayer.tsx    # 多光标搭建开场
│  │  ├─ cards/                   # 四张卡各自独立组件
│  │  ├─ contact/                 # 留言弹窗
│  │  ├─ project/                 # 作品详情抽屉 + 目录
│  │  ├─ magicui/ · ui/           # 组件库（本地 vendor）
│  │  └─ leibox/                  # LeiBox 拉取的参考源码（不参与打包）
│  └─ lib/                        # cn() / asset()
├─ tailwind.config.js
└─ vite.config.ts
```

## 内容定制

**1. 个人信息** — `src/content/profile.ts`

姓名、头像、标语、定位、技术栈、关注领域、作品列表、社交链接、留言弹窗文案。
组件里不硬编码任何个人内容。

**2. 作品详情** — `src/content/projects/<slug>.md`

复制 `_TEMPLATE.md`，改名后填写 frontmatter 与正文：

```md
---
title: "Raycast Extension"
year: "2025"
category: "Productivity Tool"
role: "Lead Designer & Developer"
cover: "/covers/raycast.svg"
---

## 概述与灵感
...
```

然后在 `profile.ts` 的对应作品上填 `doc: "<slug>"`。

**3. 静态资源** — `public/covers`、`public/textures`，用 `/covers/xxx.svg` 这样的绝对路径引用即可，
构建时会自动加上部署前缀。

## 部署到 GitHub Pages

仓库已内置 `.github/workflows/deploy.yml`，推送到 `main` 即自动构建并发布到 GitHub Pages。

### 你需要做的事

1. **建仓库**
   - 想要 `https://<user>.github.io/` 这种根地址：仓库名必须是 `<user>.github.io`
   - 其他仓库名也可以，地址会变成 `https://<user>.github.io/<repo>/`（workflow 会自动处理 base 前缀）
   - GitHub 免费账户的 Pages 只对 **public** 仓库开放

2. **推送代码**

   ```bash
   git init
   git add .
   git commit -m "chore: init bento home"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```

3. **打开 Pages**

   仓库 → **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**（只需设置一次）。

4. **等 Actions 跑完**

   **Actions** 标签页里 `Deploy to GitHub Pages` 变绿后，访问：
   - 用户页：`https://<user>.github.io/`
   - 项目页：`https://<user>.github.io/<repo>/`

   首次部署成功后，deploy job 的 `page_url` 就是最终地址。

5. **（可选）绑定自定义域名**

   Settings → Pages → Custom domain 填域名，并在 DNS 加一条 CNAME 记录。

### 部署细节

- workflow 用 `npm ci` + Node 22 构建，产物 `dist` 通过官方 `upload-pages-artifact` / `deploy-pages` 发布
- base 前缀由 workflow 自动判定：仓库名以 `.github.io` 结尾 → `/`，否则 → `/<repo>/`
- 本地想验证子路径部署：`VITE_BASE=/<repo>/ npm run build && npm run preview`
- `public/.nojekyll` 已就位，避免 GitHub 的 Jekyll 处理干扰 `_` 开头的文件名

## 浏览器要求

Chrome / Edge / Firefox ≥ 111，Safari ≥ 16.4（依赖 `:has`、`color-mix` 之外的基础能力与现代 CSS 变量）。
视图为桌面优先：< 1024px 时布局会退化为单列，作品目录收成右下角胶囊。

## 第三方与许可

- Magic UI、Aceternity UI、cult-ui 组件以源码形式 vendor 在 `src/components/`，遵循其各自许可
- `src/components/leibox/` 为 LeiBox 组件库（https://leibox.pantoria.cn）拉取的参考实现，未参与打包
- 本项目自身代码未声明开源许可，如需公开请自行补充 `LICENSE`
