import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPlayer, gameStorage } from '../Persistence';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(null),
}));

const getItem = AsyncStorage.getItem as jest.Mock;
const setItem = AsyncStorage.setItem as jest.Mock;

describe('profile persistence and migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getItem.mockResolvedValue(null);
  });

  it('migrates legacy progress and preserves settings in a single default profile', async () => {
    getItem.mockImplementation((key: string) =>
      Promise.resolve(
        key.endsWith('preferences-v1')
          ? JSON.stringify({
              bestScore: 275,
              gamesPlayed: 8,
              highestCombo: 6,
              soundEnabled: false,
              hapticsEnabled: true,
              difficultyMode: 'hard',
            })
          : null,
      ),
    );
    const migrated = await gameStorage.load();
    expect(migrated.profiles).toHaveLength(1);
    expect(migrated.profiles[0]).toMatchObject({
      name: 'Player 1',
      statistics: { bestScore: 275, gamesPlayed: 8, highestCombo: 6 },
    });
    expect(migrated.activeProfileId).toBe(migrated.profiles[0]?.id);
    expect(migrated).toMatchObject({
      soundEnabled: false,
      hapticsEnabled: true,
      difficultyMode: 'hard',
    });
    expect(migrated.scoreRecords[0]).toMatchObject({
      playerId: migrated.activeProfileId,
      score: 275,
    });
    expect(setItem).toHaveBeenCalledWith(
      '@color-rush/profiles-v2',
      expect.any(String),
    );
  });

  it('does not recreate a migrated profile after the versioned record exists', async () => {
    const first = await gameStorage.load();
    const profile = createPlayer('Alex', 'fox');
    await gameStorage.save({
      ...first,
      profiles: [profile],
      activeProfileId: profile.id,
    });
    const serialized = (setItem.mock.calls[0]?.[1] as string) ?? '';
    getItem.mockImplementation((key: string) =>
      Promise.resolve(
        key.endsWith('profiles-v2')
          ? serialized
          : JSON.stringify({ bestScore: 999 }),
      ),
    );
    expect((await gameStorage.load()).profiles).toHaveLength(1);
    expect((await gameStorage.load()).profiles[0]?.name).toBe('Alex');
  });

  it('validates and normalizes names when creating profiles', () => {
    expect(createPlayer('  Alex  ', 'fox').name).toBe('Alex');
    expect(() => createPlayer('   ', 'sunny')).toThrow('Enter a player name.');
  });

  it('keeps fresh installs empty for onboarding and tolerates malformed old data', async () => {
    expect((await gameStorage.load()).profiles).toHaveLength(0);
    getItem.mockImplementation((key: string) =>
      Promise.resolve(key.endsWith('preferences-v1') ? '{bad json' : null),
    );
    expect((await gameStorage.load()).profiles).toHaveLength(0);
  });
});
