import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useContact } from "@/components/contact/ContactProvider";
import { Typewriter } from "@/components/ui/typewriter";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

const PANEL_W = 520;
const PANEL_H = 380;
const RADIUS_FROM = 12;
const RADIUS_TO = 28;

const ASK_NAME = "输入你的名称";
const ASK_TOPIC = "你想聊点什么?";

interface Msg {
  side: "left" | "right";
  text: string;
  /** true = 助手气泡，用打字机逐字写出 */
  typed?: boolean;
}

function Bubble({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "max-w-[35%] break-words rounded-2xl px-3.5 py-2 text-[12.5px] leading-relaxed",
        side === "right" ? "ml-auto bg-ink text-white" : "mr-auto bg-[#F0EDE7] text-ink",
      )}
    >
      {children}
    </div>
  );
}

/**
 * 留言弹窗 · iMessage 式对话
 * 用户的气泡本身就是输入区（contenteditable）：直接在里面打字，气泡随字增长、带原生光标，
 * Enter 发送后冻结成已发送气泡，进入下一轮。
 */
export function ContactDialog() {
  const { open, origin, closeContact } = useContact();
  const panelRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Msg[]>([{ side: "left", text: ASK_NAME, typed: true }]);
  const [stage, setStage] = useState<"name" | "topic" | "done">("name");
  const [draft, setDraft] = useState("");
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === "undefined" ? 1440 : window.innerWidth,
    h: typeof window === "undefined" ? 900 : window.innerHeight,
  }));

  const { contact } = profile;

  useEffect(() => {
    if (!open) {
      setMessages([{ side: "left", text: ASK_NAME, typed: true }]);
      setStage("name");
      setDraft("");
      if (editorRef.current) editorRef.current.textContent = "";
      return;
    }

    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeContact();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => {
      editorRef.current?.focus();
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

  const from = origin ? { ...origin, borderRadius: RADIUS_FROM } : { ...target, borderRadius: RADIUS_TO };

  const submit = () => {
    const value = draft.trim();
    if (!value || stage === "done") return;

    if (stage === "name") {
      setMessages((prev) => [
        ...prev,
        { side: "right", text: value },
        { side: "left", text: ASK_TOPIC, typed: true },
      ]);
      setStage("topic");
    } else {
      setMessages((prev) => [
        ...prev,
        { side: "right", text: value },
        { side: "left", text: contact.success, typed: true },
      ]);
      setStage("done");
    }

    setDraft("");
    if (editorRef.current) editorRef.current.textContent = "";
    window.setTimeout(() => editorRef.current?.focus(), 20);
  };

  const placeholder = stage === "name" ? ASK_NAME : ASK_TOPIC;

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
            className="fixed z-[56] overflow-hidden border border-[#ECECEE] bg-card shadow-[0_24px_70px_rgba(17,18,20,0.18)]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.14, duration: 0.2 }}
              className="flex h-full w-full flex-col"
            >
              <div className="flex items-start justify-between px-5 pt-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium tracking-[0.02em] text-muted">iMessage</span>
                  <span className="mt-0.5 text-[10px] text-faint">今天 11:29</span>
                </div>
                <button
                  type="button"
                  onClick={closeContact}
                  aria-label="关闭"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ECECEE] text-ink transition-colors duration-300 hover:bg-[#F0EDE7]"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-5 pb-4">
                {messages.map((message, index) =>
                  message.typed ? (
                    <Bubble key={index} side="left">
                      <Typewriter baseText={message.text} texts={[]} delay={index === 0 ? 0.25 : 0.2} />
                    </Bubble>
                  ) : (
                    <Bubble key={index} side="right">
                      {message.text}
                    </Bubble>
                  ),
                )}

                {stage !== "done" ? (
                  <div className="ml-auto min-w-[56px] max-w-[35%] rounded-2xl bg-ink px-3.5 py-2">
                    <div>
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-label={placeholder}
                        onInput={(event) => setDraft(event.currentTarget.textContent ?? "")}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            submit();
                          }
                        }}
                        className="min-h-[19px] whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-white caret-white outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="pt-1 text-center text-[10px] text-faint">{contact.hint}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}


