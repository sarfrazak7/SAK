// Sound effects using Web Audio API — no external files needed.

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Roulette spinning sound: rapid clicking that slows down
export function playSpinSound(durationMs: number) {
  const ctx = getCtx();
  if (!ctx) return;

  const startTime = ctx.currentTime;
  const totalSec = durationMs / 1000;
  let nextClick = 0;

  const scheduleClicks = () => {
    const elapsed = ctx.currentTime - startTime;
    if (elapsed >= totalSec) return;

    const progress = elapsed / totalSec;
    const clicksPerSec = 30 * Math.pow(0.02, progress);
    const interval = 1 / clicksPerSec;

    while (nextClick < elapsed + 0.3 && nextClick < totalSec) {
      if (nextClick > elapsed) {
        playClick(ctx, startTime + nextClick);
      }
      const p = nextClick / totalSec;
      const cps = 30 * Math.pow(0.02, p);
      nextClick += 1 / cps;
    }

    setTimeout(scheduleClicks, 200);
  };
  scheduleClicks();
}

function playClick(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 800 + Math.random() * 400;
  gain.gain.setValueAtTime(0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.02);
}

export function playBallLandSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const time = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, time);
  osc.frequency.exponentialRampToValueAtTime(400, time + 0.15);
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.2);
}

export function playPassBell() {
  const ctx = getCtx();
  if (!ctx) return;
  const time = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = time + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.5);
  });
}

export function playFailSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const time = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.5);
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.6);
}

export function playTickSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const time = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 600;
  gain.gain.setValueAtTime(0.1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.05);
}
