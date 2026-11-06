import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Magic UI · InteractiveHoverButton（shadcn 拉取后按本项目配色改写）
 * 使用具名 group（group/btn），避免被外层卡片的 group 误触发。
 */
export function InteractiveHoverButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "group/btn relative w-auto cursor-pointer overflow-hidden rounded-[12px] border border-[#ECECEE] bg-card px-4 py-2 text-center text-[11.5px] font-medium text-ink transition-colors duration-300",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-ink transition-all duration-300 group-hover/btn:scale-[120]" />
        <span className="inline-block whitespace-nowrap transition-all duration-300 group-hover/btn:translate-x-10 group-hover/btn:opacity-0">
          {children}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="text-card absolute top-0 z-10 flex h-full w-full translate-x-10 items-center justify-center gap-1.5 whitespace-nowrap opacity-0 transition-all duration-300 group-hover/btn:-translate-x-3 group-hover/btn:opacity-100"
      >
        <span>{children}</span>
        <ArrowRight className="h-3 w-3" />
      </div>
    </button>
  );
}
