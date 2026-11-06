import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { ProjectHeading } from "@/content/projects";
import { cn } from "@/lib/utils";

interface TocRailProps {
  headings: ProjectHeading[];
  scrollRef: RefObject<HTMLDivElement | null>;
  className?: string;
}

/**
 * 右侧目录轨道
 * ------------------------------------------------------------------
 * 滚动高亮追踪 + 平滑锚点跳转；窄视口收起为右下角胶囊。
 */
export function TocRail({ headings, scrollRef, className }: TocRailProps) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const lockUntil = useRef(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let frame = 0;
    const sync = () => {
      frame = 0;
      if (Date.now() < lockUntil.current) return;

      const containerTop = container.getBoundingClientRect().top;
      let current = headings[0]?.id ?? "";

      // 滚到底时直接点亮最后一项，避免末节太短而不亮
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 4) {
        setActive(headings[headings.length - 1]?.id ?? "");
        return;
      }

      for (const heading of headings) {
        const el = container.querySelector<HTMLElement>(`[id="${CSS.escape(heading.id)}"]`);
        if (el && el.getBoundingClientRect().top - containerTop <= 72) {
          current = heading.id;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    sync();

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings, scrollRef]);

  const jump = (id: string) => {
    const container = scrollRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`);
    if (!el) return;
    const top =
      el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 28;
    lockUntil.current = Date.now() + 800;
    setActive(id);
    container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    setOpen(false);
  };

  if (headings.length === 0) return null;

  const items = (compact = false) => (
    <nav className="flex flex-col gap-2.5">
      {headings.map((heading) => {
        const isActive = active === heading.id;
        return (
          <button
            key={heading.id}
            type="button"
            onClick={() => jump(heading.id)}
            className={cn(
              "relative text-left text-xs leading-snug transition-colors duration-300",
              heading.level === 3 && "pl-3",
              isActive ? "font-medium text-[#111214]" : "text-[#8b8e95] hover:text-[#111214]",
              compact && "w-full",
            )}
          >
            <span
              className={cn(
                "absolute -left-3 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#5b5ff0] transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
            {heading.text}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className={cn("hidden w-1/4 shrink-0 border-l border-[#F1EFEA] lg:block", className)}>
        <div className="flex h-full flex-col gap-4 overflow-y-auto px-7 pb-10 pt-20">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-faint">
            On this page
          </span>
          {items()}
        </div>
      </aside>

      <div className="absolute bottom-6 right-6 z-30 lg:hidden">
        {open ? (
          <div className="absolute bottom-12 right-0 w-60 rounded-[16px] border border-[#ECECEE] bg-card p-4 shadow-[0_8px_30px_rgba(17,18,20,0.10)]">
            <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.2em] text-faint">
              On this page
            </span>
            {items(true)}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="目录"
          className="flex h-10 items-center gap-2 rounded-full border border-[#ECECEE] bg-card px-4 text-[11px] text-ink shadow-[0_8px_30px_rgba(17,18,20,0.08)]"
        >
          目录
        </button>
      </div>
    </>
  );
}
