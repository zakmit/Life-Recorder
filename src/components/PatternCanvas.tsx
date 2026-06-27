import { useEffect, useRef } from 'react'
import { DEFAULT_THEME } from '#/features/audio/themes'
import type { Theme } from '#/features/audio/themes'
import type { PatternPoint } from '#/features/audio/pattern'

export type PatternCanvasProps = {
  pattern: ReadonlyArray<PatternPoint>
  /** Theme supplying the watercolor images and layout params. */
  theme?: Theme
  width?: number
  height?: number
  /** Override the per-image draw size (defaults to the theme's imgSize). */
  imgSize?: number
  /** Override the ring spacing (defaults to the theme's radius). */
  radius?: number
  className?: string
}

/**
 * Watercolor-spiral renderer (replaces the legacy p5 `Sketch.js`). Each pattern
 * point `[max, min]` places one theme image on a spiral: `max` selects the image
 * (`images[max % images.length]`), the point's index selects its ring/angle slot
 * (legacy ring math: ring i holds 8*i slots), and `min` rotates the image. All
 * drawing happens in an effect with client-only image loading, so the component
 * is SSR-safe — the server renders only the bare <canvas>.
 */
export function PatternCanvas({
  pattern,
  theme = DEFAULT_THEME,
  width = 300,
  height = 200,
  imgSize,
  radius,
  className,
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawSize = imgSize ?? theme.imgSize
    const ringStep = radius ?? theme.radius

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    if (pattern.length === 0) return

    const cx = width / 2
    const cy = height / 2

    // Load each point's image once, then render the full spiral. Drawing waits
    // for loads so images that decode late still appear.
    const images = theme.images
    const loaded = new Map<string, HTMLImageElement>()

    // Legacy ring math: id 0 -> center; ring i (i>=1) holds 8*i slots.
    function placePoint(id: number): { x: number; y: number } {
      let i = 0
      let num = id
      while (num > i * 8) {
        num -= i * 8
        i++
      }
      if (i === 0) return { x: 0, y: 0 }
      const angle = ((num - 1) * Math.PI) / (4 * i)
      return {
        x: i * ringStep * Math.cos(angle),
        y: i * ringStep * Math.sin(angle),
      }
    }

    function render() {
      ctx!.clearRect(0, 0, width, height)
      pattern.forEach(([max, min], id) => {
        const src = images[max % images.length]
        const img = loaded.get(src)
        if (!img || !img.complete || img.naturalWidth === 0) return
        const { x, y } = placePoint(id)
        ctx!.save()
        ctx!.translate(cx + x, cy + y)
        ctx!.rotate(min) // legacy: rotate by the "min" value (radians)
        ctx!.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize)
        ctx!.restore()
      })
    }

    let cancelled = false
    const srcs = new Set(
      pattern.map(([max]) => images[max % images.length]),
    )
    let pending = srcs.size
    if (pending === 0) {
      render()
      return
    }
    srcs.forEach((src) => {
      const img = new Image()
      img.onload = img.onerror = () => {
        if (cancelled) return
        loaded.set(src, img)
        pending -= 1
        // Render progressively so the spiral fills in as images arrive.
        render()
      }
      img.src = src
    })

    return () => {
      cancelled = true
    }
  }, [pattern, theme, width, height, imgSize, radius])

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className={className}
      role="img"
      aria-label="Recorded sound pattern"
    />
  )
}
