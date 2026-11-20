import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '@/app/index';

jest.mock('expo-audio', () => ({
  createAudioPlayer: () => ({
    play: jest.fn(),
    seekTo: jest.fn().mockResolvedValue(undefined),
  }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
}));

const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'] as const;

const getTarget = (
  view: ReturnType<typeof render>,
): (typeof COLORS)[number] => {
  const target = COLORS.find((color) =>
    view.queryByText(`Choose the tile labeled ${color}.`),
  );
  if (!target) throw new Error('The game target was not rendered.');
  return target;
};

const getWrongTarget = (
  view: ReturnType<typeof render>,
  target: (typeof COLORS)[number],
): (typeof COLORS)[number] => {
  const wrongTarget = COLORS.find(
    (color) =>
      color !== target && view.queryAllByLabelText(`${color} tile`).length > 0,
  );
  if (!wrongTarget) throw new Error('The game did not render a decoy tile.');
  return wrongTarget;
};

describe('complete gameplay loop', () => {
  it('moves from home through a scored game to game over, replay, and home', async () => {
    const view = render(<App />);
    await waitFor(() => expect(view.getByText('COLOR\nRUSH')).toBeTruthy());

    fireEvent.press(view.getByTestId('play-button'));
    const target = getTarget(view);
    fireEvent.press(view.getAllByLabelText(`${target} tile`)[0]!);
    expect(view.getByText('COMBO x1')).toBeTruthy();
    expect(view.getByText(/SCORE [1-9]/)).toBeTruthy();

    for (let life = 0; life < 3; life += 1) {
      const wrongTarget = getWrongTarget(view, getTarget(view));
      fireEvent.press(view.getAllByLabelText(`${wrongTarget} tile`)[0]!);
    }
    expect(view.getByText("DON'T GIVE UP!")).toBeTruthy();
    expect(view.getByText(/SCORE:/)).toBeTruthy();
    fireEvent.press(view.getByLabelText('END GAME'));
    expect(view.getByText('GAME OVER')).toBeTruthy();

    fireEvent.press(view.getByLabelText('PLAY AGAIN'));
    expect(view.getByText(/TAP/)).toBeTruthy();

    for (let life = 0; life < 3; life += 1) {
      const replayWrongTarget = getWrongTarget(view, getTarget(view));
      fireEvent.press(view.getAllByLabelText(`${replayWrongTarget} tile`)[0]!);
    }
    fireEvent.press(view.getByLabelText('END GAME'));
    fireEvent.press(view.getByLabelText('HOME'));
    expect(view.getByText('COLOR\nRUSH')).toBeTruthy();
    expect(view.getByLabelText('PLAY')).toBeTruthy();
  });

  it('shows lives and resumes the same run after a development reward', async () => {
    const view = render(<App />);
    await waitFor(() => expect(view.getByText('COLOR\nRUSH')).toBeTruthy());
    fireEvent.press(view.getByTestId('play-button'));
    expect(view.getByLabelText('3 lives remaining')).toBeTruthy();
    for (let life = 0; life < 3; life += 1) {
      const wrong = getWrongTarget(view, getTarget(view));
      fireEvent.press(view.getAllByLabelText(`${wrong} tile`)[0]!);
    }
    fireEvent.press(view.getByLabelText('WATCH AD & CONTINUE (DEV)'));
    await waitFor(() =>
      expect(view.getByLabelText('1 lives remaining')).toBeTruthy(),
    );
    expect(view.queryByText("DON'T GIVE UP!")).toBeNull();
  });

  it('saves difficulty and sound choices from settings', async () => {
    const view = render(<App />);
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.press(view.getByLabelText('SETTINGS'));

    const soundSwitch = view.getByRole('switch', { name: 'SOUND' });
    expect(soundSwitch.props.accessibilityState.checked).toBe(true);
    fireEvent.press(view.getByRole('button', { name: 'HARD' }));
    fireEvent.press(soundSwitch);
    expect(
      view.getByRole('switch', { name: 'SOUND' }).props.accessibilityState
        .checked,
    ).toBe(false);
    expect(
      view.getByRole('switch', { name: 'HAPTICS' }).props.accessibilityState
        .checked,
    ).toBe(true);
    expect(
      view.getByRole('button', { name: 'HARD' }).props.accessibilityState
        .selected,
    ).toBe(true);

    fireEvent.press(view.getByLabelText('BACK'));
    fireEvent.press(view.getByTestId('play-button'));
    expect(view.getByText(/TAP/)).toBeTruthy();
  });
});
