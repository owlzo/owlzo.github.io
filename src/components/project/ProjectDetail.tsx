import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { projectDocs } from "@/content/projects";
import { useProject } from "@/components/project/ProjectProvider";
import { TocRail } from "@/components/project/TocRail";
import { BackgroundImageTexture } from "@/components/ui/bg-image-texture";

/**
 * 作品详情抽屉 · 文档阅读器
 * ------------------------------------------------------------------
 * 从视口右侧被弹簧惯性拉入（85vw，左留 15vw）。
 * 左 75% 为可滚动的 Markdown 正文（max-w-2xl 居中），右 25% 为粘性目录。
 */
const SPRING = { type: "spring", stiffness: 340, damping: 26, mass: 0.9 } as const;

/** Markdown 排版系统：衬线标题 + 无衬线正文 + 等宽元数据 */
const ARTICLE_TYPOGRAPHY = [
  "[&_h1]:font-serif [&_h1]:text-2xl [&_h1]:font-normal [&_h1]:tracking-tight [&_h1]:text-[#111214] [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-[#ECECEE] [&_h1]:pb-2",
  "[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:tracking-tight [&_h2]:text-[#111214] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:border-b [&_h2]:border-[#ECECEE] [&_h2]:pb-2 [&_h2]:scroll-mt-8",
  "[&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-normal [&_h3]:text-[#111214] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-8",
  "[&_p]:mb-4 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-[#4A4D55]",
  "[&_ul]:mb-4 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_ul]:marker:text-[#C9C4BC]",
  "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-[#4A4D55]",
  "[&_strong]:font-medium [&_strong]:text-[#111214]",
  "[&_code]:rounded [&_code]:bg-[#F7F4EF] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-[#5b5ff0]",
  "[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-[14px] [&_pre]:bg-[#2C2A29] [&_pre]:p-4 [&_pre]:shadow-[0_8px_24px_rgba(44,42,41,0.12)]",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[11.5px] [&_pre_code]:leading-relaxed [&_pre_code]:text-[#F7F4EF]",
  "[&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-[#111214] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#6E717C]",
  "[&_blockquote_p]:mb-0 [&_blockquote_p]:text-[#6E717C]",
  "[&_img]:my-5 [&_img]:w-full [&_img]:rounded-[14px] [&_img]:border [&_img]:border-[#F1EFEA]",
  "[&_a]:text-[#5b5ff0] [&_a]:underline [&_a]:underline-offset-2",
  "[&_hr]:my-8 [&_hr]:border-[#F1EFEA]",
  "[&_table]:w-full [&_table]:text-sm",
].join(" ");

export function ProjectDetail() {
  const { project, closeProject } = useProject();
  const scrollRef = useRef<HTMLDivElement>(null);
  const doc = project?.doc ? projectDocs[project.doc] : undefined;

  useEffect(() => {
    if (!project) return;
    scrollRef.current?.scrollTo({ top: 0 });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, closeProject]);

  const title = doc?.title ?? project?.title ?? "";
  const year = doc?.year ?? project?.meta.split("·")[0]?.trim() ?? "";
  const category = doc?.category ?? project?.meta.split("·")[1]?.trim() ?? "";
  const role = doc?.role ?? "";
  const tags = [year, category, role].filter(Boolean);

  return (
    <AnimatePresence>
      {project ? (
        <>
          <motion.div
            key="project-backdrop"
            data-project-backdrop=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            onClick={closeProject}
            className="fixed inset-0 z-[55] bg-[#111214]/15 backdrop-blur-[2px]"
          />

          <motion.aside
            key="project-panel"
            data-project-panel=""
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={SPRING}
            className="fixed inset-y-0 right-0 z-[56] flex w-[85vw] overflow-hidden rounded-l-[24px] border-l border-[#ECECEE] bg-canvas shadow-[-30px_0_80px_rgba(17,18,20,0.12)]"
          >
            <BackgroundImageTexture
              variant="inflicted"
              opacity={0.44}
              className="pointer-events-none absolute inset-0"
            />

            <motion.button
              type="button"
              onClick={closeProject}
              aria-label="关闭详情"
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="group/close absolute right-5 top-5 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-[#ECECEE] bg-[#F7F4EF] text-[#55585f] transition-colors duration-200 hover:border-[#111214] hover:bg-[#111214] hover:text-white hover:shadow-[0_10px_26px_rgba(17,18,20,0.18)]"
            >
              <XIcon className="h-4 w-4" strokeWidth={1.5} />
            </motion.button>

            <div className="relative flex h-full min-h-0 w-full">
              <div
                ref={scrollRef}
                data-project-scroll=""
                className="h-full min-h-0 w-3/4 overflow-y-auto overscroll-contain"
              >
                <article className="mx-auto w-full max-w-2xl px-10 py-14">
                  <header data-reveal className="flex flex-col gap-4 border-b border-[#ECECEE] pb-8">
                    <div className="flex flex-wrap items-center gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#ECECEE] bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h1 className="font-serif text-[clamp(32px,3.2vw,46px)] font-normal leading-[1.08] tracking-[-0.02em] text-[#111214]">
                      {title}
                    </h1>

                    <p className="text-[11.5px] leading-relaxed text-muted">
                      {project.description}
                    </p>
                  </header>

                  {doc ? (
                    <div className={ARTICLE_TYPOGRAPHY} dangerouslySetInnerHTML={{ __html: doc.html }} />
                  ) : (
                    <p className="mt-8 text-sm leading-relaxed text-[#4A4D55]">
                      这个作品还没有撰写完整文档。复制 <span className="font-mono text-xs text-[#5b5ff0]">src/content/projects/_TEMPLATE.md</span> 新建
                      <span className="font-mono text-xs text-[#5b5ff0]"> {project.doc ?? "slug"}.md</span> 即可。
                    </p>
                  )}

                  <footer className="mt-14 flex items-center justify-between border-t border-[#F1EFEA] pt-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                      {year} · {category}
                    </span>
                    <button
                      type="button"
                      onClick={closeProject}
                      className="text-[11px] text-muted transition-colors duration-300 hover:text-ink"
                    >
                      返回作品列表
                    </button>
                  </footer>
                </article>
              </div>

              <TocRail headings={doc?.headings ?? []} scrollRef={scrollRef} />
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
