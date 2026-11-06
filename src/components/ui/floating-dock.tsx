import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/**
 * Aceternity FloatingDock（shadcn add @aceternity/floating-dock 拉取）
 * 已按本项目设计标记改写：实色陶瓷白托盘、无毛玻璃、无 dark 变体、尺寸收紧。
 * 注：宽度/高度由 motion value 驱动，必须通过 style 绑定，这是放大动效的管线本身。
 */

export interface FloatingDockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, transition: { delay: idx * 0.05 } }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  aria-label={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F1EFEA] bg-card-soft text-ink"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="social links"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F1EFEA] bg-card-soft text-ink"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-11 items-end gap-2.5 rounded-[14px] border border-[#F3F0EA] bg-card-soft px-2.5 pb-2 md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-140, 0, 140], [32, 52, 32]);
  const heightTransform = useTransform(distance, [-140, 0, 140], [32, 52, 32]);
  const widthTransformIcon = useTransform(distance, [-140, 0, 140], [16, 26, 16]);
  const heightTransformIcon = useTransform(distance, [-140, 0, 140], [16, 26, 16]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 160, damping: 14 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 160, damping: 14 });
  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 160, damping: 14 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 160, damping: 14 });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href} aria-label={title} target="_blank" rel="noreferrer">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-mist text-ink transition-colors duration-300 hover:bg-[#E9E4DA]"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit whitespace-pre rounded-[7px] border border-[#ECECEE] bg-card px-2 py-0.5 text-[10.5px] text-ink shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
