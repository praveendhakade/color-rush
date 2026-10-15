import {
  COLOR_IDS,
  type ColorId,
  type RandomProvider,
  type Tile,
} from './types';
import { systemRandom } from './random';

const select = <T>(items: readonly T[], random: RandomProvider): T => {
  const index = Math.min(
    items.length - 1,
    Math.floor(random.next() * items.length),
  );
  return items[index]!;
};

const shuffle = <T>(items: T[], random: RandomProvider): T[] => {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random.next() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex]!, items[index]!];
  }
  return items;
};

export class ColorGenerator {
  constructor(private readonly random: RandomProvider = systemRandom) {}

  chooseTarget(colorCount: number): ColorId {
    return select(
      COLOR_IDS.slice(0, this.validateColorCount(colorCount)),
      this.random,
    );
  }

  generateTiles(
    targetColor: ColorId,
    tileCount: number,
    colorCount: number,
  ): Tile[] {
    if (tileCount < 1) throw new Error('tileCount must be at least 1');
    const colors = COLOR_IDS.slice(0, this.validateColorCount(colorCount));
    if (!colors.includes(targetColor))
      throw new Error('targetColor must be available');

    const colorsForTiles: ColorId[] = [targetColor];
    const decoyColors = colors.filter((color) => color !== targetColor);
    if (tileCount > 1 && decoyColors.length > 0) {
      colorsForTiles.push(select(decoyColors, this.random));
    }
    while (colorsForTiles.length < tileCount)
      colorsForTiles.push(select(colors, this.random));
    return shuffle(colorsForTiles, this.random).map((color, index) => ({
      id: `tile-${index}`,
      color,
    }));
  }

  private validateColorCount(colorCount: number): number {
    if (
      !Number.isInteger(colorCount) ||
      colorCount < 1 ||
      colorCount > COLOR_IDS.length
    ) {
      throw new Error(`colorCount must be between 1 and ${COLOR_IDS.length}`);
    }
    return colorCount;
  }
}
