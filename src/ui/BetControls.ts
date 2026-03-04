import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { COLORS, FONTS } from '../config/theme';
import { BET_LEVELS } from '../config/gameConfig';
import { gameState } from '../core/GameState';
import { formatCurrency } from '../utils/currency';

const BUTTON_SIZE = 32;
const BUTTON_RADIUS = BUTTON_SIZE / 2;

export class BetControls extends Container {
  private betText: Text;
  private betIndex: number;
  private minusBtn: Container;
  private plusBtn: Container;

  constructor() {
    super();

    // Find the current bet index from gameState
    const currentBet = gameState.get('betSize');
    this.betIndex = BET_LEVELS.indexOf(currentBet);
    if (this.betIndex === -1) this.betIndex = 2; // default to 0.50

    // --- BET label ---
    const labelStyle = new TextStyle({
      fontFamily: FONTS.MONO,
      fontSize: 10,
      fill: COLORS.TEXT_MUTED,
    });
    const label = new Text({ text: 'BET', style: labelStyle });
    label.anchor.set(0.5, 0);
    label.x = 40; // center of the row
    label.y = 0;
    this.addChild(label);

    // --- Row: minus | amount | plus ---
    const rowY = 18;

    // Minus button
    this.minusBtn = this.createCircleButton('-', 0, rowY);
    this.addChild(this.minusBtn);

    // Bet amount text
    const betStyle = new TextStyle({
      fontFamily: FONTS.MONO,
      fontSize: 16,
      fontWeight: 'bold',
      fill: COLORS.TEXT_PRIMARY,
    });
    this.betText = new Text({
      text: formatCurrency(BET_LEVELS[this.betIndex]),
      style: betStyle,
    });
    this.betText.anchor.set(0.5, 0.5);
    this.betText.x = 40;
    this.betText.y = rowY + BUTTON_RADIUS;
    this.addChild(this.betText);

    // Plus button
    this.plusBtn = this.createCircleButton('+', 80 - BUTTON_SIZE, rowY);
    this.addChild(this.plusBtn);

    // Wire up events
    this.minusBtn.on('pointerdown', () => this.decreaseBet());
    this.plusBtn.on('pointerdown', () => this.increaseBet());
  }

  private createCircleButton(symbol: string, x: number, y: number): Container {
    const btn = new Container();
    btn.x = x;
    btn.y = y;

    const bg = new Graphics();
    bg.circle(BUTTON_RADIUS, BUTTON_RADIUS, BUTTON_RADIUS)
      .fill({ color: COLORS.BG_CONTROL });
    btn.addChild(bg);

    const iconStyle = new TextStyle({
      fontFamily: FONTS.MONO,
      fontSize: 16,
      fontWeight: 'bold',
      fill: COLORS.TEXT_SECONDARY,
    });
    const iconText = new Text({ text: symbol, style: iconStyle });
    iconText.anchor.set(0.5);
    iconText.x = BUTTON_RADIUS;
    iconText.y = BUTTON_RADIUS;
    btn.addChild(iconText);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.hitArea = {
      contains: (px: number, py: number) => {
        const dx = px - BUTTON_RADIUS;
        const dy = py - BUTTON_RADIUS;
        return dx * dx + dy * dy <= BUTTON_RADIUS * BUTTON_RADIUS;
      },
    };

    return btn;
  }

  increaseBet(): void {
    if (this.betIndex < BET_LEVELS.length - 1) {
      this.betIndex++;
      this.applyBet();
    }
  }

  decreaseBet(): void {
    if (this.betIndex > 0) {
      this.betIndex--;
      this.applyBet();
    }
  }

  private applyBet(): void {
    const newBet = BET_LEVELS[this.betIndex];
    gameState.set('betSize', newBet);
    this.updateDisplay();
  }

  private updateDisplay(): void {
    this.betText.text = formatCurrency(BET_LEVELS[this.betIndex]);
  }
}
