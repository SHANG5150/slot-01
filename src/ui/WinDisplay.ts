import { Container, Text, TextStyle } from 'pixi.js';
import { COLORS, FONTS, GAME_WIDTH } from '../config/theme';
import { formatCurrency } from '../utils/currency';
import gsap from 'gsap';

const DISPLAY_W = GAME_WIDTH; // 390
const DISPLAY_H = 48;

export class WinDisplay extends Container {
  private labelText: Text;
  private amountText: Text;
  private currentValue = 0;

  constructor() {
    super();

    const labelStyle = new TextStyle({
      fontFamily: FONTS.MONO,
      fontSize: 12,
      fill: COLORS.TEXT_MUTED,
    });
    this.labelText = new Text({ text: 'WIN', style: labelStyle });
    this.labelText.anchor.set(0.5, 0);
    this.labelText.x = DISPLAY_W / 2;
    this.labelText.y = 2;
    this.addChild(this.labelText);

    const amountStyle = new TextStyle({
      fontFamily: FONTS.MONO,
      fontSize: 28,
      fontWeight: '800',
      fill: COLORS.ACCENT_GOLD,
    });
    this.amountText = new Text({ text: '$0.00', style: amountStyle });
    this.amountText.anchor.set(0.5, 0);
    this.amountText.x = DISPLAY_W / 2;
    this.amountText.y = 16;
    this.addChild(this.amountText);
  }

  setAmount(value: number): void {
    this.currentValue = value;
    this.amountText.text = formatCurrency(value);
  }

  async animateWin(target: number): Promise<void> {
    const proxy = { value: 0 };
    this.currentValue = 0;
    this.amountText.text = formatCurrency(0);

    return new Promise<void>((resolve) => {
      gsap.to(proxy, {
        value: target,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          this.currentValue = proxy.value;
          this.amountText.text = formatCurrency(proxy.value);
        },
        onComplete: () => {
          this.currentValue = target;
          this.amountText.text = formatCurrency(target);
          resolve();
        },
      });
    });
  }
}
