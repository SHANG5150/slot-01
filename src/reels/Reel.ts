import { Container } from 'pixi.js';
import gsap from 'gsap';
import { SymbolId, ALL_SYMBOL_IDS, REGULAR_SYMBOL_IDS } from '../symbols/SymbolRegistry';
import { ReelSymbol } from './ReelSymbol';
import { randomInt } from '../utils/math';

/**
 * A PixiJS Container representing one reel column with 3 visible cells.
 * Handles symbol display and spin animation via GSAP.
 */
export class Reel extends Container {
  readonly reelIndex: number;
  private readonly cellWidth: number;
  private readonly cellHeight: number;
  private readonly gap: number;
  private readonly cells: ReelSymbol[] = [];

  constructor(reelIndex: number, cellWidth: number, cellHeight: number, gap: number) {
    super();

    this.reelIndex = reelIndex;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.gap = gap;

    // Create 3 ReelSymbol instances arranged vertically
    for (let row = 0; row < 3; row++) {
      const cell = new ReelSymbol(cellWidth, cellHeight);
      cell.x = 0;
      cell.y = row * (cellHeight + gap);
      this.cells.push(cell);
      this.addChild(cell);
    }
  }

  /**
   * Set the 3 visible symbols for this reel column.
   *
   * @param symbols - Array of 3 SymbolIds (top, center, bottom).
   */
  setSymbols(symbols: SymbolId[]): void {
    for (let row = 0; row < 3; row++) {
      if (row < symbols.length) {
        this.cells[row].setSymbol(symbols[row]);
      }
    }
  }

  /**
   * Get the ReelSymbol cell at the given row index.
   */
  getCell(row: number): ReelSymbol {
    return this.cells[row];
  }

  /**
   * Animate a spin sequence with GSAP:
   *   Phase 1: Wind-up (shift up 15px over 0.1s)
   *   Phase 2: Rapid symbol cycling (swap textures for effect)
   *   Phase 3: Set targets, bounce down 12px and spring back
   *
   * @param targetSymbols - The 3 SymbolIds to land on.
   * @param quickSpin - If true, halves all animation durations.
   */
  async spin(targetSymbols: SymbolId[], quickSpin: boolean): Promise<void> {
    const speedMultiplier = quickSpin ? 0.5 : 1;

    // Store original Y position
    const originalY = this.y;

    // Phase 1: Wind-up - shift the entire reel up
    await gsap.to(this, {
      y: originalY - 15,
      duration: 0.1 * speedMultiplier,
      ease: 'power2.in',
    });

    // Phase 2: Rapid symbol cycling
    const cycleCount = quickSpin ? 6 : 12;
    const cycleInterval = (quickSpin ? 30 : 50);
    const allSymbols = REGULAR_SYMBOL_IDS;

    await new Promise<void>((resolve) => {
      let cycles = 0;
      const intervalId = setInterval(() => {
        // Swap each cell to a random symbol for the cycling effect
        for (let row = 0; row < 3; row++) {
          const randomSymbol = allSymbols[randomInt(0, allSymbols.length - 1)];
          this.cells[row].setSymbol(randomSymbol);
        }

        cycles++;
        if (cycles >= cycleCount) {
          clearInterval(intervalId);
          resolve();
        }
      }, cycleInterval);
    });

    // Phase 3: Set target symbols and bounce
    // Set the final symbols
    this.setSymbols(targetSymbols);

    // Bounce down past the original position
    await gsap.to(this, {
      y: originalY + 12,
      duration: 0.1 * speedMultiplier,
      ease: 'power2.out',
    });

    // Spring back to original position
    await gsap.to(this, {
      y: originalY,
      duration: 0.15 * speedMultiplier,
      ease: 'back.out(2)',
    });
  }
}
