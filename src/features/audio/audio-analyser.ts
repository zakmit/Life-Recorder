import { extractPatternPoint, randomPatternPoint } from './pattern'
import { requestMicStream } from './audio-permission'
import type { PatternPoint } from './pattern'

/**
 * Browser-only Web Audio analyser wrapper. Owns the AudioContext, analyser
 * node, and the stream so the timer feature can sample processed pattern
 * points without touching raw audio buffers outside this module.
 */
export type AudioAnalyser = {
  /** Capture one processed pattern point by averaging `frames` samples. */
  sample(frames?: number, intervalMs?: number): Promise<PatternPoint>
  /** Tear down the audio graph and release the microphone. */
  close(): void
}

type AudioContextCtor = new () => AudioContext

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext ??
    null
  )
}

const FFT_SIZE = 256
const DEFAULT_FRAMES = 4
const DEFAULT_INTERVAL_MS = 500

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create an analyser bound to the microphone. Returns null when the mic is
 * unavailable or denied — callers should fall back to `randomPatternPoint`.
 */
export async function createAudioAnalyser(): Promise<AudioAnalyser | null> {
  const Ctor = getAudioContextCtor()
  if (!Ctor) return null

  const stream = await requestMicStream()
  if (!stream) return null

  const context = new Ctor()
  const source = context.createMediaStreamSource(stream)
  const analyser = context.createAnalyser()
  analyser.fftSize = FFT_SIZE
  source.connect(analyser)

  let closed = false

  return {
    async sample(
      frames = DEFAULT_FRAMES,
      intervalMs = DEFAULT_INTERVAL_MS,
    ): Promise<PatternPoint> {
      if (closed) return randomPatternPoint()
      const collected: Array<Uint8Array> = []
      for (let i = 0; i < frames; i++) {
        const buffer = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteTimeDomainData(buffer)
        collected.push(buffer)
        if (i < frames - 1) await delay(intervalMs)
      }
      return extractPatternPoint(collected)
    },
    close() {
      if (closed) return
      closed = true
      stream.getTracks().forEach((track) => track.stop())
      void context.close()
    },
  }
}
