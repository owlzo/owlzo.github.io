import { BentoCard } from "@/components/magicui/bento-grid";
import { useProject } from "@/components/project/ProjectProvider";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { profile, type WorkItem, type WorkTone } from "@/content/profile";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
}

const TONE: Record<WorkTone, string> = {
  sand: "bg-[#EDE7DA]",
  clay: "bg-[#E5D7C6]",
  ink: "bg-[#2C2A29]",
};

/** 单个作品：3D 卡片（动效 85% 强度，仅悬停该卡时触发），文字 40% / 图片 60% */
function ProjectCard({
  work,
  index,
  flagship,
}: {
  work: WorkItem;
  index: number;
  flagship: boolean;
}) {
  const { openProject } = useProject();

  return (
    <CardContainer containerClassName="h-full w-full py-0" className="h-full w-full">
      <CardBody className="h-full w-full rounded-[18px] border border-[#ECECEE] bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_30px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => openProject(work)}
          aria-label={`打开 ${work.title} 详情`}
          className="flex h-full w-full cursor-pointer flex-col text-left [transform-style:preserve-3d]"
        >
          <div
            className={cn(
              "flex h-[40%] flex-col justify-between [transform-style:preserve-3d]",
              flagship ? "p-6" : "p-4",
            )}
          >
            <div className="flex items-center justify-between">
              <CardItem
                translateZ={42}
                className="text-[10px] font-medium tracking-[0.2em] text-faint"
              >
                {String(index + 1).padStart(2, "0")}
              </CardItem>
              <CardItem translateZ={42} className="text-[10px] text-faint">
                {work.meta}
              </CardItem>
            </div>

            <div className="flex flex-col gap-1.5">
              <CardItem
                translateZ={51}
                className={cn(
                  "font-medium tracking-[-0.01em] text-ink",
                  flagship ? "text-[21px] leading-[1.15]" : "text-[14px] leading-tight",
                )}
              >
                {work.title}
              </CardItem>
              <CardItem
                translateZ={51}
                className={cn(
                  "text-muted",
                  flagship ? "text-[12px] leading-relaxed" : "text-[11px] leading-relaxed",
                )}
              >
                {work.description}
              </CardItem>
            </div>
          </div>

          <div className="h-[60%] w-full px-5 pb-5">
            <CardItem
              translateZ={85}
              className="h-full w-full overflow-hidden rounded-[14px]"
            >
              {work.cover ? (
                <img
                  src={asset(work.cover)}
                  alt={work.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className={cn("h-full w-full", TONE[work.tone])} />
              )}
            </CardItem>
          </div>
        </button>
      </CardBody>
    </CardContainer>
  );
}

/** 右栏 · 作品展示舞台（8 列）：1 张旗舰大卡 + 2 张次级卡的非对称拼图 */
export function WorksCard({ className }: CardProps) {
  const { works, labels } = profile;
  const [flagship, ...compact] = works;

  return (
    <BentoCard className={cn("p-6 md:p-7", className)}>
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <header data-reveal className="flex shrink-0 items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-faint">
              {labels.works}
            </h2>
            <p className="truncate text-[12px] leading-relaxed text-muted">
              {labels.worksSubtitle}
            </p>
          </div>
          <a
            href="#works"
            className="shrink-0 whitespace-nowrap text-[11.5px] text-muted transition-colors duration-300 hover:text-ink"
          >
            {labels.worksArchive} →
          </a>
        </header>

        <div
          id="works"
          className="mt-5 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-4"
        >
          {flagship ? (
            <div data-reveal data-build-clip className="row-span-2 min-h-0">
              <ProjectCard work={flagship} index={0} flagship />
            </div>
          ) : null}

          {compact.slice(0, 2).map((work, index) => (
            <div key={work.title} data-reveal data-build-clip className="min-h-0">
              <ProjectCard work={work} index={index + 1} flagship={false} />
            </div>
          ))}
        </div>

        <footer
          data-reveal
          className="mt-4 flex shrink-0 items-center justify-between border-t border-[#F1EFEA] pt-3"
        >
          <span className="text-[10.5px] text-faint">{labels.worksHint}</span>
          <span className="tabular-nums text-[10.5px] text-faint">
            {String(works.length).padStart(2, "0")} {labels.worksCount}
          </span>
        </footer>
      </div>
    </BentoCard>
  );
}
