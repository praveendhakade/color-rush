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

    const wrongTarget = getWrongTarget(view, getTarget(view));
    fireEvent.press(view.getAllByLabelText(`${wrongTarget} tile`)[0]!);
    expect(view.getByText('GAME OVER')).toBeTruthy();
    expect(view.getByText('COMBO x1')).toBeTruthy();

    fireEvent.press(view.getByLabelText('PLAY AGAIN'));
    expect(view.getByText(/TAP/)).toBeTruthy();

    const replayWrongTarget = getWrongTarget(view, getTarget(view));
    fireEvent.press(view.getAllByLabelText(`${replayWrongTarget} tile`)[0]!);
    fireEvent.press(view.getByLabelText('HOME'));
    expect(view.getByText('COLOR\nRUSH')).toBeTruthy();
    expect(view.getByLabelText('PLAY')).toBeTruthy();
  });

  it('saves difficulty and sound choices from settings', async () => {
    const view = render(<App />);
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.press(view.getByLabelText('SETTINGS'));

    const soundSwitch = view.getByRole('switch');
    expect(soundSwitch.props.accessibilityState.checked).toBe(true);
    fireEvent.press(view.getByRole('button', { name: 'HARD' }));
    fireEvent.press(soundSwitch);
    expect(view.getByRole('switch').props.accessibilityState.checked).toBe(
      false,
    );
    expect(
      view.getByRole('button', { name: 'HARD' }).props.accessibilityState
        .selected,
    ).toBe(true);

    fireEvent.press(view.getByLabelText('BACK'));
    fireEvent.press(view.getByTestId('play-button'));
    expect(view.getByText(/TAP/)).toBeTruthy();
  });
});
