export type RewardedAdResult =
  | { status: 'rewarded'; transactionId: string }
  | { status: 'cancelled' | 'failed' | 'unavailable' };

export interface RewardedAdService {
  isAvailable(): Promise<boolean>;
  showRewardedAd(): Promise<RewardedAdResult>;
}

/** Deterministic test helper; only the guarded development service is app-wired. */
export const createRewardedAdSimulator = (
  outcome: RewardedAdResult,
): RewardedAdService => ({
  isAvailable: async () => true,
  showRewardedAd: async () => outcome,
});

const unavailableService: RewardedAdService = {
  isAvailable: async () => false,
  showRewardedAd: async () => ({ status: 'unavailable' }),
};

let developmentRewardSequence = 0;

/** Development-only simulator. Production builds never select this service. */
const developmentService: RewardedAdService = {
  isAvailable: async () => __DEV__,
  showRewardedAd: async () =>
    __DEV__
      ? {
          status: 'rewarded',
          transactionId: `dev-${Date.now()}-${developmentRewardSequence++}`,
        }
      : { status: 'unavailable' },
};

export const rewardedAdService: RewardedAdService = __DEV__
  ? developmentService
  : unavailableService;
