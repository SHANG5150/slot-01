import { Container, Graphics, Sprite } from 'pixi.js';
import { SymbolId } from '../symbols/SymbolRegistry';
import { getSymbolTexture } from '../symbols/SymbolRenderer';
import { COLORS } from '../config/theme';

/**
 * A PixiJS Container that displays a single reel cell.
 * Contains a rounded-rect background and a sprite for the symbol texture.
 */
export class ReelSymbol extends Container {
  private readonly cellWidth: number;
  private readonly cellHeight: number;
  private readonly background: Graphics;
  private readonly symbolSprite: Sprite;
  private readonly highlightBorder: Graphics;
  private currentSymbolId: SymbolId | null = null;

  constructor(cellWidth: number, cellHeight: number) {
    super();

    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;

    // Rounded rect background
    this.background = new Graphics();
    this.background
      .roundRect(0, 0, cellWidth, cellHeight, 12)
      .fill({ color: COLORS.BG_CELL });
    this.addChild(this.background);

    // Symbol sprite (centered in the cell)
    this.symbolSprite = new Sprite();
    this.symbolSprite.width = cellWidth;
    this.symbolSprite.height = cellHeight;
    this.symbolSprite.x = 0;
    this.symbolSprite.y = 0;
    this.addChild(this.symbolSprite);

    // Highlight border (initially hidden)
    this.highlightBorder = new Graphics();
    this.highlightBorder.visible = false;
    this.addChild(this.highlightBorder);
  }

  /**
   * Change the displayed symbol by updating the sprite texture.
   *
   * @param id - The SymbolId to display.
   */
  setSymbol(id: SymbolId): void {
    this.currentSymbolId = id;
    const texture = getSymbolTexture(id);
    this.symbolSprite.texture = texture;
    this.symbolSprite.width = this.cellWidth;
    this.symbolSprite.height = this.cellHeight;
  }

  /**
   * Add or remove a cyan stroke border highlight around this cell.
   *
   * @param on - Whether to show (true) or hide (false) the highlight.
   */
  setHighlight(on: boolean): void {
    this.highlightBorder.visible = on;

    if (on) {
      this.highlightBorder.clear();
      this.highlightBorder
        .roundRect(0, 0, this.cellWidth, this.cellHeight, 12)
        .stroke({ color: COLORS.ACCENT_CYAN, width: 2, alpha: 0.5 });
    }
  }

  /**
   * Get the currently displayed symbol ID.
   */
  getSymbolId(): SymbolId | null {
    return this.currentSymbolId;
  }
}
