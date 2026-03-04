import { Container, Graphics } from 'pixi.js';
import { SymbolId } from '../symbols/SymbolRegistry';
import { Reel } from './Reel';
import {
  COLORS,
  REEL_COLS,
  REEL_ROWS,
  CELL_GAP,
  REEL_PADDING,
  REEL_FRAME_RADIUS,
} from '../config/theme';

/**
 * The main reel grid container.
 * Contains 5 Reel columns inside a styled frame with a gradient border.
 * Handles coordinated spin animations and win highlighting.
 */
export class ReelGrid extends Container {
  private readonly reels: Reel[] = [];
  private readonly frame: Graphics;
  private readonly reelContainer: Container;
  private readonly maskGraphics: Graphics;
  private readonly gridWidth: number;
  private readonly gridHeight: number;
  private readonly cellWidth: number;
  private readonly cellHeight: number;

  constructor(width: number = 358) {
    super();

    this.gridWidth = width;

    // Calculate cell dimensions from available width
    // Total width = 5 * cellWidth + 4 * gap
    const innerWidth = width - REEL_PADDING * 2;
    this.cellWidth = Math.floor((innerWidth - (REEL_COLS - 1) * CELL_GAP) / REEL_COLS);
    this.cellHeight = Math.floor(this.cellWidth * 1.1); // Slightly taller than wide

    // Total grid height = 3 rows + 2 gaps + padding
    const innerHeight = REEL_ROWS * this.cellHeight + (REEL_ROWS - 1) * CELL_GAP;
    this.gridHeight = innerHeight + REEL_PADDING * 2;

    // Draw the frame background and border
    this.frame = new Graphics();
    this.drawFrame();
    this.addChild(this.frame);

    // Create the reel container (holds all 5 reels)
    this.reelContainer = new Container();
    this.reelContainer.x = REEL_PADDING;
    this.reelContainer.y = REEL_PADDING;
    this.addChild(this.reelContainer);

    // Create mask to hide overflow during spin animation
    this.maskGraphics = new Graphics();
    this.maskGraphics
      .roundRect(REEL_PADDING, REEL_PADDING, innerWidth, innerHeight, 8)
      .fill({ color: 0xffffff });
    this.addChild(this.maskGraphics);
    this.reelContainer.mask = this.maskGraphics;

    // Create 5 reel columns
    for (let col = 0; col < REEL_COLS; col++) {
      const reel = new Reel(col, this.cellWidth, this.cellHeight, CELL_GAP);
      reel.x = col * (this.cellWidth + CELL_GAP);
      reel.y = 0;
      this.reels.push(reel);
      this.reelContainer.addChild(reel);
    }
  }

  /**
   * Draw the frame: fill with BG_SURFACE color and a gradient-style border.
   * PixiJS v8 Graphics doesn't support true gradient strokes, so we
   * approximate with a layered approach.
   */
  private drawFrame(): void {
    this.frame.clear();

    // Outer border layer (cyan tint)
    this.frame
      .roundRect(-1, -1, this.gridWidth + 2, this.gridHeight + 2, REEL_FRAME_RADIUS + 1)
      .stroke({ color: COLORS.ACCENT_CYAN, width: 2, alpha: 0.4 });

    // Middle border layer (dark default)
    this.frame
      .roundRect(-0.5, -0.5, this.gridWidth + 1, this.gridHeight + 1, REEL_FRAME_RADIUS + 0.5)
      .stroke({ color: COLORS.BORDER_DEFAULT, width: 1, alpha: 0.6 });

    // Bottom-right accent (magenta tint)
    this.frame
      .roundRect(0, 0, this.gridWidth, this.gridHeight, REEL_FRAME_RADIUS)
      .stroke({ color: COLORS.ACCENT_MAGENTA, width: 1, alpha: 0.15 });

    // Background fill
    this.frame
      .roundRect(0, 0, this.gridWidth, this.gridHeight, REEL_FRAME_RADIUS)
      .fill({ color: COLORS.BG_SURFACE });
  }

  /**
   * Get the total height of the grid (including frame).
   */
  getGridHeight(): number {
    return this.gridHeight;
  }

  /**
   * Get a specific reel by index.
   */
  getReel(index: number): Reel {
    return this.reels[index];
  }

  /**
   * Trigger a coordinated spin across all 5 reels with staggered start times.
   *
   * @param result - The target grid: 5 reels x 3 symbols each.
   * @param quickSpin - If true, reduces stagger delay and animation durations.
   * @returns A promise that resolves when all reels have finished spinning.
   */
  async spin(result: SymbolId[][], quickSpin: boolean): Promise<void> {
    const staggerDelay = quickSpin ? 80 : 150;

    // Clear any existing highlights before spinning
    this.clearHighlights();

    // Launch all reel spins with staggered delays
    const spinPromises = this.reels.map((reel, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          reel.spin(result[index], quickSpin).then(resolve);
        }, index * staggerDelay);
      });
    });

    await Promise.all(spinPromises);
  }

  /**
   * Set symbols on all reels without animation (for initial display).
   *
   * @param grid - The grid: 5 reels x 3 symbols each.
   */
  setSymbols(grid: SymbolId[][]): void {
    for (let col = 0; col < REEL_COLS; col++) {
      if (col < grid.length) {
        this.reels[col].setSymbols(grid[col]);
      }
    }
  }

  /**
   * Highlight specific cell positions (for win display).
   *
   * @param positions - Array of [reelIndex, rowIndex] tuples to highlight.
   */
  highlightWinPositions(positions: [number, number][]): void {
    for (const [reelIndex, rowIndex] of positions) {
      if (reelIndex >= 0 && reelIndex < this.reels.length) {
        const cell = this.reels[reelIndex].getCell(rowIndex);
        if (cell) {
          cell.setHighlight(true);
        }
      }
    }
  }

  /**
   * Remove all cell highlights across the grid.
   */
  clearHighlights(): void {
    for (const reel of this.reels) {
      for (let row = 0; row < REEL_ROWS; row++) {
        reel.getCell(row).setHighlight(false);
      }
    }
  }
}
