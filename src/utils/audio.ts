let isMuted = false;

export const setMuted = (muted: boolean) => {
  isMuted = muted;
};

export const getMuted = () => isMuted;

// ดึงเสียงจากแหล่งภายนอก (Google Actions Sound Library)
const playExternalSound = (url: string, volume = 0.5) => {
  if (isMuted) return;
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(e => console.log('Audio play error:', e));
  } catch (e) {
    console.error(e);
  }
};

// เสียงพูดให้กำลังใจ (Speech Synthesis API)
const speak = (text: string) => {
  if (isMuted) return;
  if ('speechSynthesis' in window) {
    // ยกเลิกเสียงที่กำลังพูดอยู่ก่อนหน้าเพื่อไม่ให้เสียงซ้อนกัน
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 1.1;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  }
};

export const sounds = {
  click: () => playExternalSound('https://actions.google.com/sounds/v1/water/water_drop.ogg', 0.3),
  tap: () => playExternalSound('https://actions.google.com/sounds/v1/ui/button_click.ogg', 0.3),
  add: () => {
    playExternalSound('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg', 0.4);
  },
  remove: () => {
    playExternalSound('https://actions.google.com/sounds/v1/cartoon/slip_slop.ogg', 0.3);
  },
  success: () => {
    playExternalSound('https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg', 0.5);
    setTimeout(() => speak('เยี่ยมมากค่ะ ทำรายการสำเร็จ'), 500);
  },
  error: () => {
    playExternalSound('https://actions.google.com/sounds/v1/alarms/beep_short.ogg', 0.3);
  },
  cash: () => {
    playExternalSound('https://actions.google.com/sounds/v1/cartoon/clown_horn.ogg', 0.3);
    setTimeout(() => speak('รับยอดเรียบร้อย รวยๆ เฮงๆ นะคะ'), 300);
  }
};
