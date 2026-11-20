import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Vibration } from 'react-native';

export type FeedbackEvent =
  'tap' | 'correct' | 'wrong' | 'combo' | 'levelup' | 'gameover';

export interface FeedbackService {
  haptic(event: FeedbackEvent): void;
  sound(event: FeedbackEvent): void;
  setSoundEnabled(enabled: boolean): void;
  setHapticsEnabled(enabled: boolean): void;
}

const players = {
  tap: createAudioPlayer(require('../../assets/sounds/tap.wav')),
  correct: createAudioPlayer(require('../../assets/sounds/correct.wav')),
  wrong: createAudioPlayer(require('../../assets/sounds/wrong.wav')),
  combo: createAudioPlayer(require('../../assets/sounds/combo.wav')),
  gameover: createAudioPlayer(require('../../assets/sounds/gameover.wav')),
};
let soundEnabled = true;
let hapticsEnabled = true;
const hapticPatterns: Record<FeedbackEvent, number | number[]> = {
  tap: 15,
  correct: 25,
  wrong: 60,
  combo: [0, 40, 45, 40],
  levelup: [0, 45, 50, 70],
  gameover: [0, 80, 75, 180],
};
void setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: false,
});

export const feedback: FeedbackService = {
  haptic: (event) => {
    if (!hapticsEnabled) return;
    try {
      Vibration.vibrate(hapticPatterns[event]);
    } catch {
      // Unsupported devices continue without tactile feedback.
    }
  },
  setSoundEnabled: (enabled) => {
    soundEnabled = enabled;
  },
  setHapticsEnabled: (enabled) => {
    hapticsEnabled = enabled;
  },
  sound: (event) => {
    if (!soundEnabled) return;
    const player = event === 'levelup' ? players.combo : players[event];
    void player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => undefined);
  },
};
