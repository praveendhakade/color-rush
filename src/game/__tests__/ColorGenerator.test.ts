import { ColorGenerator } from '../ColorGenerator';
import { SeededRandom } from '../random';

describe('ColorGenerator', () => {
  it('always includes the target tile', () => {
    const generator = new ColorGenerator(new SeededRandom(7));
    const target = generator.chooseTarget(4);
    const tiles = generator.generateTiles(target, 9, 4);
    expect(tiles).toHaveLength(9);
    expect(tiles.some((tile) => tile.color === target)).toBe(true);
    expect(tiles.some((tile) => tile.color !== target)).toBe(true);
  });

  it('is deterministic for a seeded random provider', () => {
    const first = new ColorGenerator(new SeededRandom(3));
    const second = new ColorGenerator(new SeededRandom(3));
    const target = first.chooseTarget(6);
    const matchingTarget = second.chooseTarget(6);
    expect(first.generateTiles(target, 4, 6)).toEqual(
      second.generateTiles(matchingTarget, 4, 6),
    );
  });

  it('rejects impossible rounds', () => {
    const generator = new ColorGenerator(new SeededRandom(1));
    expect(() => generator.generateTiles('red', 0, 4)).toThrow(
      'tileCount must be at least 1',
    );
    expect(() => generator.generateTiles('orange', 4, 4)).toThrow(
      'targetColor must be available',
    );
  });
});
