import {
  IconBrandGithub,
  IconBrandTiktok,
  IconBrandX,
  IconNotebook,
} from "@tabler/icons-react";
import { useContact } from "@/components/contact/ContactProvider";
import { BentoCard } from "@/components/magicui/bento-grid";
import { FloatingDock } from "@/components/ui/floating-dock";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { profile, type SocialIconKey } from "@/content/profile";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
}

const ICONS: Record<SocialIconKey, typeof IconBrandGithub> = {
  github: IconBrandGithub,
  x: IconBrandX,
  xiaohongshu: IconNotebook,
  douyin: IconBrandTiktok,
};

/** Card 3 · 社交矩阵 + 留言入口（左栏 15%） */
export function StatusDockCard({ className }: CardProps) {
  const { socials, labels, contact } = profile;
  const { openContact } = useContact();

  const dock = socials.map((social) => {
    const Icon = ICONS[social.icon];
    return {
      title: social.label,
      href: social.href,
      icon: <Icon className="h-full w-full" />,
    };
  });

  return (
    <BentoCard className={cn("px-4 py-3", className)}>
      <div className="relative z-10 flex h-full min-h-0 flex-col justify-between">
        <div data-reveal className="flex shrink-0 items-center justify-between gap-3">
          <span className="truncate text-[11px] tracking-[0.02em] text-muted">
            {labels.social}
          </span>
        </div>

        <div data-reveal className="mt-1 flex items-end justify-between gap-3">
          <FloatingDock
            items={dock}
            desktopClassName="mx-0 h-10 gap-2 rounded-[12px] border-0 bg-transparent px-0 pb-1.5"
          />

          <InteractiveHoverButton
            onClick={(event) => openContact(event.currentTarget.getBoundingClientRect())}
            className="shrink-0"
          >
            {contact.button}
          </InteractiveHoverButton>
        </div>
      </div>
    </BentoCard>
  );
}
