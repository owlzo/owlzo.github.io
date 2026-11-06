import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Magic UI · BentoGrid
 * ------------------------------------------------------------------
 * 基础类只负责 grid 布局；列数 / 行高 / 间距全部由调用方覆写。
 */
export interface BentoGridProps {
  className?: string;
  children?: ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return <div className={cn("grid w-full grid-cols-3 gap-4", className)}>{children}</div>;
}

/**
 * Magic UI · BentoCard
 * ------------------------------------------------------------------
 * 实色陶瓷白 + 极细边框 + 双层软阴影 + 24px 圆角。
 * data-bento-card 供开场搭建层测量与逐卡绘制。
 */
export interface BentoCardProps {
  className?: string;
  children?: ReactNode;
  interactive?: boolean;
}

export function BentoCard({ className, children, interactive = true }: BentoCardProps) {
  return (
    <motion.div
      data-bento-card=""
      whileHover={interactive ? { y: -3 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={cn(
        "group relative col-span-1 flex min-h-0 flex-col justify-between overflow-hidden",
        "rounded-[24px] border border-[#ECECEE] bg-card",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_30px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
