# AGENTS.md · bento-home

> 每次对话开始前先读本文件。与任何代码、注释、口头约定冲突时，以本文件为准。
> 最近更新：Round 6 交付后（留言弹窗 + 3D 85% + 开场适配 1+2）。

---

## 0. 协作规则（硬性，最高优先级）

1. **不做截图，不做截图式视觉验证。** 当前模型没有图像输入能力，截图对我无效。
   验证一律用可编程手段：DOM 尺寸、`getComputedStyle`、Canvas `getImageData` 像素统计、
   Playwright 断言、打包产物 CSS 检索。禁止用「看起来没问题」代替实测。
2. **逐轮打分制。** 用户每轮给 0–100 分，**90 分及格**。
   未达到 90 分之前：不推进下一步开发、不扩展功能、不写「下一轮建议」、不主动重构无关部分，
   只修当前这一轮的扣分项。
3. **最终回复不展示代码。** 不贴代码块、不贴 diff、不逐段解释实现。
   只给：做了什么、实测数值、如何验收。用户自行检查效果。
4. **每轮必须附可复现的实测数值**（尺寸、坐标、像素数、耗时），不夸大、不臆测。
   没验证的项必须显式标注「未验证」。
5. **改布局 = 必须同步改开场搭建。** 卡片增删、列宽/行高变化、内部子块结构变化，
   都要同步更新开场层：卡片顺序与时间轴（`CARD_GAP`）、`data-reveal` 揭示单元、
   子块 `data-build-clip`、光标落点与 `T_TOTAL`，并重新验证交棒几何为 0px。
   不允许「页面改了、开场还是老样子」。

---

## 1. 视觉规范（不可自行发挥）

| 项 | 规定 |
| --- | --- |
| 主背景 | 陶瓷白 `#F7F4EF` |
| 卡片底色 | 实色 `#FFFFFF`（允许 `#FAFAFA`），**禁止半透明底** |
| 文字 | 炭灰 `#2C2A29`，次级 `#8A857D`，弱化 `#B7B1A7` |
| 边框 | `border border-[#ECECEE]`（1px 极细） |
| 圆角 | `rounded-[24px]` |
| 阴影 | `shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_30px_rgba(0,0,0,0.04)]` |
| 主标语字体 | 衬线 `font-serif` |

**硬性禁止**：`backdrop-blur-*`、`bg-white/70`、`blur-*`、`filter: blur()`、自定义 CSS、用 CSS 变量绕过 Tailwind。

**五处明确例外（仅此五处，不得扩散）**

1. 开场搭建层用 `element.style.clipPath / opacity / transform` 做逐帧动画。
2. `ui/floating-dock.tsx` 用 `style={{ width, height }}` 绑定 motion value（放大动效管线）。
3. `ui/3d-card.tsx` 用 `element.style.transform` 写入倾斜与视差。
4. **浮层遮罩**（留言弹窗 / 作品详情抽屉）：`bg-[#111214]/15` + `backdrop-blur-[2px]` ——
   用户明确指定的沉浸式防干扰效果，仅这两处可用半透明与模糊。
5. `ui/bg-image-texture.tsx` 用 inline style 写 `backgroundImage` 与 `opacity`（cult-ui 原组件）。

---

## 2. 组件与架构

- Magic UI：`@/components/magicui/...`（`BentoGrid`、`BentoCard`、`BorderBeam`）。
- shadcn 拉取：Aceternity `FloatingDock`、`3D Card`、`PlaceholdersAndVanishInput`，Magic UI `InteractiveHoverButton`。
- **卡片即组件**：`ProfileCard` / `StackCard` / `StatusDockCard` / `WorksCard`；`BentoGridLayout` 只做拼装。
- **所有个人内容集中在 `src/content/profile.ts`**：组件不得硬编码姓名、标语、作品、社交、弹窗文案。
- **运行时静态资源一律走 `asset()`**（`src/lib/asset.ts`），自动带 `BASE_URL` 以兼容 GitHub Pages 子路径。
- **作品详情是独立的 Markdown 文档**：`src/content/projects/<slug>.md`（frontmatter + 正文），
  由 `src/content/projects/index.ts` 用 `import.meta.glob(?raw)` + `marked` 解析；
  `profile.works[i].doc` 指向 slug。`_TEMPLATE.md` 是结构模板，下划线开头不参与加载。
- 背景纹理用 cult-ui `BackgroundImageTexture`（`fabric-of-squares`，opacity 0.88），
  素材在 `public/textures/`。
- 作品封面 `public/covers/*.svg`（矢量，任意尺寸清晰）。

---

## 3. 布局与交互

- **PC web 严格一屏、不允许滚动**；任意分辨率 `documentElement.scrollHeight === clientHeight`。
- 外层 `max-w-[1440px]`，留白 `px-6 md:px-8 py-4 md:py-5`，12 列，`gap-4`。
- **左栏 4 列**：`flex flex-col justify-between`，三卡 42% / 38% / 15%
  - Card 1 · 40px 头像 + 衬线标语 + 一句定位（无按钮）
  - Card 2 · Stack 胶囊 + 1px 分隔线 + Focus
  - Card 3 · 文案「在这些地方可以了解我」+ FloatingDock（GitHub / X / 小红书 / 抖音）+ 右侧「说些什么」按钮
- **右栏 8 列**：满高作品舞台，非对称 1+2 英雄网格（旗舰 `row-span-2` + 右侧两张）
  - 每张作品：文字 40% + 图片 60%，无按钮
  - 3D 卡片：**强度 85%**（倾斜角与 translateZ ×0.85），**仅悬停该卡触发**
- **留言弹窗**：点击「说些什么」→ 从按钮原位弹射展开到视口正中
  - 起点 = 按钮实际矩形（`getBoundingClientRect`），圆角 12 → 28
  - 弹簧 `stiffness 350 / damping 30`，终点 520×300 居中
  - 遮罩 `bg-[#111214]/15` + `backdrop-blur-[2px]`，100ms 淡入
  - 背景整页 `opacity-40` + 轻微降温（`saturate-[0.92]`），≤120ms 完成
  - 面板内容延后 0.14s 淡入；`Esc` / 点遮罩 / 关闭按钮退出并回缩
- **作品详情抽屉**：点击作品卡 → 面板从视口右侧被弹簧惯性拉入
  - 宽度 `85vw`，左侧留 `15vw` 露出主控台（画框透视，不做 100% 全屏）
  - 弹簧 `stiffness 340 / damping 26 / mass 0.9`：有加速、过冲与回弹阻尼
  - 遮罩同留言板（`bg-[#111214]/15` + `blur(2px)`），整页 `opacity-40`
  - **面板自用背景纹理**：`inflicted` @ opacity 0.44（主页是 `fabric-of-squares` @ 0.88，两者分开）
  - 关闭按钮（右上角）：
    - 静止：`h-8 w-8 rounded-full`，`bg-[#F7F4EF]` + `border-[#ECECEE]`，Lucide X `strokeWidth 1.5`、`#55585f`
    - 悬停：底色反转为 `#111214`、图标转白、`rotate-90` + `scale 1.08`（弹簧 420/22）、浮现柔和阴影
    - 按下：`scale 0.95`，松开触发抽回收回并解除背景虚化
  - 退出三通道：点左侧 15% 空白 / 右上角 × / `Esc`；沿原路弹回右侧并恢复背景
  - **面板内部是文档阅读器，不是卡片复述**：
    - 左 75% 可滚动正文，`max-w-2xl mx-auto` 居中；右 25% 为目录轨道
    - 顶部 Hero：项目名（衬线）+ 年份 / 分类 / 角色标签（等宽小字），**不再放封面大图**
    - Markdown 排版：h1/h2 衬线 + 下边框、p 用 `#4A4D55`、inline code 用 `#5b5ff0` 等宽、
      pre 用 `#2C2A29` 深色面板、blockquote 左侧 2px 黑边 + 斜体 `#6E717C`
    - 目录：`ON THIS PAGE` 等宽标签、h3 缩进、激活项 `#111214` + 左侧 `#5b5ff0` 圆点、
      滚动高亮（滚到底点亮末项）、点击平滑滚动并锁定 800ms 不被滚动抢走
    - 窄视口目录收起为右下角「目录」胶囊
- 社交卡里的 FloatingDock **不要外框**（`border-0 bg-transparent`），只留四个圆形图标
- 开场：**12 只具名光标 + 逐元素搭建**。
  - 任务粒度 = 每一张卡（frame）+ 卡内每一个 `data-reveal` 内容块 + 页头元素；
    作品舞台的 1+2 三张作品卡各算一个独立任务（`data-build-clip`，对角拉框）。
  - 调度：任务按开始时间排序，在 11 只执行光标间轮转派活，卡内内容按 3 个一波并行；
    第 12 只光标专门拉桌面框 + 敲字标。
  - 视觉语法：
    - 卡片 / 拼图块 → 对角拉框（cross 光标 + 选框 + 尺寸胶囊 + 红色参考线）
    - 块级内容 → 从左到右横向拉出（cross 光标）
    - **文本块 → 先逐字打出（clip-path 按字符步进），再由光标把底边向下拉到最终高度**
      （打字占 70% 时长，拉框占 30%；拉框时显示蓝色选框 + 红色高度标尺）
    - 文本块**不要**再弹属性面板（已按用户要求移除 Text / Inter 面板）
    - 每个任务完成时落一颗涟漪（卡片蓝、内容紫）
  - 空闲光标：任务完成后以**各自固定角度、匀速慢速漂移**（黄金角分散 + 9–16.5px/s），
    并且**退场渐隐期间时钟继续推进**，漂移不会在淡出时冻结。
  - 滚轮可回退；`Space` / `P` 暂停，`R` 重播，`Esc` 跳过；**搭建完成 1s 渐隐**（`prefers-reduced-motion` 0.2s）。
- **开场组件 options（对齐 LeiBox 组件 API）**：`playing`、`speed`(0.25–2)、`skipIntro`、
  `showToolbar`、`onPhaseChange(phase)`、`onReplay()`、`height`、`reducedMotion`。
  工具条显示 阶段 / 进度百分比 / 暂停 / 重播。
- 交互组件的 hover 必须用具名 group（如 `group/btn`），
  避免被 `BentoCard` 外层的 `group` 误触发。

---

## 4. 验收口径

| 检查项 | 通过标准 |
| --- | --- |
| 分辨率 | 1280×720 / 1366×768 / 1440×900 / 1600×900 / 1920×1080 |
| 页面滚动 | 全部 `scrollable === false` |
| 卡片溢出 | `scrollHeight - clientHeight <= 1` |
| 分栏占比 | 左 4 / 右 8；左栏 42% / 38% / 15% |
| 交棒几何 | 真实页与搭建层卡片矩形偏差 `0px` |
| 搭建覆盖 | 页面内所有 `[data-reveal]` 都有对应任务；结束时全部 `clipPath: none` 且 `opacity: 1` |
| 文本搭建 | 先出现「右侧 insets 递减」的打字阶段，再出现「底部 insets 递减」的拉框阶段 |
| 并发度 | 同一帧 ≥8 个内容块处于不同搭建进度 |
| 工具条 | 阶段与百分比随进度变化；暂停后百分比不变；重播回到环绕并继续播放 |
| 节奏 | 拉框段（T_BOARD → T_TOTAL）3.3s；整段开场 ≈6.8s（含 1s 渐隐与加载） |
| 渐隐漂移 | 退场 1s 内画布内容仍在变化（光标持续漂移） |
| 按钮 hover | 悬停卡片时按钮无变化；悬停按钮时圆点放大（scale 120） |
| 3D 强度 | 边缘倾斜 8.26° × 0.85 ≈ 7.0° |
| 弹窗起点 | 首帧等于按钮矩形（±2px），圆角 12px |
| 弹窗终点 | 520×300，中心偏差 0px，圆角 28px |
| 背景 | 遮罩 `rgba(17,18,20,0.15)` + `blur(2px)`；整页 `opacity 0.4` ≤120ms |
| 关闭 | 回缩后卸载，≤0.8s |
| 详情抽屉 | 宽 85vw、左留白 15vw；x 轨迹出现回弹过冲（越过 15% 线 ≥20px 再回到 216） |
| 面板纹理 | 面板内 `inflicted` @ 0.44；主页 `fabric-of-squares` @ 0.88（互不覆盖） |
| 关闭按钮 | 静止 `#F7F4EF`/`#55585f`；悬停底色 `rgb(17,18,20)`、图标白色、transform 含 90° 旋转且 scale≈1.08；按下 scale≈0.95 |
| 文档阅读器 | 正文区 75% / 目录 25%；正文宽 672px（max-w-2xl）；`scrollHeight > clientHeight` |
| 目录高亮 | 滚到底点亮最后一项；点击某项后该项保持激活 |
| 排版 | h2 衬线 + 下边框；inline code `#5b5ff0`；pre 背景 `rgb(44,42,41)`；标签用等宽字体 |
| 详情关闭 | 点 15% 空白 / × / Esc 三条通道都能卸载并恢复背景 |
| 控制台 | `0` error |

---

## 5. 当前状态

- Phase 1–4：骨架 → 单屏 → 真实内容 → 左右分栏（70 / 70 / 80 分）。
- Phase 5：1+2 英雄网格 + 3D Card（60 分）。
- Phase 6：开场适配 1+2 子块 + 3D 85% + 社交卡改版 + 留言弹窗（50 分）。
- Phase 7：按钮 hover 隔离 + 开场逐元素搭建（12 光标调度）（70 分）。
- Phase 8：文本「先打字后拉框」+ Figma 级特效补齐 + 空闲光标随机漂移 + options API 与工具条（80 分）。
- Phase 9：移除文本属性面板 + 渐隐期继续漂移 + 节奏放慢 1s（80 分）。
- Phase 10：社交托盘去除 + 作品详情物理抽屉（85/15、弹簧过冲、三通道关闭）（60 分）。
- Phase 11：作品详情改为 Markdown 文档阅读器（75/25 + 目录高亮）+ cult-ui 织物纹理背景 + 排版系统（70 分）。
- Phase 12：详情面板独立纹理（inflicted 0.44）+ 关闭按钮三态微交互（反转/旋转/缩放）（80 分）。
- Phase 13：GitHub Pages 部署配置 + 仓库规范化（.gitignore / README / 资源前缀）（进行中）。

---

## 6. 发布与仓库规范

- **运行时静态资源一律过 `src/lib/asset.ts` 的 `asset()`**（封面、纹理、Markdown 内图片）。
  直接写死 `/covers/x.svg` 在 GitHub Pages 项目页（`/<repo>/`）会 404。
- 部署：`.github/workflows/deploy.yml`，push 到 `main` 自动构建 + 发布。
  - base 由 workflow 判定：仓库名以 `.github.io` 结尾 → `/`，否则 → `/<repo>/`
  - 本地验证子路径：`VITE_BASE=/<repo>/ npm run build && npm run preview`
  - `public/.nojekyll` 必须保留
- `.gitignore` 覆盖：`node_modules` / `dist` / `.env` / 日志 / 编辑器 / 测试产物
- `README.md` 采用标准结构：简介 → 特性 → 技术栈 → 快速开始 → 目录结构 → 内容定制 →
  部署 → 浏览器要求 → 许可；不写「阶段 / 打分」这类协作过程内容
- GitHub 免费账户的 Pages 仅对 public 仓库可用
