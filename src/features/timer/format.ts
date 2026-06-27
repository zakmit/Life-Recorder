/** Format an elapsed-seconds count as "1 hr 2 mins 3 secs" (legacy parity). */
export function timeToString(elapse: number): string {
  let secs = Math.max(0, Math.floor(elapse))
  let minutes = Math.floor(secs / 60)
  const hours = Math.floor(minutes / 60)
  secs = secs % 60
  minutes = minutes % 60

  if (hours === 0 && minutes === 0 && secs === 0) return 'Nothing'

  const parts: Array<string> = []
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`)
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`)
  if (secs > 0) parts.push(`${secs} ${secs === 1 ? 'sec' : 'secs'}`)
  return parts.join(' ')
}

/** Format seconds as a clock face "HH:MM:SS" or "MM:SS". */
export function clockString(totalSeconds: number, showHours = true): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (showHours || hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}
