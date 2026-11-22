import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DifficultyMode } from '../game/types';

const STORAGE_KEY = '@color-rush/profiles-v2';
const LEGACY_STORAGE_KEY = '@color-rush/preferences-v1';
export const MAX_PLAYER_NAME_LENGTH = 20;

export interface PlayerStatistics {
  gamesPlayed: number;
  bestScore: number;
  highestLevel: number;
  highestCombo: number;
  totalCorrect: number;
  totalWrong: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatarId: string;
  createdAt: string;
  lastPlayedAt: string;
  statistics: PlayerStatistics;
  accountId?: string;
  syncEnabled?: boolean;
}

export interface ScoreRecord {
  id: string;
  playerId: string;
  score: number;
  level: number;
  combo: number;
  difficulty: DifficultyMode;
  playedAt: string;
}

export interface StoredGameData {
  bestScore: number;
  gamesPlayed: number;
  highestCombo: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  difficultyMode: DifficultyMode;
  schemaVersion: 2;
  profiles: PlayerProfile[];
  activeProfileId: string | null;
  scoreRecords: ScoreRecord[];
}

type LegacyGameData = Partial<
  Pick<
    StoredGameData,
    | 'bestScore'
    | 'gamesPlayed'
    | 'highestCombo'
    | 'soundEnabled'
    | 'hapticsEnabled'
    | 'difficultyMode'
  >
> & { highestLevel?: number };

const emptyStats = (): PlayerStatistics => ({
  gamesPlayed: 0,
  bestScore: 0,
  highestLevel: 1,
  highestCombo: 0,
  totalCorrect: 0,
  totalWrong: 0,
});

export const DEFAULT_STORED_DATA: StoredGameData = {
  bestScore: 0,
  gamesPlayed: 0,
  highestCombo: 0,
  soundEnabled: true,
  hapticsEnabled: true,
  difficultyMode: 'medium',
  schemaVersion: 2,
  profiles: [],
  activeProfileId: null,
  scoreRecords: [],
};

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const validMode = (value: unknown): value is DifficultyMode =>
  value === 'easy' || value === 'medium' || value === 'hard';

const asCount = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : fallback;

const makeProfile = (name: string, avatarId = 'sunny'): PlayerProfile => {
  const now = new Date().toISOString();
  return {
    id: newId('player'),
    name,
    avatarId,
    createdAt: now,
    lastPlayedAt: now,
    statistics: emptyStats(),
  };
};

const parseLegacy = (serialized: string): LegacyGameData | null => {
  try {
    const value: unknown = JSON.parse(serialized);
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return null;
    return value as LegacyGameData;
  } catch {
    return null;
  }
};

const migrateLegacy = (legacy: LegacyGameData): StoredGameData => {
  const bestScore = asCount(legacy.bestScore);
  const gamesPlayed = asCount(legacy.gamesPlayed);
  const highestCombo = asCount(legacy.highestCombo);
  const profile = makeProfile('Player 1');
  profile.statistics = {
    ...emptyStats(),
    bestScore,
    gamesPlayed,
    highestCombo,
    highestLevel: asCount(legacy.highestLevel, 1) || 1,
  };
  return {
    ...DEFAULT_STORED_DATA,
    bestScore,
    gamesPlayed,
    highestCombo,
    soundEnabled:
      typeof legacy.soundEnabled === 'boolean' ? legacy.soundEnabled : true,
    hapticsEnabled:
      typeof legacy.hapticsEnabled === 'boolean' ? legacy.hapticsEnabled : true,
    difficultyMode: validMode(legacy.difficultyMode)
      ? legacy.difficultyMode
      : 'medium',
    profiles: [profile],
    activeProfileId: profile.id,
    scoreRecords:
      bestScore > 0
        ? [
            {
              id: newId('score'),
              playerId: profile.id,
              score: bestScore,
              level: profile.statistics.highestLevel,
              combo: highestCombo,
              difficulty: validMode(legacy.difficultyMode)
                ? legacy.difficultyMode
                : 'medium',
              playedAt: profile.lastPlayedAt,
            },
          ]
        : [],
  };
};

const sanitize = (value: unknown): StoredGameData => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return DEFAULT_STORED_DATA;
  const data = value as Partial<StoredGameData>;
  const profiles = Array.isArray(data.profiles)
    ? data.profiles.flatMap((candidate): PlayerProfile[] => {
        if (!candidate || typeof candidate !== 'object') return [];
        const p = candidate as Partial<PlayerProfile>;
        if (typeof p.id !== 'string' || typeof p.name !== 'string') return [];
        const stats =
          p.statistics && typeof p.statistics === 'object'
            ? p.statistics
            : emptyStats();
        return [
          {
            id: p.id,
            name: p.name.trim().slice(0, MAX_PLAYER_NAME_LENGTH) || 'Player',
            avatarId: typeof p.avatarId === 'string' ? p.avatarId : 'sunny',
            createdAt:
              typeof p.createdAt === 'string'
                ? p.createdAt
                : new Date(0).toISOString(),
            lastPlayedAt:
              typeof p.lastPlayedAt === 'string'
                ? p.lastPlayedAt
                : new Date(0).toISOString(),
            statistics: {
              gamesPlayed: asCount(stats.gamesPlayed),
              bestScore: asCount(stats.bestScore),
              highestLevel: Math.max(1, asCount(stats.highestLevel, 1)),
              highestCombo: asCount(stats.highestCombo),
              totalCorrect: asCount(stats.totalCorrect),
              totalWrong: asCount(stats.totalWrong),
            },
            ...(typeof p.accountId === 'string'
              ? { accountId: p.accountId }
              : {}),
            ...(typeof p.syncEnabled === 'boolean'
              ? { syncEnabled: p.syncEnabled }
              : {}),
          },
        ];
      })
    : [];
  const activeProfileId = profiles.some((p) => p.id === data.activeProfileId)
    ? data.activeProfileId!
    : (profiles[0]?.id ?? null);
  const scores = Array.isArray(data.scoreRecords)
    ? data.scoreRecords.filter(
        (s): s is ScoreRecord =>
          !!s &&
          typeof s.id === 'string' &&
          typeof s.playerId === 'string' &&
          profiles.some((p) => p.id === s.playerId) &&
          typeof s.score === 'number' &&
          validMode(s.difficulty),
      )
    : [];
  return {
    ...DEFAULT_STORED_DATA,
    ...data,
    bestScore: asCount(data.bestScore),
    gamesPlayed: asCount(data.gamesPlayed),
    highestCombo: asCount(data.highestCombo),
    difficultyMode: validMode(data.difficultyMode)
      ? data.difficultyMode
      : 'medium',
    profiles,
    activeProfileId,
    scoreRecords: scores,
  };
};

export const gameStorage = {
  async load(): Promise<StoredGameData> {
    try {
      const current = await AsyncStorage.getItem(STORAGE_KEY);
      if (current) return sanitize(JSON.parse(current));
      const previous = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      if (!previous) return DEFAULT_STORED_DATA;
      const legacy = parseLegacy(previous);
      if (!legacy) return DEFAULT_STORED_DATA;
      const migrated = migrateLegacy(legacy);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
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

export const createPlayer = (name: string, avatarId: string): PlayerProfile => {
  const cleaned = name.trim().slice(0, MAX_PLAYER_NAME_LENGTH);
  if (!cleaned) throw new Error('Enter a player name.');
  return makeProfile(cleaned, avatarId);
};

export const createScoreRecord = (
  playerId: string,
  score: number,
  level: number,
  combo: number,
  difficulty: DifficultyMode,
): ScoreRecord => ({
  id: newId('score'),
  playerId,
  score,
  level,
  combo,
  difficulty,
  playedAt: new Date().toISOString(),
});

export const emptyPlayerStatistics = emptyStats;
