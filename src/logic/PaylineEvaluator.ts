import { PAYLINE_PATTERNS, PAYOUTS } from '../config/gameConfig';
import { SymbolId } from '../symbols/SymbolRegistry';

/**
 * Represents a single winning payline result.
 */
export interface WinLine {
  /** Index of the payline pattern (0-19). */
  paylineIndex: number;
  /** The symbol that formed the winning combination. */
  symbolId: SymbolId;
  /** Number of consecutive matching symbols from the left (3, 4, or 5). */
  count: number;
  /** The payout amount (base payout * betSize). */
  payout: number;
  /** Grid positions [reelIndex, rowIndex] that are part of this win. */
  positions: [number, number][];
}

/**
 * Evaluate all 20 paylines against the current grid and return winning lines.
 *
 * @param grid - The spin result: a 5-element array (one per reel),
 *               each containing 3 SymbolIds (top, center, bottom rows).
 * @param betSize - The current bet amount to multiply payouts by.
 * @returns An array of all winning lines found.
 */
export function evaluateWins(grid: SymbolId[][], betSize: number): WinLine[] {
  const winLines: WinLine[] = [];

  for (let paylineIndex = 0; paylineIndex < PAYLINE_PATTERNS.length; paylineIndex++) {
    const pattern = PAYLINE_PATTERNS[paylineIndex];

    // Get the symbol on the first reel for this payline
    const firstRow = pattern[0];
    const firstSymbol = grid[0][firstRow];

    // Scatters don't count on paylines - they are evaluated separately
    if (firstSymbol === SymbolId.SCATTER) {
      continue;
    }

    // Count consecutive matching symbols from left to right
    let matchCount = 1;
    const positions: [number, number][] = [[0, firstRow]];

    for (let reelIndex = 1; reelIndex < 5; reelIndex++) {
      const row = pattern[reelIndex];
      const symbol = grid[reelIndex][row];

      if (symbol === firstSymbol) {
        matchCount++;
        positions.push([reelIndex, row]);
      } else {
        break;
      }
    }

    // Need at least 3 matching symbols for a win
    if (matchCount >= 3) {
      const payoutKey = matchCount as 3 | 4 | 5;
      const payoutTable = PAYOUTS[firstSymbol];

      if (payoutTable) {
        const basePayout = payoutTable[payoutKey];
        const payout = basePayout * betSize;

        winLines.push({
          paylineIndex,
          symbolId: firstSymbol,
          count: matchCount,
          payout,
          positions,
        });
      }
    }
  }

  return winLines;
}
