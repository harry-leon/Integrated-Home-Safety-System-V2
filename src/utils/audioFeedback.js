const playTone = ({ frequency = 440, duration = 160, type = 'sine', endFrequency }) => {
  if (typeof window === 'undefined') return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration / 1000);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
    window.setTimeout(() => audioContext.close().catch(() => {}), duration + 80);
  } catch {
    // Browser audio can be blocked until a user gesture; voice still works without tones.
  }
};

export const playStartTone = () => playTone({ frequency: 420, duration: 120, type: 'triangle' });

export const playSuccessTone = () => playTone({ frequency: 620, endFrequency: 880, duration: 180, type: 'sine' });

export const playErrorTone = () => playTone({ frequency: 220, duration: 260, type: 'sawtooth' });

export const speakText = (text, lang = 'en-US') => {
  if (typeof window === 'undefined' || !text || !window.speechSynthesis) return;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.volume = 0.7;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis is optional feedback.
  }
};
