let audioCtx: AudioContext | null = null;
let isMuted = false;

export const setMuted = (muted: boolean) => {
  isMuted = muted;
};

export const getMuted = () => isMuted;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playModernTone = (
  freq: number,
  type: OscillatorType,
  duration: number,
  vol = 0.1,
  slideFreq?: number,
  slideDuration?: number
) => {
  if (isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, ctx.currentTime + (slideDuration || duration));
    }

    // Quick attack, exponential decay for a snappy modern UI sound
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
};

export const sounds = {
  click: () => playModernTone(1400, 'sine', 0.05, 0.05, 1000, 0.05),
  tap: () => playModernTone(800, 'triangle', 0.05, 0.05, 600, 0.05),
  add: () => {
    playModernTone(880, 'sine', 0.1, 0.05, 1200, 0.1);
    setTimeout(() => playModernTone(1760, 'sine', 0.15, 0.05), 80);
  },
  remove: () => {
    playModernTone(600, 'triangle', 0.1, 0.05, 300, 0.1);
  },
  success: () => {
    playModernTone(523.25, 'sine', 0.15, 0.05);
    setTimeout(() => playModernTone(659.25, 'sine', 0.15, 0.05), 80);
    setTimeout(() => playModernTone(1046.50, 'sine', 0.3, 0.05), 160);
  },
  error: () => {
    playModernTone(300, 'sawtooth', 0.15, 0.05, 250, 0.15);
    setTimeout(() => playModernTone(250, 'sawtooth', 0.2, 0.05, 200, 0.2), 120);
  },
  cash: () => {
    // High-tech success beep like contactless payment
    playModernTone(1500, 'sine', 0.1, 0.08);
    setTimeout(() => playModernTone(2000, 'sine', 0.3, 0.1), 100);
  }
};
