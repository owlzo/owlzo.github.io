import { BentoCard } from "@/components/magicui/bento-grid";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
}

/** Card 2 · 技术栈与 Focus（左栏 38%） */
export function StackCard({ className }: CardProps) {
  const { stack, focus, labels } = profile;

  return (
    <BentoCard className={cn("p-6", className)}>
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div data-reveal className="flex shrink-0 flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-faint">
              {labels.stack}
            </span>
            <span className="text-[10px] tabular-nums text-faint">
              {String(stack.length).padStart(2, "0")}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#ECECEE] bg-card-soft px-2.5 py-1 text-[11.5px] leading-none text-ink"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div data-reveal className="my-4 h-px w-full shrink-0 bg-[#F1EFEA]" />

        <div data-reveal className="flex min-h-0 flex-col">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-faint">
            {labels.focus}
          </span>
          <div className="mt-2.5 flex flex-col gap-2">
            {focus.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 shrink-0 rounded-full bg-ink" />
                <span className="text-[12.5px] text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
