import type React from "react"

import { asset } from "@/lib/asset"
import { cn } from "@/lib/utils"

export type TextureVariant =
  | "fabric-of-squares"
  | "grid-noise"
  | "inflicted"
  | "debut-light"
  | "groovepaper"
  | "none"

interface BackgroundImageTextureProps {
  variant?: TextureVariant
  opacity?: number
  className?: string
  children?: React.ReactNode
}

const textureMap: Record<Exclude<TextureVariant, "none">, string> = {
  "fabric-of-squares": asset("/textures/fabric-of-squares.png"),
  "grid-noise": asset("/textures/grid-noise.png"),
  inflicted: asset("/textures/inflicted.png"),
  "debut-light": asset("/textures/debut-light.png"),
  groovepaper: asset("/textures/groovepaper.png"),
}

export function BackgroundImageTexture({
  variant = "fabric-of-squares",
  opacity = 0.5,
  className,
  children,
}: BackgroundImageTextureProps) {
  const textureUrl = variant !== "none" ? textureMap[variant] : null

  return (
    <div className={cn("relative", className)}>
      {textureUrl && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${textureUrl})`,
            backgroundRepeat: "repeat",
            opacity,
          }}
        />
      )}
      {children && <div className="relative">{children}</div>}
    </div>
  )
}
