/**
 * Microphone capability and permission checks. Browser-only: every function
 * guards against a missing API so calling them during SSR (or in an
 * unsupported browser) returns a normal state rather than throwing.
 */

export type MicState = 'unsupported' | 'prompt' | 'granted' | 'denied'

/** True only in a browser with the getUserMedia API available. */
export function isMicSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  )
}

/** Best-effort current permission state without prompting. */
export async function queryMicPermission(): Promise<MicState> {
  if (!isMicSupported()) return 'unsupported'
  try {
    if (navigator.permissions?.query) {
      const result = await navigator.permissions.query({
        name: 'microphone',
      })
      return result.state
    }
  } catch {
    // Permissions API not available for "microphone"; fall through to prompt.
  }
  return 'prompt'
}

/**
 * Request a microphone stream. Returns the stream on success, or null if the
 * user denies access or the API is unavailable. Never throws.
 */
export async function requestMicStream(): Promise<MediaStream | null> {
  if (!isMicSupported()) return null
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    })
  } catch {
    return null
  }
}
