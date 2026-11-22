import { rankPlayers } from '../Leaderboard';
import type { PlayerProfile, ScoreRecord } from '@/src/services/Persistence';

const player = (name: string, createdAt: string): PlayerProfile => ({
  id: name.toLowerCase(),
  name,
  avatarId: 'sunny',
  createdAt,
  lastPlayedAt: createdAt,
  statistics: {
    gamesPlayed: 0,
    bestScore: 0,
    highestLevel: 1,
    highestCombo: 0,
    totalCorrect: 0,
    totalWrong: 0,
  },
});

const score = (
  playerId: string,
  value: number,
  difficulty: ScoreRecord['difficulty'],
): ScoreRecord => ({
  id: `${playerId}-${value}-${difficulty}`,
  playerId,
  score: value,
  level: 1,
  combo: 1,
  difficulty,
  playedAt: '2026-01-01',
});

describe('local leaderboard ranking', () => {
  it('ranks each player by their best score in the selected difficulty', () => {
    const alex = player('Alex', '2026-01-01');
    const sam = player('Sam', '2026-01-02');
    const records = [
      score(alex.id, 180, 'medium'),
      score(alex.id, 250, 'medium'),
      score(sam.id, 300, 'hard'),
      score(sam.id, 220, 'medium'),
    ];
    expect(
      rankPlayers([alex, sam], records, 'medium').map(
        ({ profile, bestRecord }) => [profile.name, bestRecord?.score],
      ),
    ).toEqual([
      ['Alex', 250],
      ['Sam', 220],
    ]);
    expect(
      rankPlayers([alex, sam], records, 'hard').map(
        ({ profile, bestRecord }) => [profile.name, bestRecord?.score],
      ),
    ).toEqual([
      ['Sam', 300],
      ['Alex', undefined],
    ]);
  });

  it('uses profile creation order for ties and keeps one entry per profile', () => {
    const first = player('First', '2026-01-01');
    const second = player('Second', '2026-01-02');
    const ranked = rankPlayers(
      [second, first],
      [
        score(first.id, 100, 'easy'),
        score(first.id, 90, 'easy'),
        score(second.id, 100, 'easy'),
      ],
      'easy',
    );
    expect(ranked.map(({ profile }) => profile.id)).toEqual([
      first.id,
      second.id,
    ]);
    expect(ranked).toHaveLength(2);
  });
});
