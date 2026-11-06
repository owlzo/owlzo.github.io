import { ProfileCard } from "@/components/cards/ProfileCard";
import { StackCard } from "@/components/cards/StackCard";
import { StatusDockCard } from "@/components/cards/StatusDockCard";
import { WorksCard } from "@/components/cards/WorksCard";
import { BentoGrid } from "@/components/magicui/bento-grid";

/**
 * BentoGridLayout
 * ------------------------------------------------------------------
 * 12 列分栏：左 4 列纵向控制台（42% / 38% / 15%），右 8 列作品舞台（满高）。
 * 一屏内完成，不产生滚动。
 */
export function BentoGridLayout() {
  return (
    <main className="mt-4 flex min-h-0 flex-1 flex-col">
      <BentoGrid className="h-full min-h-0 grid-cols-1 gap-4 md:grid-cols-12">
        <div className="flex min-h-0 flex-col justify-between gap-4 md:col-span-4 md:gap-0">
          <ProfileCard className="h-[42%]" />
          <StackCard className="h-[38%]" />
          <StatusDockCard className="h-[15%]" />
        </div>

        <WorksCard className="min-h-0 md:col-span-8" />
      </BentoGrid>
    </main>
  );
}
