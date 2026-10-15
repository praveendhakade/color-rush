import { AppState, type AppStateStatus } from 'react-native';
import { useCallback, useEffect, useRef } from 'react';

export const useGameTimer = (
  onExpire: () => void,
  onTick: (milliseconds: number) => void,
) => {
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiresAt = useRef(0);
  const active = useRef(true);
  const expireCallback = useRef(onExpire);
  const tickCallback = useRef(onTick);
  useEffect(() => {
    expireCallback.current = onExpire;
    tickCallback.current = onTick;
  }, [onExpire, onTick]);

  const stop = useCallback(() => {
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
  }, []);

  const start = useCallback(
    (durationMs: number) => {
      stop();
      expiresAt.current = Date.now() + durationMs;
      interval.current = setInterval(() => {
        if (!active.current) return;
        const remaining = Math.max(0, expiresAt.current - Date.now());
        tickCallback.current(remaining);
        if (remaining === 0) {
          stop();
          expireCallback.current();
        }
      }, 50);
    },
    [stop],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        active.current = nextState === 'active';
        if (!active.current) stop();
      },
    );
    return () => {
      subscription.remove();
      stop();
    };
  }, [stop]);

  return { start, stop };
};
