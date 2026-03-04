import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { COLORS, FONTS, GAME_WIDTH } from '../config/theme';
import { formatCurrency, formatCoins } from '../utils/currency';

const HEADER_W = GAME_WIDTH; // 390
const HEADER_H = 44;

export class Header extends Container {
  private coinsText: Text;
  private balanceText: Text;

  constructor() {
    super();

    // --- gradient background ---
    const bg = new Graphics();
    // Approximate gradient with two halves (#0A0828 -> #06060E)
    const steps = 16;
    const sliceW = HEADER_W / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(0x0a + (0x06 - 0x0a) * t);
      const g = Math.round(0x08 + (0x06 - 0x08) * t);
      const b = Math.round(0x28 + (0x0e - 0x28) * t);
      const color = (r << 16) | (g << 8) | b;
      bg.rect(i * sliceW, 0, sliceW + 1, HEADER_H).fill({ color });
    }
    this.addChild(bg);

    // --- left: diamond icon + MEGA SLOTS ---
    const diamond = new Graphics();
    const dx = 16;
    const dy = HEADER_H / 2;
    const dr = 8;
    diamond
      .poly([dx, dy - dr, dx + dr * 0.65, dy, dx, dy + dr, dx - dr * 0.65, dy])
      .fill({ color: COLORS.ACCENT_CYAN });
    this.addChild(diamond);

    const titleStyle = new TextStyle({
      fontFamily: FONTS.DISPLAY,
      fontSize: 13,
      fontWeight: '800',
      fill: COLORS.ACCENT_CYAN,
      letterSpacing: 1,
    });
    const title = new Text({ text: 'MEGA SLOTS', style: titleStyle });
    title.x = 30;
    title.y = (HEADER_H - title.height) / 2;
    this.addChild(title);

    // --- right: pill badges ---
    const pillH = 26;
    const pillRadius = 8;
    const pillGap = 6;
    const rightMargin = 10;

    // Balance pill (rightmost)
    const balancePillW = 100;
    const balancePillX = HEADER_W - rightMargin - balancePillW;
    const balancePillY = (HEADER_H - pillH) / 2;

    const balancePill = new Graphics();
    balancePill
      .roundRect(balancePillX, balancePillY, balancePillW, pillH, pillRadius)
      .fill({ color: COLORS.BG_CONTROL })
      .roundRect(balancePillX, balancePillY, balancePillW, pillH, pillRadius)
      .stroke({ color: COLORS.BORDER_DEFAULT, width: 1 });
    this.addChild(balancePill);

    // Wallet icon (simple rectangle with flap)
    const walletIcon = new Graphics();
    const wix = balancePillX + 10;
    const wiy = balancePillY + pillH / 2;
    walletIcon
      .roundRect(wix - 5, wiy - 5, 10, 10, 2)
      .stroke({ color: COLORS.ACCENT_CYAN, width: 1.5 })
      .rect(wix + 2, wiy - 2, 4, 4)
      .fill({ color: COLORS.ACCENT_CYAN });
    this.addChild(walletIcon);

    const balanceStyle = new TextStyle({
      fontFamily: FONTS.MONO,
      fontSize: 11,
      fontWeight: 'bold',
      fill: COLORS.ACCENT_CYAN,
    });
    this.balanceText = new Text({ text: '$1,250.00', style: balanceStyle });
    this.balanceText.x = balancePillX + 24;
    this.balanceText.y = balancePillY + (pillH - this.balanceText.height) / 2;
    this.addChild(this.balanceText);

    // Coins pill (to the left of balance)
    const coinsPillW = 90;
    const coinsPillX = balancePillX - pillGap - coinsPillW;
    const coinsPillY = balancePillY;

    const coinsPill = new Graphics();
    coinsPill
      .roundRect(coinsPillX, coinsPillY, coinsPillW, pillH, pillRadius)
      .fill({ color: COLORS.BG_CONTROL })
      .roundRect(coinsPillX, coinsPillY, coinsPillW, pillH, pillRadius)
      .stroke({ color: COLORS.BORDER_DEFAULT, width: 1 });
    this.addChild(coinsPill);

    // Coin icon (small yellow circle)
    const coinIcon = new Graphics();
    const cix = coinsPillX + 12;
    const ciy = coinsPillY + pillH / 2;
    coinIcon
      .circle(cix, ciy, 5)
      .fill({ color: COLORS.ACCENT_GOLD })
      .circle(cix, ciy, 3)
      .stroke({ color: 0xccaa00, width: 1 });
    this.addChild(coinIcon);

    const coinsStyle = new TextStyle({
      fontFamily: FONTS.MONO,
      fontSize: 11,
      fontWeight: 'bold',
      fill: COLORS.ACCENT_MAGENTA,
    });
    this.coinsText = new Text({ text: '12,500', style: coinsStyle });
    this.coinsText.x = coinsPillX + 22;
    this.coinsText.y = coinsPillY + (pillH - this.coinsText.height) / 2;
    this.addChild(this.coinsText);
  }

  updateBalance(value: number): void {
    this.balanceText.text = formatCurrency(value);
  }

  updateCoins(value: number): void {
    this.coinsText.text = formatCoins(value);
  }
}
