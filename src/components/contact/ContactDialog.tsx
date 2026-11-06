import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useContact } from "@/components/contact/ContactProvider";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { profile } from "@/content/profile";

const PANEL_W = 520;
const PANEL_H = 300;
const RADIUS_FROM = 12;
const RADIUS_TO = 28;

/** 留言弹窗：从「说些什么」按钮原位弹射展开到视口正中，弹簧 350/30 */
export function ContactDialog() {
  const { open, origin, closeContact } = useContact();
  const panelRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === "undefined" ? 1440 : window.innerWidth,
    h: typeof window === "undefined" ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    if (!open) {
      setSent(false);
      return;
    }

    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeContact();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector("input")?.focus();
    }, 430);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, closeContact]);

  const width = Math.min(PANEL_W, viewport.w - 64);
  const height = Math.min(PANEL_H, viewport.h - 120);
  const target = {
    top: (viewport.h - height) / 2,
    left: (viewport.w - width) / 2,
    width,
    height,
    borderRadius: RADIUS_TO,
  };

  const from = origin
    ? { ...origin, borderRadius: RADIUS_FROM }
    : { ...target, borderRadius: RADIUS_TO };

  const { contact } = profile;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="contact-backdrop"
            data-contact-backdrop=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            onClick={closeContact}
            className="fixed inset-0 z-[55] bg-[#111214]/15 backdrop-blur-[2px]"
          />

          <motion.div
            key="contact-panel"
            data-contact-panel=""
            ref={panelRef}
            initial={from}
            animate={target}
            exit={{ ...from, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed z-[56] overflow-hidden border border-[#ECECEE] bg-canvas shadow-[0_24px_70px_rgba(17,18,20,0.18)]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.14, duration: 0.2 }}
              className="flex h-full w-full flex-col p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[15px] font-medium tracking-[-0.01em] text-ink">
                    {contact.title}
                  </h2>
                  <p className="text-[11.5px] leading-relaxed text-muted">{contact.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={closeContact}
                  aria-label="关闭"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ECECEE] text-ink transition-colors duration-300 hover:bg-card-soft"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                {sent ? (
                  <p className="text-[12.5px] text-ink">{contact.success}</p>
                ) : (
                  <PlaceholdersAndVanishInput
                    placeholders={contact.placeholders}
                    onChange={() => {}}
                    onSubmit={() => {
                      setSent(true);
                      window.setTimeout(closeContact, 1500);
                    }}
                  />
                )}
                <p className="text-center text-[10px] text-faint">{contact.hint}</p>
              </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
