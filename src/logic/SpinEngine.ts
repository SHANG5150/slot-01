import { REEL_STRIPS } from '../config/gameConfig';
import { SymbolId } from '../symbols/SymbolRegistry';
import { randomInt } from '../utils/math';

/**
 * Generates random spin outcomes from the reel strips
 * and provides scatter-counting utilities.
 */

/**
 * Generate a random outcome for a single spin.
 * For each of the 5 reels, picks a random stop position on the reel strip
 * and extracts 3 consecutive symbols (wrapping around the strip).
 *
 * @returns A 5-element array where each element is a 3-element array of SymbolIds
 *          representing the visible window (top, center, bottom).
 */
export function generateOutcome(): SymbolId[][] {
  const result: SymbolId[][] = [];

  for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
    const strip = REEL_STRIPS[reelIndex];
    const stopPosition = randomInt(0, strip.length - 1);

    const visibleSymbols: SymbolId[] = [];
    for (let row = 0; row < 3; row++) {
      const index = (stopPosition + row) % strip.length;
      visibleSymbols.push(strip[index]);
    }

    result.push(visibleSymbols);
  }

  return result;
}

/**
 * Count the total number of SCATTER symbols across the entire grid.
 *
 * @param result - The spin result grid (5 reels x 3 rows).
 * @returns The total scatter count.
 */
export function countScatters(result: SymbolId[][]): number {
  let count = 0;

  for (let reel = 0; reel < result.length; reel++) {
    for (let row = 0; row < result[reel].length; row++) {
      if (result[reel][row] === SymbolId.SCATTER) {
        count++;
      }
    }
  }

  return count;
}
