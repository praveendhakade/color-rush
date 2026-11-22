import type { DifficultyMode } from './types';
import type { PlayerProfile, ScoreRecord } from '../services/Persistence';

export interface RankedPlayer {
  profile: PlayerProfile;
  bestRecord: ScoreRecord | undefined;
}

/** Ranks one entry per profile. Equal scores favor the profile created first. */
export const rankPlayers = (
  profiles: PlayerProfile[],
  records: ScoreRecord[],
  difficulty: DifficultyMode,
): RankedPlayer[] =>
  profiles
    .map((profile) => ({
      profile,
      bestRecord: records
        .filter(
          (record) =>
            record.playerId === profile.id && record.difficulty === difficulty,
        )
        .sort(
          (a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt),
        )[0],
    }))
    .sort(
      (a, b) =>
        (b.bestRecord?.score ?? 0) - (a.bestRecord?.score ?? 0) ||
        a.profile.createdAt.localeCompare(b.profile.createdAt),
    );
