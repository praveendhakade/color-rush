import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { GameOverScreen } from '@/src/screens/GameOverScreen';
import { GameplayScreen } from '@/src/screens/GameplayScreen';
import { HomeScreen } from '@/src/screens/HomeScreen';
import { SettingsScreen } from '@/src/screens/SettingsScreen';
import { ProfilesScreen } from '@/src/screens/ProfilesScreen';
import { LeaderboardScreen } from '@/src/screens/LeaderboardScreen';
import { GameEngine } from '@/src/game/GameEngine';
import type { DifficultyMode, GameResult, GameState } from '@/src/game/types';
import { useGameTimer } from '@/src/hooks/useGameTimer';
import { feedback } from '@/src/services/Feedback';
import { rewardedAdService } from '@/src/services/RewardedAdService';
import {
  DEFAULT_STORED_DATA,
  gameStorage,
  createPlayer,
  createScoreRecord,
  type PlayerProfile,
  type StoredGameData,
} from '@/src/services/Persistence';

type Screen =
  'home' | 'settings' | 'game' | 'gameOver' | 'profiles' | 'leaderboard';

export default function Index() {
  const [engine] = useState(() => new GameEngine());
  const [screen, setScreen] = useState<Screen>('home');
  const [state, setState] = useState<GameState>(() => engine.getState());
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [stored, setStored] = useState<StoredGameData>(DEFAULT_STORED_DATA);
  const [loaded, setLoaded] = useState(false);
  const sessionPlayerId = useRef<string | null>(null);
  const [sessionPlayerIdForDisplay, setSessionPlayerIdForDisplay] = useState<
    string | null
  >(null);
  const sessionCorrect = useRef(0);
  const sessionWrong = useRef(0);
  const [difficultyMode, setDifficultyMode] =
    useState<DifficultyMode>('medium');
  const [leaderboardDifficulty, setLeaderboardDifficulty] =
    useState<DifficultyMode>('medium');
  const [scoreScale] = useState(() => new Animated.Value(1));
  const handledRewards = useRef(new Set<string>());
  const rewardPending = useRef(false);
  const timerControls = useRef<{
    start: (durationMs: number) => void;
    stop: () => void;
  }>({ start: () => undefined, stop: () => undefined });

  useEffect(() => {
    gameStorage.load().then((data) => {
      setStored(data);
      setDifficultyMode(data.difficultyMode);
      feedback.setSoundEnabled(data.soundEnabled);
      feedback.setHapticsEnabled(data.hapticsEnabled);
      engine.setDifficultyMode(data.difficultyMode);
      setState(engine.setBestScore(data.bestScore));
      if (data.activeProfileId) {
        const active = data.profiles.find(
          (profile) => profile.id === data.activeProfileId,
        );
        if (active) setState(engine.loadBestScore(active.statistics.bestScore));
      }
      setLoaded(true);
    });
  }, [engine]);

  const chooseDifficulty = useCallback(
    (mode: DifficultyMode) => {
      setDifficultyMode(mode);
      setState(engine.setDifficultyMode(mode));
      const next = { ...stored, difficultyMode: mode };
      setStored(next);
      void gameStorage.save(next);
    },
    [engine, stored],
  );

  const toggleSound = useCallback(() => {
    const next = { ...stored, soundEnabled: !stored.soundEnabled };
    setStored(next);
    feedback.setSoundEnabled(next.soundEnabled);
    void gameStorage.save(next);
  }, [stored]);

  const toggleHaptics = useCallback(() => {
    const next = { ...stored, hapticsEnabled: !stored.hapticsEnabled };
    setStored(next);
    feedback.setHapticsEnabled(next.hapticsEnabled);
    void gameStorage.save(next);
  }, [stored]);

  const persistResult = useCallback(
    (result: GameState) => {
      const ownerId = sessionPlayerId.current;
      const owner = stored.profiles.find((profile) => profile.id === ownerId);
      if (!owner) return;
      const playedAt = new Date().toISOString();
      const updated: PlayerProfile = {
        ...owner,
        lastPlayedAt: playedAt,
        statistics: {
          ...owner.statistics,
          gamesPlayed: owner.statistics.gamesPlayed + 1,
          bestScore: Math.max(owner.statistics.bestScore, result.score),
          highestLevel: Math.max(owner.statistics.highestLevel, result.level),
          highestCombo: Math.max(
            owner.statistics.highestCombo,
            result.highestCombo,
          ),
          totalCorrect: owner.statistics.totalCorrect + sessionCorrect.current,
          totalWrong: owner.statistics.totalWrong + sessionWrong.current,
        },
      };
      const records = [
        ...stored.scoreRecords,
        createScoreRecord(
          owner.id,
          result.score,
          result.level,
          result.highestCombo,
          difficultyMode,
        ),
      ];
      const next = {
        ...stored,
        bestScore: Math.max(stored.bestScore, updated.statistics.bestScore),
        gamesPlayed: stored.gamesPlayed + 1,
        highestCombo: Math.max(stored.highestCombo, result.highestCombo),
        profiles: stored.profiles.map((profile) =>
          profile.id === owner.id ? updated : profile,
        ),
        scoreRecords: records,
      };
      setStored(next);
      void gameStorage.save(next);
    },
    [difficultyMode, stored],
  );

  const finishGame = useCallback(() => {
    const result = engine.getResult();
    const finalState = engine.endGame();
    setState(finalState);
    setGameResult(result);
    persistResult(finalState);
    feedback.haptic('gameover');
    feedback.sound('gameover');
    setScreen('gameOver');
  }, [engine, persistResult]);

  const loseLife = useCallback(() => {
    const livesBefore = engine.getState().lives;
    const result = engine.handleWrongAnswer();
    if (result.state.lives === livesBefore) return;
    sessionWrong.current += 1;
    setState(result.state);
    feedback.haptic('wrong');
    feedback.sound('wrong');
    if (result.state.status === 'playing')
      timerControls.current.start(result.state.timeRemaining);
    else {
      timerControls.current.stop();
      setState(result.state);
      if (result.state.status === 'gameOver') finishGame();
    }
  }, [engine, finishGame]);

  const {
    start: startTimer,
    stop: stopTimer,
    pause: pauseTimer,
  } = useGameTimer(loseLife, (milliseconds) =>
    setState(engine.setTimeRemaining(milliseconds)),
  );
  useEffect(() => {
    timerControls.current = { start: startTimer, stop: stopTimer };
  }, [startTimer, stopTimer]);

  const startGame = useCallback(() => {
    stopTimer();
    sessionPlayerId.current = stored.activeProfileId;
    setSessionPlayerIdForDisplay(stored.activeProfileId);
    sessionCorrect.current = 0;
    sessionWrong.current = 0;
    const next = engine.startGame();
    setState(next);
    setGameResult(null);
    setScreen('game');
    startTimer(next.timeRemaining);
  }, [engine, startTimer, stopTimer, stored.activeProfileId]);

  const pauseGame = useCallback(() => {
    const remaining = pauseTimer();
    setState(engine.pauseGame(remaining));
  }, [engine, pauseTimer]);

  const resumeGame = useCallback(() => {
    const next = engine.resumeGame();
    setState(next);
    startTimer(next.timeRemaining);
  }, [engine, startTimer]);

  const tapTile = useCallback(
    (tileId: string) => {
      feedback.sound('tap');
      const livesBefore = engine.getState().lives;
      const result = engine.handleTap(tileId);
      setState(result.state);
      if (!result.correct) {
        if (result.state.lives === livesBefore) return;
        sessionWrong.current += 1;
        feedback.haptic('wrong');
        feedback.sound('wrong');
        if (result.state.status === 'playing')
          startTimer(result.state.timeRemaining);
        else {
          stopTimer();
          setState(result.state);
          if (result.state.status === 'gameOver') finishGame();
        }
        return;
      }
      sessionCorrect.current += 1;
      feedback.haptic(result.state.combo >= 5 ? 'combo' : 'correct');
      feedback.sound(result.state.combo >= 5 ? 'combo' : 'correct');
      Animated.sequence([
        Animated.timing(scoreScale, {
          toValue: 1.15,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(scoreScale, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
      ]).start();
      startTimer(result.state.timeRemaining);
    },
    [engine, finishGame, scoreScale, startTimer, stopTimer],
  );

  const revive = useCallback(async () => {
    if (rewardPending.current || engine.getState().status !== 'reviveOffer')
      return;
    rewardPending.current = true;
    try {
      if (!(await rewardedAdService.isAvailable())) return;
      const outcome = await rewardedAdService.showRewardedAd();
      if (
        outcome.status !== 'rewarded' ||
        handledRewards.current.has(outcome.transactionId)
      )
        return;
      handledRewards.current.add(outcome.transactionId);
      const next = engine.grantRevive();
      if (next.status !== 'playing') return;
      setState(next);
      startTimer(next.timeRemaining);
    } finally {
      rewardPending.current = false;
    }
  }, [engine, startTimer]);

  const endRun = useCallback(() => {
    if (engine.getState().status !== 'reviveOffer') return;
    stopTimer();
    finishGame();
  }, [engine, finishGame, stopTimer]);

  const goHome = useCallback(() => {
    stopTimer();
    setState(engine.resetGame());
    setGameResult(null);
    setScreen('home');
  }, [engine, stopTimer]);

  const activeProfile = stored.profiles.find(
    (profile) => profile.id === stored.activeProfileId,
  );
  const saveProfile = (
    profile: PlayerProfile | null,
    name: string,
    avatarId: string,
  ) => {
    const nextProfile = profile
      ? { ...profile, name, avatarId }
      : createPlayer(name, avatarId);
    const profiles = profile
      ? stored.profiles.map((item) =>
          item.id === profile.id ? nextProfile : item,
        )
      : [...stored.profiles, nextProfile];
    const next = {
      ...stored,
      bestScore: Math.max(
        0,
        ...profiles.map((item) => item.statistics.bestScore),
      ),
      gamesPlayed: profiles.reduce(
        (total, item) => total + item.statistics.gamesPlayed,
        0,
      ),
      highestCombo: Math.max(
        0,
        ...profiles.map((item) => item.statistics.highestCombo),
      ),
      profiles,
      activeProfileId: stored.activeProfileId ?? nextProfile.id,
    };
    setStored(next);
    void gameStorage.save(next);
    if (!stored.activeProfileId) {
      setState(engine.loadBestScore(nextProfile.statistics.bestScore));
      setScreen('home');
    }
  };
  const switchProfile = (id: string) => {
    if (
      screen === 'game' ||
      engine.getState().status === 'playing' ||
      engine.getState().status === 'paused' ||
      engine.getState().status === 'reviveOffer'
    )
      return;
    const selected = stored.profiles.find((profile) => profile.id === id);
    if (!selected) return;
    const next = { ...stored, activeProfileId: id };
    setStored(next);
    void gameStorage.save(next);
    setState(engine.loadBestScore(selected.statistics.bestScore));
  };
  const deleteProfile = (profile: PlayerProfile) => {
    const profiles = stored.profiles.filter((item) => item.id !== profile.id);
    const activeProfileId =
      stored.activeProfileId === profile.id
        ? (profiles[0]?.id ?? null)
        : stored.activeProfileId;
    const next = {
      ...stored,
      bestScore: Math.max(
        0,
        ...profiles.map((item) => item.statistics.bestScore),
      ),
      gamesPlayed: profiles.reduce(
        (total, item) => total + item.statistics.gamesPlayed,
        0,
      ),
      highestCombo: Math.max(
        0,
        ...profiles.map((item) => item.statistics.highestCombo),
      ),
      profiles,
      activeProfileId,
      scoreRecords: stored.scoreRecords.filter(
        (score) => score.playerId !== profile.id,
      ),
    };
    setStored(next);
    void gameStorage.save(next);
    if (activeProfileId) {
      const active = profiles.find((item) => item.id === activeProfileId)!;
      setState(engine.loadBestScore(active.statistics.bestScore));
    } else setScreen('profiles');
  };

  if (!loaded) return null;
  if (stored.profiles.length === 0)
    return (
      <ProfilesScreen
        profiles={[]}
        activeProfileId={null}
        onboarding
        onBack={() => undefined}
        onActivate={switchProfile}
        onSave={saveProfile}
        onDelete={deleteProfile}
      />
    );
  if (screen === 'profiles')
    return (
      <ProfilesScreen
        profiles={stored.profiles}
        activeProfileId={stored.activeProfileId}
        onBack={() => setScreen('home')}
        onActivate={(id) => {
          switchProfile(id);
          setScreen('home');
        }}
        onSave={saveProfile}
        onDelete={deleteProfile}
      />
    );
  if (screen === 'leaderboard')
    return (
      <LeaderboardScreen
        profiles={stored.profiles}
        activeProfileId={stored.activeProfileId}
        difficulty={leaderboardDifficulty}
        records={stored.scoreRecords}
        onDifficulty={setLeaderboardDifficulty}
        onBack={() => setScreen('home')}
      />
    );
  if (screen === 'home')
    return (
      <HomeScreen
        bestScore={activeProfile?.statistics.bestScore ?? 0}
        activeProfile={activeProfile!}
        onProfiles={() => setScreen('profiles')}
        onLeaderboard={() => {
          setLeaderboardDifficulty(difficultyMode);
          setScreen('leaderboard');
        }}
        onSettings={() => setScreen('settings')}
        onPlay={startGame}
      />
    );
  if (screen === 'settings')
    return (
      <SettingsScreen
        difficultyMode={difficultyMode}
        soundEnabled={stored.soundEnabled}
        hapticsEnabled={stored.hapticsEnabled}
        onChooseDifficulty={chooseDifficulty}
        onToggleSound={toggleSound}
        onToggleHaptics={toggleHaptics}
        onBack={() => setScreen('home')}
      />
    );
  if (screen === 'gameOver')
    return (
      <GameOverScreen
        state={state}
        result={gameResult}
        player={
          stored.profiles.find(
            (profile) => profile.id === sessionPlayerIdForDisplay,
          ) ?? activeProfile!
        }
        onReplay={startGame}
        onHome={goHome}
      />
    );
  return (
    <GameplayScreen
      state={state}
      difficultyMode={difficultyMode}
      scoreScale={scoreScale}
      onTap={tapTile}
      onPause={pauseGame}
      onResume={resumeGame}
      onRestart={startGame}
      onHome={goHome}
      onRevive={revive}
      onEndGame={endRun}
    />
  );
}
