import type { MotionOptions, MotionController } from "./motion-runtime";
export type MultiCursorBuilderOptions = MotionOptions & { playing?: boolean; speed?: number; skipIntro?: boolean; showToolbar?: boolean; onPhaseChange?: (phase: "intro" | "burst" | "board" | "build") => void; onReplay?: () => void };
export function mountMultiCursorBuilder(target: HTMLElement, options?: MultiCursorBuilderOptions): Omit<MotionController, "update"> & { update(options: MultiCursorBuilderOptions): void };
