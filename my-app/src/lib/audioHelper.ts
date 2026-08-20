// RESPONSIBILITY: Single source of truth for all Web Audio API sound synthesis
// in the app. No component may instantiate AudioContext or play sounds directly.
// All kitchen alert sounds are synthesized here — zero external audio files.
// DATA FLOW: KDS component event → audioHelper function → Web Audio API → speaker output
// Mainprompt Deliverable 4: Web Audio API helper for Kitchen Display System alerts.

// ─── Audio Constants (Rule 35: No magic strings or magic numbers) ─────────────

const SINE_WAVE = "sine" as const;
const SAWTOOTH_WAVE = "sawtooth" as const;

// playKitchenBell — ding-dong frequencies
const BELL_FREQ_HIGH = 880 as const; // Hz — first ding
const BELL_FREQ_LOW = 660 as const;  // Hz — second dong
const BELL_GAIN_PEAK = 0.6 as const;
const BELL_GAIN_ZERO = 0.0001 as const;
const BELL_DURATION_FIRST = 0.6 as const;  // seconds
const BELL_DURATION_SECOND = 0.6 as const; // seconds
const BELL_OFFSET_SECOND = 0.5 as const;   // seconds — when second tone starts

// playVoidAlert — warning buzz frequencies
const VOID_FREQ = 220 as const;       // Hz — low urgent buzz
const VOID_GAIN_PEAK = 0.7 as const;
const VOID_GAIN_ZERO = 0.0001 as const;
const VOID_PULSE_DURATION = 0.12 as const; // seconds per pulse
const VOID_PULSE_GAP = 0.08 as const;      // seconds gap between pulses
const VOID_PULSE_COUNT = 3 as const;

// playReadyChime — ascending chime frequencies (C5 → E5 → G5)
const CHIME_FREQ_1 = 523 as const; // Hz — C5
const CHIME_FREQ_2 = 659 as const; // Hz — E5
const CHIME_FREQ_3 = 784 as const; // Hz — G5
const CHIME_GAIN_PEAK = 0.5 as const;
const CHIME_GAIN_ZERO = 0.0001 as const;
const CHIME_NOTE_DURATION = 0.25 as const;  // seconds per note
const CHIME_NOTE_SPACING = 0.22 as const;   // seconds between note starts

// ─── Singleton AudioContext (Rule 6: logic in utility, not component) ─────────

let audioCtx: AudioContext | null = null;

/**
 * Returns the singleton AudioContext instance.
 * Lazy-initialized on first call — safe for SSR (window check included).
 * Resumes context if browser suspended it (autoplay policy).
 *
 * @returns AudioContext instance or null if SSR / Web Audio not supported
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (typeof window.AudioContext === "undefined") return null;

  if (audioCtx === null) {
    audioCtx = new window.AudioContext();
  }

  // Resume if browser suspended due to autoplay policy
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

// ─── Internal Tone Builder (Rule 6: extracted logic, not duplicated) ──────────

/**
 * Creates and plays a single synthesized tone with a smooth gain envelope.
 * Automatically connects oscillator → gainNode → destination and cleans up.
 *
 * @param frequency - Oscillator frequency in Hz
 * @param type - OscillatorType (sine, sawtooth, square, triangle)
 * @param startTime - AudioContext time when tone should start (seconds)
 * @param duration - How long the tone plays before fade-out completes (seconds)
 * @param peakGain - Peak volume level (0.0 to 1.0)
 * @param zeroGain - Near-zero gain value for smooth ramp-to-zero (avoid click)
 */
function playTone(
  frequency: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  peakGain: number,
  zeroGain: number
): void {
  const ctx = getAudioContext();
  if (ctx === null) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // Smooth gain envelope: instant attack, exponential decay
  gainNode.gain.setValueAtTime(peakGain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(zeroGain, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Plays a pleasant two-tone "ding-dong" bell sound when a new KOT arrives
 * on the Kitchen Display System.
 * Synthesis: 2 sine oscillators (880Hz then 660Hz), ~1.2s total duration.
 * SSR safe — silently returns if window or AudioContext is unavailable.
 *
 * @returns void
 *
 * @example
 * // Call when new KOT is received in KDS
 * playKitchenBell();
 */
export function playKitchenBell(): void {
  const ctx = getAudioContext();
  if (ctx === null) return;

  const now = ctx.currentTime;

  // First tone — high "ding"
  playTone(
    BELL_FREQ_HIGH,
    SINE_WAVE,
    now,
    BELL_DURATION_FIRST,
    BELL_GAIN_PEAK,
    BELL_GAIN_ZERO
  );

  // Second tone — low "dong" (starts slightly before first ends for overlap)
  playTone(
    BELL_FREQ_LOW,
    SINE_WAVE,
    now + BELL_OFFSET_SECOND,
    BELL_DURATION_SECOND,
    BELL_GAIN_PEAK,
    BELL_GAIN_ZERO
  );
}

/**
 * Plays 3 short urgent buzz pulses when a KOT item is voided or cancelled.
 * Synthesis: sawtooth oscillator at 220Hz, 3 pulses with gaps, ~0.6s total.
 * SSR safe — silently returns if window or AudioContext is unavailable.
 *
 * @returns void
 *
 * @example
 * // Call when waiter marks item as void
 * playVoidAlert();
 */
export function playVoidAlert(): void {
  const ctx = getAudioContext();
  if (ctx === null) return;

  const now = ctx.currentTime;
  const pulseStep = VOID_PULSE_DURATION + VOID_PULSE_GAP;

  // Play VOID_PULSE_COUNT pulses sequentially
  for (let i = 0; i < VOID_PULSE_COUNT; i++) {
    playTone(
      VOID_FREQ,
      SAWTOOTH_WAVE,
      now + i * pulseStep,
      VOID_PULSE_DURATION,
      VOID_GAIN_PEAK,
      VOID_GAIN_ZERO
    );
  }
}

/**
 * Plays a soft ascending three-note chime when an order status changes to
 * "Ready to Serve" on the Kitchen Display System.
 * Synthesis: 3 sine oscillators (C5 → E5 → G5), ~0.8s total duration.
 * SSR safe — silently returns if window or AudioContext is unavailable.
 *
 * @returns void
 *
 * @example
 * // Call when kitchen marks order as Ready to Serve
 * playReadyChime();
 */
export function playReadyChime(): void {
  const ctx = getAudioContext();
  if (ctx === null) return;

  const now = ctx.currentTime;
  const frequencies = [CHIME_FREQ_1, CHIME_FREQ_2, CHIME_FREQ_3] as const;

  // Play each note sequentially with slight overlap for smooth chime feel
  frequencies.forEach((freq, index) => {
    playTone(
      freq,
      SINE_WAVE,
      now + index * CHIME_NOTE_SPACING,
      CHIME_NOTE_DURATION,
      CHIME_GAIN_PEAK,
      CHIME_GAIN_ZERO
    );
  });
}
