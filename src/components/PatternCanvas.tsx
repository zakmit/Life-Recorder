import { useEffect, useRef } from 'react'
import type { PatternPoint } from '#/features/audio/pattern'

export type PatternCanvasProps = {
  pattern: ReadonlyArray<PatternPoint>
  width?: number
  height?: number
  className?: string
}

/**
 * Native-canvas pattern renderer (replaces the legacy p5 sketch). Each pattern
 * point is drawn as a dot placed on a spiral; its position index and the
 * derived [max, min] pair drive the angle and hue. All drawing happens inside
 * useEffect so the component is SSR-safe — the server renders only the element.
 */
export function PatternCanvas({
  pattern,
  width = 300,
  height = 200,
  className,
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.clearRect(0, 0, width, height)
    const cx = width / 2
    const cy = height / 2
    const radiusStep = Math.min(width, height) / 24

    pattern.forEach(([max, min], i) => {
      const ring = Math.floor(Math.sqrt(i + 1))
      const angle = (i * (max + 1)) * 0.18 + min * 0.05
      const r = ring * radiusStep
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      const hue = (max / 255) * 360
      const size = 3 + (min / 255) * 6

      ctx.beginPath()
      ctx.fillStyle = `hsl(${hue}, 70%, 55%)`
      ctx.globalAlpha = 0.85
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }, [pattern, width, height])

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
