import { SymbolId } from '../symbols/SymbolRegistry';

export const PAYOUTS: Record<string, { 5: number; 4: number; 3: number }> = {
  [SymbolId.LUCKY7]: { 5: 500, 4: 200, 3: 50 },
  [SymbolId.CROWN]: { 5: 300, 4: 100, 3: 30 },
  [SymbolId.STAR]: { 5: 150, 4: 60, 3: 20 },
  [SymbolId.DIAMOND]: { 5: 100, 4: 40, 3: 15 },
  [SymbolId.CHERRY]: { 5: 75, 4: 25, 3: 10 },
};

export const BET_LEVELS = [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0];
export const DEFAULT_BET_INDEX = 2; // 0.50

export const FREE_SPIN_SCATTER_COUNT = 3;
export const FREE_SPIN_COUNT = 10;
export const MULTIPLIER_STEPS = [1, 2, 4, 8, 10];

export const BUY_OPTIONS = [
  { spins: 10, startMultiplier: 0, costMultiplier: 50, label: '10 Free Spins' },
  { spins: 5, startMultiplier: 1, costMultiplier: 100, label: '5 Free Spins' },
];

// Reel strips - weighted symbol distribution per reel
const S = SymbolId;
export const REEL_STRIPS: SymbolId[][] = [
  [S.CHERRY, S.STAR, S.DIAMOND, S.LUCKY7, S.CHERRY, S.CROWN, S.STAR, S.CHERRY, S.DIAMOND, S.STAR, S.CHERRY, S.CROWN, S.DIAMOND, S.STAR, S.LUCKY7, S.CHERRY, S.STAR, S.DIAMOND, S.CROWN, S.CHERRY, S.SCATTER, S.STAR, S.DIAMOND, S.CHERRY, S.STAR, S.CROWN, S.CHERRY, S.DIAMOND, S.STAR, S.CHERRY],
  [S.STAR, S.CHERRY, S.CROWN, S.DIAMOND, S.STAR, S.CHERRY, S.LUCKY7, S.STAR, S.DIAMOND, S.CHERRY, S.CROWN, S.STAR, S.CHERRY, S.DIAMOND, S.STAR, S.CHERRY, S.CROWN, S.SCATTER, S.DIAMOND, S.STAR, S.CHERRY, S.STAR, S.DIAMOND, S.CROWN, S.CHERRY, S.STAR, S.LUCKY7, S.CHERRY, S.DIAMOND, S.STAR],
  [S.DIAMOND, S.STAR, S.CHERRY, S.CROWN, S.DIAMOND, S.LUCKY7, S.STAR, S.CHERRY, S.DIAMOND, S.CROWN, S.STAR, S.CHERRY, S.SCATTER, S.DIAMOND, S.STAR, S.CHERRY, S.CROWN, S.DIAMOND, S.STAR, S.CHERRY, S.DIAMOND, S.STAR, S.CROWN, S.CHERRY, S.DIAMOND, S.STAR, S.CHERRY, S.LUCKY7, S.CROWN, S.STAR],
  [S.CROWN, S.DIAMOND, S.STAR, S.CHERRY, S.CROWN, S.STAR, S.DIAMOND, S.CHERRY, S.LUCKY7, S.CROWN, S.STAR, S.DIAMOND, S.CHERRY, S.STAR, S.CROWN, S.SCATTER, S.DIAMOND, S.CHERRY, S.STAR, S.CROWN, S.DIAMOND, S.STAR, S.CHERRY, S.CROWN, S.DIAMOND, S.STAR, S.CHERRY, S.CROWN, S.LUCKY7, S.DIAMOND],
  [S.STAR, S.CROWN, S.CHERRY, S.DIAMOND, S.STAR, S.LUCKY7, S.CHERRY, S.CROWN, S.STAR, S.DIAMOND, S.CHERRY, S.STAR, S.CROWN, S.DIAMOND, S.CHERRY, S.STAR, S.SCATTER, S.CROWN, S.CHERRY, S.DIAMOND, S.STAR, S.CHERRY, S.CROWN, S.DIAMOND, S.STAR, S.CHERRY, S.LUCKY7, S.CROWN, S.DIAMOND, S.STAR],
];

// 20 payline patterns: each is [row for reel0, row for reel1, ..., row for reel4]
export const PAYLINE_PATTERNS: number[][] = [
  [1, 1, 1, 1, 1], // center straight
  [0, 0, 0, 0, 0], // top straight
  [2, 2, 2, 2, 2], // bottom straight
  [0, 1, 2, 1, 0], // V shape
  [2, 1, 0, 1, 2], // inverted V
  [0, 0, 1, 2, 2], // diagonal down
  [2, 2, 1, 0, 0], // diagonal up
  [1, 0, 0, 0, 1], // top dip
  [1, 2, 2, 2, 1], // bottom dip
  [0, 1, 1, 1, 0], // slight V
  [2, 1, 1, 1, 2], // slight inverted V
  [1, 0, 1, 0, 1], // zigzag up
  [1, 2, 1, 2, 1], // zigzag down
  [0, 1, 0, 1, 0], // top zigzag
  [2, 1, 2, 1, 2], // bottom zigzag
  [1, 1, 0, 1, 1], // top notch
  [1, 1, 2, 1, 1], // bottom notch
  [0, 0, 1, 0, 0], // top with center dip
  [2, 2, 1, 2, 2], // bottom with center raise
  [0, 2, 0, 2, 0], // wide zigzag
];
