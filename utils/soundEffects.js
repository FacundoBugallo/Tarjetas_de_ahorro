import { Platform, Vibration } from "react-native";

let audioContext = null;

const NOTE_FREQUENCIES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392,
  A4: 440,
  C5: 523.25,
};

const SOUND_PATTERNS = {
  appEnter: [
    { note: "C4", duration: 0.08, delay: 0 },
    { note: "E4", duration: 0.1, delay: 0.1 },
    { note: "G4", duration: 0.12, delay: 0.22 },
  ],
  createCard: [
    { note: "E4", duration: 0.08, delay: 0 },
    { note: "A4", duration: 0.1, delay: 0.1 },
  ],
  deleteCard: [
    { note: "A4", duration: 0.08, delay: 0 },
    { note: "D4", duration: 0.14, delay: 0.1 },
  ],
  sectionSwitch: [
    { note: "G4", duration: 0.08, delay: 0 },
  ],
  gameStart: [
    { note: "C4", duration: 0.07, delay: 0 },
    { note: "E4", duration: 0.07, delay: 0.08 },
  ],
  gameCorrect: [
    { note: "E4", duration: 0.06, delay: 0 },
    { note: "G4", duration: 0.08, delay: 0.07 },
  ],
  gameWrong: [{ note: "D4", duration: 0.12, delay: 0 }],
  gameFail: [
    { note: "D4", duration: 0.08, delay: 0 },
    { note: "C4", duration: 0.14, delay: 0.09 },
  ],
  gameLevelComplete: [
    { note: "C4", duration: 0.06, delay: 0 },
    { note: "E4", duration: 0.06, delay: 0.07 },
    { note: "G4", duration: 0.1, delay: 0.16 },
    { note: "C5", duration: 0.14, delay: 0.28 },
  ],
};

const getAudioContext = () => {
  if (Platform.OS !== "web") {
    return null;
  }

  if (audioContext) {
    return audioContext;
  }

  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) {
    return null;
  }

  audioContext = new Ctx();
  return audioContext;
};

const playOscillator = (ctx, frequency, duration, delay = 0) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  const startAt = ctx.currentTime + delay;
  const endAt = startAt + duration;

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(0.14, startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startAt);
  oscillator.stop(endAt + 0.01);
};

export const playSoundEffect = async (key) => {
  const pattern = SOUND_PATTERNS[key];
  if (!pattern?.length) {
    return;
  }

  if (Platform.OS !== "web") {
    Vibration.vibrate(16);
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  pattern.forEach(({ note, duration, delay }) => {
    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) {
      return;
    }

    playOscillator(ctx, frequency, duration, delay);
  });
};
