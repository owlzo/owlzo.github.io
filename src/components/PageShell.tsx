import { BentoGridLayout } from "@/components/BentoGridLayout";
import { useContact } from "@/components/contact/ContactProvider";
import { useProject } from "@/components/project/ProjectProvider";
import { BackgroundImageTexture } from "@/components/ui/bg-image-texture";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

/**
 * PageShell
 * ------------------------------------------------------------------
 * 单屏页面外壳：max-w-1440 画框 + 克制留白，桌面端严格一屏、永不滚动。
 * 背景铺 cult-ui 的 fabric-of-squares 织物纹理；有任何浮层时整页降到 opacity-40。
 */
export function PageShell({ className }: { className?: string }) {
  const { open } = useContact();
  const { project } = useProject();
  const dimmed = open || Boolean(project);

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-canvas text-ink",
        "px-6 py-4 md:px-8 md:py-5",
        "transition-[opacity,filter] duration-100 ease-out",
        dimmed && "opacity-40 saturate-[0.92] brightness-[0.99]",
        className,
      )}
    >
      <BackgroundImageTexture
        variant="fabric-of-squares"
        opacity={0.88}
        className="pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col">
        <header className="flex h-8 shrink-0 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rotate-45 rounded-[3px] border-2 border-ink" />
            <span
              data-type-target=""
              className="text-[12px] font-medium uppercase tracking-[0.22em] text-ink"
            >
              {profile.brand}
            </span>
          </div>
          <span
            data-reveal
            className="text-[10.5px] uppercase tracking-[0.18em] text-faint"
          >
            {profile.headerLabel}
          </span>
        </header>

        <BentoGridLayout />
      </div>
    </div>
  );
}
