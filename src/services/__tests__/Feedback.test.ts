import { createAudioPlayer } from 'expo-audio';
import { Vibration } from 'react-native';
import { feedback } from '../Feedback';

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    seekTo: jest.fn().mockResolvedValue(undefined),
  })),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

const getPlayers = () =>
  jest
    .mocked(createAudioPlayer)
    .mock.results.map(
      ({ value }) => value as unknown as { play: jest.Mock; seekTo: jest.Mock },
    );

describe('sound feedback', () => {
  beforeEach(() => {
    getPlayers().forEach((player) => {
      player.play.mockClear();
      player.seekTo.mockClear();
    });
    feedback.setSoundEnabled(true);
  });

  it('plays the matching effect when sound is enabled', async () => {
    feedback.sound('correct');
    await Promise.resolve();

    expect(getPlayers()[1]?.seekTo).toHaveBeenCalledWith(0);
    expect(getPlayers()[1]?.play).toHaveBeenCalledTimes(1);
  });

  it('does not play effects when sound is disabled', async () => {
    feedback.setSoundEnabled(false);
    feedback.sound('correct');
    await Promise.resolve();

    expect(getPlayers()[1]?.seekTo).not.toHaveBeenCalled();
    expect(getPlayers()[1]?.play).not.toHaveBeenCalled();
  });
});

describe('haptic feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    feedback.setHapticsEnabled(true);
    jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('vibrates when a life is lost and uses a stronger pattern for game over', () => {
    feedback.haptic('wrong');
    feedback.haptic('gameover');

    expect(Vibration.vibrate).toHaveBeenNthCalledWith(1, 60);
    expect(Vibration.vibrate).toHaveBeenNthCalledWith(2, [0, 80, 75, 180]);
  });

  it('respects the saved haptics setting', () => {
    feedback.setHapticsEnabled(false);
    feedback.haptic('wrong');

    expect(Vibration.vibrate).not.toHaveBeenCalled();
  });
});
