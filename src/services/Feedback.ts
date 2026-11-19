import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export type FeedbackEvent =
  'tap' | 'correct' | 'wrong' | 'combo' | 'levelup' | 'gameover';

export interface FeedbackService {
  haptic(event: FeedbackEvent): void;
  sound(event: FeedbackEvent): void;
  setSoundEnabled(enabled: boolean): void;
}

const players = {
  tap: createAudioPlayer(require('../../assets/sounds/tap.wav')),
  correct: createAudioPlayer(require('../../assets/sounds/correct.wav')),
  wrong: createAudioPlayer(require('../../assets/sounds/wrong.wav')),
  combo: createAudioPlayer(require('../../assets/sounds/combo.wav')),
  gameover: createAudioPlayer(require('../../assets/sounds/gameover.wav')),
};
let soundEnabled = true;
void setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: false,
});

export const feedback: FeedbackService = {
  haptic: () => undefined,
  setSoundEnabled: (enabled) => {
    soundEnabled = enabled;
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
