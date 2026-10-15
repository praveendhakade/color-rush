export type FeedbackEvent =
  'tap' | 'correct' | 'wrong' | 'combo' | 'levelup' | 'gameover';

export interface FeedbackService {
  haptic(event: FeedbackEvent): void;
  sound(event: FeedbackEvent): void;
}

// V1 intentionally has no audio assets or native haptics dependency. This keeps gameplay
// independent of device capabilities while providing one integration seam for Phase 2.
export const feedback: FeedbackService = {
  haptic: () => undefined,
  sound: () => undefined,
};
