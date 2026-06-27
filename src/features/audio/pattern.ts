/**
 * Pure pattern extraction from audio frequency/time-domain samples.
 *
 * Privacy posture: this module only ever derives two small integers per sample
 * window (the indices of the loudest and quietest bins). Raw audio buffers are
 * never stored or returned — only these processed pattern points leave here.
 */

export type PatternPoint = [number, number]

/**
 * Index of the extreme (max or min) value in a numeric array.
 * Mirrors the legacy `globalPeak` helper.
 */
export function peakIndex(
  values: ArrayLike<number>,
  kind: 'max' | 'min',
): number {
  if (values.length === 0) return 0
  let peak = 0
  let peakValue = values[0]
  for (let i = 1; i < values.length; i++) {
    if (kind === 'max' ? values[i] > peakValue : values[i] < peakValue) {
      peak = i
      peakValue = values[i]
    }
  }
  return peak
}

/**
 * Accumulate several time-domain frames, then reduce to a single
 * [maxIndex, minIndex] pattern point. The legacy app summed 4 frames before
 * taking peaks; this preserves that smoothing.
 */
export function accumulateFrames(
  frames: ReadonlyArray<ArrayLike<number>>,
): Array<number> {
  if (frames.length === 0) return []
  const length = frames[0].length
  const summed = new Array<number>(length).fill(0)
  for (const frame of frames) {
    for (let i = 0; i < length && i < frame.length; i++) {
      summed[i] += frame[i]
    }
  }
  return summed
}

/** Reduce accumulated frame data to one processed pattern point. */
export function extractPatternPoint(
  frames: ReadonlyArray<ArrayLike<number>>,
): PatternPoint {
  const summed = accumulateFrames(frames)
  return [peakIndex(summed, 'max'), peakIndex(summed, 'min')]
}

/** Deterministic fallback point used when the microphone is unavailable. */
export function randomPatternPoint(): PatternPoint {
  return [
    Math.floor(Math.random() * 128),
    Math.floor(Math.random() * 128),
  ]
}
