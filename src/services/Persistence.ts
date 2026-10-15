import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@color-rush/preferences-v1';

export interface StoredGameData {
  bestScore: number;
  gamesPlayed: number;
  highestCombo: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export const DEFAULT_STORED_DATA: StoredGameData = {
  bestScore: 0,
  gamesPlayed: 0,
  highestCombo: 0,
  soundEnabled: true,
  hapticsEnabled: true,
};

export const gameStorage = {
  async load(): Promise<StoredGameData> {
    try {
      const serialized = await AsyncStorage.getItem(STORAGE_KEY);
      return serialized
        ? {
            ...DEFAULT_STORED_DATA,
            ...(JSON.parse(serialized) as Partial<StoredGameData>),
          }
        : DEFAULT_STORED_DATA;
    } catch {
      return DEFAULT_STORED_DATA;
    }
  },
  async save(data: StoredGameData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* Core gameplay remains available offline. */
    }
  },
};
