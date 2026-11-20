import { createRewardedAdSimulator } from '../RewardedAdService';

describe('RewardedAdService development/test simulator', () => {
  it.each([
    { status: 'rewarded', transactionId: 'verified-test-reward' } as const,
    { status: 'cancelled' } as const,
    { status: 'failed' } as const,
    { status: 'unavailable' } as const,
  ])('returns the configured outcome: $status', async (outcome) => {
    const service = createRewardedAdSimulator(outcome);
    await expect(service.isAvailable()).resolves.toBe(true);
    await expect(service.showRewardedAd()).resolves.toEqual(outcome);
  });
});
