import { useCallback, useState } from "react";
import { ContactDialog } from "@/components/contact/ContactDialog";
import { ContactProvider } from "@/components/contact/ContactProvider";
import { CursorCanvasLayer } from "@/components/CursorCanvasLayer";
import { PageShell } from "@/components/PageShell";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { ProjectProvider } from "@/components/project/ProjectProvider";
import { cn } from "@/lib/utils";

/**
 * App
 * ------------------------------------------------------------------
 * 单屏个人主页：页面永不滚动（PC web 一屏）。
 * 开场层从同一份 PageShell 结构上「搭」出页面，结束时无缝交棒。
 * 留言弹窗与作品详情面板单实例挂在根部。
 */
export default function App() {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <ContactProvider>
      <ProjectProvider>
        <div className="relative h-dvh w-full overflow-hidden bg-canvas text-ink">
          <div
            className={cn("h-full w-full", introComplete ? "" : "pointer-events-none")}
            aria-hidden={introComplete ? undefined : true}
          >
            <PageShell />
          </div>

          {introComplete ? null : <CursorCanvasLayer onIntroComplete={handleIntroComplete} />}

          <ContactDialog />
          <ProjectDetail />
        </div>
      </ProjectProvider>
    </ContactProvider>
  );
}
