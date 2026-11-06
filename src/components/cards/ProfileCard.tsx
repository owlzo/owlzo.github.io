import { BorderBeam } from "@/components/magicui/border-beam";
import { BentoCard } from "@/components/magicui/bento-grid";
import { profile } from "@/content/profile";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
}

/** Card 1 · 个人介绍（左栏 42%） */
export function ProfileCard({ className }: CardProps) {
  const { name, role, avatar, headline, intro } = profile;

  return (
    <BentoCard className={cn("p-6", className)}>
      <BorderBeam duration="slower" />

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div data-reveal className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-ink text-[13px] font-medium tracking-wide text-white">
            {avatar.image ? (
              <img src={asset(avatar.image)} alt={name} className="h-full w-full object-cover" />
            ) : (
              avatar.initials
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[12.5px] font-medium text-ink">{name}</span>
            <span className="truncate text-[11.5px] text-muted">{role}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col pt-5">
          <h1
            data-reveal
            className="font-serif text-[clamp(26px,3.4vh,36px)] font-normal leading-[1.14] tracking-[-0.01em] text-ink"
          >
            {headline}
          </h1>
          <p data-reveal className="mt-3 text-[12px] leading-relaxed text-muted">
            {intro}
          </p>
        </div>
      </div>
    </BentoCard>
  );
}
