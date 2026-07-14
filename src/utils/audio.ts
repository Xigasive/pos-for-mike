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

// Modern, Glassy, Sci-Fi UI Sounds
const playGlassyTone = (
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

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
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
  // Soft, crisp bubble pop for clicks
  click: () => {
    playGlassyTone(900, 'sine', 0.08, 0.08, 600, 0.08);
  },
  tap: () => {
    playGlassyTone(700, 'triangle', 0.05, 0.05, 500, 0.05);
  },
  // Futuristic slide up
  add: () => {
    playGlassyTone(400, 'sine', 0.1, 0.1, 800, 0.1);
    setTimeout(() => playGlassyTone(800, 'sine', 0.1, 0.1, 1200, 0.1), 50);
  },
  // Futuristic slide down
  remove: () => {
    playGlassyTone(800, 'triangle', 0.1, 0.05, 400, 0.1);
  },
  // Success / Achievement chime
  success: () => {
    playGlassyTone(523.25, 'sine', 0.2, 0.1); // C5
    setTimeout(() => playGlassyTone(659.25, 'sine', 0.2, 0.1), 80); // E5
    setTimeout(() => playGlassyTone(783.99, 'sine', 0.2, 0.1), 160); // G5
    setTimeout(() => playGlassyTone(1046.50, 'sine', 0.5, 0.15), 240); // C6
  },
  // Soft error boop
  error: () => {
    playGlassyTone(200, 'sawtooth', 0.2, 0.05, 150, 0.2);
    setTimeout(() => playGlassyTone(150, 'sawtooth', 0.3, 0.05, 100, 0.3), 150);
  },
  // High-tech check-out / cash register replacement (modern scan/accept sound)
  cash: () => {
    playGlassyTone(1200, 'sine', 0.1, 0.08, 1400, 0.1);
    setTimeout(() => playGlassyTone(1800, 'sine', 0.3, 0.12), 100);
  }
};
