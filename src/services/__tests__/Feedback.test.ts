import { createAudioPlayer } from 'expo-audio';
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
