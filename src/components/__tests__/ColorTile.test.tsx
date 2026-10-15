import { fireEvent, render } from '@testing-library/react-native';
import { ColorTile } from '../ColorTile';

describe('ColorTile', () => {
  it('is labeled accessibly and forwards its tile id on press', () => {
    const onPress = jest.fn();
    const view = render(
      <ColorTile tile={{ id: 'tile-1', color: 'red' }} onPress={onPress} />,
    );
    fireEvent.press(view.getByLabelText('RED tile'));
    expect(onPress).toHaveBeenCalledWith('tile-1');
  });
});
