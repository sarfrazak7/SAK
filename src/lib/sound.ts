// Lightweight Web Audio sound effects — no external assets required.
// Sounds are synthesized at runtime via the Web Audio API.
//
// iOS Safari requires the AudioContext to be created and resumed within a
// user gesture, and a buffer must be played through to the destination before
// any programmatic sound can be heard. We register global touch/pointer/click
// listeners that unlock audio on the very first interaction.

let ctx: AudioContext | null = null;
let unlocked = false;

function getAC(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {});
  }
  return ctx;
}

/**
 * Unlock audio on iOS. Must be called from within a user gesture handler.
 */
export function unlockAudio(): void {
  const ac = getAC();
  if (!ac) return;
  if (ac.state === 'suspended') {
    void ac.resume().catch(() => {});
  }
  if (!unlocked) {
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.01), ac.sampleRate);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.connect(ac.destination);
    src.start(0);
    src.onended = () => {
      unlocked = true;
    };
    unlocked = true;
  }
}

if (typeof window !== 'undefined') {
  const unlock = () => unlockAudio();
  window.addEventListener('touchstart', unlock, { once: true });
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('click', unlock, { once: true });
}

/**
 * Play a short "clap" celebration when a word is found.
 */
export function playClap(): void {
  const ac = getAC();
  if (!ac) return;
  const now = ac.currentTime;

  const clapTimes = [now, now + 0.08, now + 0.17];
  clapTimes.forEach((t, i) => {
    const noiseDur = 0.14;
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * noiseDur), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let s = 0; s < data.length; s++) {
      const env = Math.pow(1 - s / data.length, 2.5);
      data[s] = (Math.random() * 2 - 1) * env;
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;

    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800 + i * 400;
    bp.Q.value = 1.2;

    const gain = ac.createGain();
    const peak = 0.7 - i * 0.1;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + noiseDur);

    src.connect(bp).connect(gain).connect(ac.destination);
    src.start(t);
    src.stop(t + noiseDur);
  });

  const osc = ac.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);

  const oscGain = ac.createGain();
  oscGain.gain.setValueAtTime(0.0001, now);
  oscGain.gain.linearRampToValueAtTime(0.32, now + 0.02);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(oscGain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.32);
}

/**
 * Play a harsh "buzzer" when the timer hits zero.
 */
export function playBuzzer(): void {
  const ac = getAC();
  if (!ac) return;
  const now = ac.currentTime;
  const dur = 0.7;

  const osc1 = ac.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(220, now);
  osc1.frequency.exponentialRampToValueAtTime(70, now + dur);

  const osc2 = ac.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(224, now);
  osc2.frequency.exponentialRampToValueAtTime(72, now + dur);

  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1200;
  lp.Q.value = 0.7;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.45, now + 0.03);
  gain.gain.setValueAtTime(0.45, now + dur - 0.12);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

  osc1.connect(lp);
  osc2.connect(lp);
  lp.connect(gain).connect(ac.destination);
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + dur);
  osc2.stop(now + dur);
}
