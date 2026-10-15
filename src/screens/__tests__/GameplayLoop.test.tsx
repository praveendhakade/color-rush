import { fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '@/app/index';

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

    const wrongTarget = getWrongTarget(view, target);
    fireEvent.press(view.getAllByLabelText(`${wrongTarget} tile`)[0]!);
    expect(view.getByText('GAME OVER')).toBeTruthy();
    expect(view.getByText('COMBO x1')).toBeTruthy();

    fireEvent.press(view.getByLabelText('PLAY AGAIN'));
    expect(view.getByText(/TAP/)).toBeTruthy();

    const replayTarget = getTarget(view);
    const replayWrongTarget = getWrongTarget(view, replayTarget);
    fireEvent.press(view.getAllByLabelText(`${replayWrongTarget} tile`)[0]!);
    fireEvent.press(view.getByLabelText('HOME'));
    expect(view.getByText('COLOR\nRUSH')).toBeTruthy();
    expect(view.getByLabelText('PLAY')).toBeTruthy();
  });
});
