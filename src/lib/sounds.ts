/**
 * Procedural booth sounds via Web Audio API.
 * Avoids shipping binary assets while keeping shutter / beep / complete feedback.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

async function ensureRunning(ctx: AudioContext) {
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

/** Short high beep for each countdown tick. */
export async function playCountdownBeep(muted: boolean) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  await ensureRunning(ctx);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

/** Camera shutter click with noise burst. */
export async function playShutter(muted: boolean) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  await ensureRunning(ctx);

  const duration = 0.12;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.value = 0.45;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();

  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  click.type = "triangle";
  click.frequency.setValueAtTime(220, ctx.currentTime);
  click.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
  clickGain.gain.setValueAtTime(0.2, ctx.currentTime);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
  click.connect(clickGain);
  clickGain.connect(ctx.destination);
  click.start();
  click.stop(ctx.currentTime + 0.12);
}

/** Soft chime when the 4-cut session completes. */
export async function playComplete(muted: boolean) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  await ensureRunning(ctx);

  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  });
}
