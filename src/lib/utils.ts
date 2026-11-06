import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 唯一的 className 合并入口。
 * 所有组件的样式都必须经过这里，保证 Tailwind 类名可被安全覆写。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
