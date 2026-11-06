import { cn } from "@/lib/utils";

/**
 * Magic UI · BorderBeam
 * ------------------------------------------------------------------
 * 沿卡片边框巡游的一束光。
 * 原版依靠内联 CSS 变量驱动，这里改为纯 Tailwind 实现：
 * 旋转 conic-gradient + 1px 内层镂空，只露出一圈极细的进度光。
 * 完全零 style={{}}，零模糊，零半透明底色。
 */
export interface BorderBeamProps {
  className?: string;
  /** 镂空层颜色，必须与所在卡片底色一致 */
  innerClassName?: string;
  duration?: "slow" | "slower";
}

export function BorderBeam({
  className,
  innerClassName = "bg-card",
  duration = "slow",
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute -inset-px overflow-hidden rounded-[inherit]", className)}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "aspect-square w-[180%] shrink-0",
            "bg-[conic-gradient(from_0deg,transparent_0deg,transparent_316deg,#E3D9C8_336deg,#2C2A29_350deg,transparent_360deg)]",
            duration === "slower" ? "animate-border-beam-slow" : "animate-border-beam",
          )}
        />
      </div>
      <div className={cn("absolute inset-px rounded-[inherit]", innerClassName)} />
    </div>
  );
}
