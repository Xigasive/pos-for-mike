let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, vol = 0.1, slideFreq?: number) => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, ctx.currentTime + duration);
    }
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
};

export const sounds = {
  click: () => playTone(600, 'sine', 0.1, 0.05),
  tap: () => playTone(400, 'triangle', 0.05, 0.05),
  add: () => {
    playTone(800, 'sine', 0.1, 0.05);
    setTimeout(() => playTone(1200, 'sine', 0.15, 0.05), 80);
  },
  remove: () => {
    playTone(500, 'sine', 0.1, 0.05);
    setTimeout(() => playTone(300, 'sine', 0.15, 0.05), 80);
  },
  success: () => {
    playTone(523.25, 'sine', 0.1, 0.08); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.1, 0.08), 100); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.1, 0.08), 200); // G5
    setTimeout(() => playTone(1046.50, 'sine', 0.3, 0.08), 300); // C6
  },
  error: () => {
    playTone(300, 'square', 0.2, 0.02, 200);
    setTimeout(() => playTone(200, 'square', 0.3, 0.02, 150), 200);
  },
  cash: () => {
    playTone(1000, 'square', 0.1, 0.03);
    setTimeout(() => playTone(2000, 'sine', 0.2, 0.03), 50);
    setTimeout(() => playTone(3000, 'triangle', 0.3, 0.03), 100);
  }
};
