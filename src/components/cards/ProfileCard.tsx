import { useMemo } from "react";
import QRCode from "qrcode";
import { BorderBeam } from "@/components/magicui/border-beam";
import { BentoCard } from "@/components/magicui/bento-grid";
import { ComicText } from "@/components/ui/comic-text";
import { Tooltip } from "@/components/ui/tooltip-card";
import { profile } from "@/content/profile";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
}

const QR_PAPER = "#FFFFFF";

/** 设计感圆点二维码：数据点位为圆点，三个定位角为圆角方块，中心留品牌标记 */
function useStyledQr(text: string) {
  return useMemo(() => {
    try {
      const code = QRCode.create(text || "wechat", { errorCorrectionLevel: "H" });
      const size = code.modules.size;
      const data = code.modules.data;
      const dark = (row: number, col: number) =>
        row >= 0 && col >= 0 && row < size && col < size && data[row * size + col] === 1;

      const finders: Array<[number, number]> = [
        [0, 0],
        [0, size - 7],
        [size - 7, 0],
      ];

      const inFinder = (row: number, col: number) =>
        finders.some(([fr, fc]) => row >= fr - 1 && row <= fr + 7 && col >= fc - 1 && col <= fc + 7);

      const dots: string[] = [];
      const logoHalf = 2.6;
      const center = size / 2;
      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          if (!dark(row, col) || inFinder(row, col)) continue;
          if (Math.abs(col + 0.5 - center) < logoHalf && Math.abs(row + 0.5 - center) < logoHalf) continue;
          dots.push(`M${col + 0.5} ${row + 0.5}h0.01`);
        }
      }

      return {
        size,
        finders,
        dots,
        logoBox: { x: center - logoHalf, y: center - logoHalf, w: logoHalf * 2, h: logoHalf * 2 },
      };
    } catch {
      return null;
    }
  }, [text]);
}

/** 悬停微信时浮出的二维码卡片：窄白边 + 中间整块二维码 */
function WechatQrCard({ text, image }: { text: string; image?: string }) {
  const qr = useStyledQr(text);

  return (
    <div className="h-[202px] w-[202px] bg-white p-[3px]">
      {image ? (
        <img src={asset(image)} alt="微信二维码" className="h-full w-full object-contain" />
      ) : qr ? (
        <svg
          viewBox={`-2 -2 ${qr.size + 4} ${qr.size + 4}`}
          className="h-full w-full"
          shapeRendering="geometricPrecision"
          role="img"
          aria-label="微信二维码"
        >
          <defs>
            <linearGradient id="wechatQrInk" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2C2A29" />
              <stop offset="55%" stopColor="#3F362B" />
              <stop offset="100%" stopColor="#6B5A42" />
            </linearGradient>
          </defs>

          <rect x={-2} y={-2} width={qr.size + 4} height={qr.size + 4} fill={QR_PAPER} />

          {/* 圆点数据位：单条 path 承载，stroke-linecap=round 变成圆点 */}
          <path
            d={qr.dots.join("")}
            stroke="url(#wechatQrInk)"
            strokeWidth={0.92}
            strokeLinecap="round"
            fill="none"
          />

          {/* 三个定位角：圆角外框 + 留白 + 焦糖内芯 */}
          {qr.finders.map(([fr, fc]) => (
            <g key={`${fr}-${fc}`}>
              <rect x={fc} y={fr} width={7} height={7} rx={2.1} fill="url(#wechatQrInk)" />
              <rect x={fc + 1} y={fr + 1} width={5} height={5} rx={1.5} fill={QR_PAPER} />
              <rect x={fc + 2} y={fr + 2} width={3} height={3} rx={1} fill="#B45309" />
            </g>
          ))}

          {/* 中心品牌标记 */}
          <rect
            x={qr.logoBox.x}
            y={qr.logoBox.y}
            width={qr.logoBox.w}
            height={qr.logoBox.h}
            rx={1.1}
            fill={QR_PAPER}
          />
          <text
            x={qr.size / 2}
            y={qr.size / 2 + 0.1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Instrument Serif', Georgia, serif"
            fontSize={2.9}
            fill="#B45309"
          >
            微
          </text>
        </svg>
      ) : null}
    </div>
  );
}

/** Card 1 · 个人介绍（左栏 42%） */
export function ProfileCard({ className }: CardProps) {
  const { name, role, avatar, headline, intro, contact } = profile;

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
          <p data-reveal className="mt-2 text-[12px] leading-relaxed text-muted">
            如果你信任我，可以通过{" "}
            <Tooltip content={<WechatQrCard text={contact.wechat} image={contact.wechatQr} />}>
              <ComicText fontSize={1.1} className="cursor-pointer">
                微信
              </ComicText>
            </Tooltip>{" "}
            找到我。
          </p>
        </div>
      </div>
    </BentoCard>
  );
}
