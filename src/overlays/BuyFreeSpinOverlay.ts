import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Overlay } from '../core/SceneManager';
import { bus } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { COLORS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/theme';
import { BUY_OPTIONS, FREE_SPIN_COUNT } from '../config/gameConfig';
import { formatCurrency } from '../utils/currency';

const OVERLAY_W = GAME_WIDTH;
const OVERLAY_H = GAME_HEIGHT;
const PADDING = 20;

export class BuyFreeSpinOverlay extends Overlay {
  constructor() {
    super();

    // Semi-transparent backdrop
    const bg = new Graphics();
    bg.rect(0, 0, OVERLAY_W, OVERLAY_H).fill({ color: COLORS.BG_PRIMARY, alpha: 0.92 });
    bg.eventMode = 'static'; // block clicks through
    this.addChild(bg);

    // Header bar
    const headerH = 48;
    const headerBg = new Graphics();
    headerBg.rect(0, 0, OVERLAY_W, headerH).fill({ color: COLORS.BG_SURFACE });
    this.addChild(headerBg);

    const title = new Text({
      text: 'BUY FREE SPINS',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 16,
        fontWeight: 'bold',
        fill: COLORS.ACCENT_MAGENTA,
        letterSpacing: 2,
      }),
    });
    title.anchor.set(0.5, 0.5);
    title.x = OVERLAY_W / 2;
    title.y = headerH / 2;
    this.addChild(title);

    // Close button
    const closeBtn = new Container();
    const closeBg = new Graphics();
    closeBg.circle(0, 0, 16).fill({ color: COLORS.BG_CONTROL });
    closeBtn.addChild(closeBg);

    const closeX = new Text({
      text: 'X',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 14,
        fontWeight: 'bold',
        fill: COLORS.TEXT_SECONDARY,
      }),
    });
    closeX.anchor.set(0.5);
    closeBtn.addChild(closeX);
    closeBtn.x = OVERLAY_W - 28;
    closeBtn.y = headerH / 2;
    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', () => bus.emit('overlay:close'));
    this.addChild(closeBtn);

    // Subtitle
    const subtitle = new Text({
      text: 'Skip the wait — jump straight into Free Spins!',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 10,
        fill: COLORS.TEXT_MUTED,
        wordWrap: true,
        wordWrapWidth: OVERLAY_W - PADDING * 2,
      }),
    });
    subtitle.anchor.set(0.5, 0);
    subtitle.x = OVERLAY_W / 2;
    subtitle.y = headerH + 24;
    this.addChild(subtitle);

    // Buy option cards
    const cardW = OVERLAY_W - PADDING * 2;
    const cardH = 140;
    const cardGap = 16;
    const startY = headerH + 60;

    for (let i = 0; i < BUY_OPTIONS.length; i++) {
      const opt = BUY_OPTIONS[i];
      const cardY = startY + i * (cardH + cardGap);
      const betSize = gameState.get('betSize');
      const cost = betSize * opt.costMultiplier;

      this.createOptionCard(PADDING, cardY, cardW, cardH, opt, cost, i);
    }

    // Disclaimer
    const disclaimer = new Text({
      text: 'Cost is based on current bet size.',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 8,
        fill: COLORS.TEXT_MUTED,
      }),
    });
    disclaimer.anchor.set(0.5, 0);
    disclaimer.x = OVERLAY_W / 2;
    disclaimer.y = startY + 2 * (cardH + cardGap) + 8;
    this.addChild(disclaimer);
  }

  private createOptionCard(
    x: number,
    y: number,
    w: number,
    h: number,
    opt: (typeof BUY_OPTIONS)[number],
    cost: number,
    index: number,
  ): void {
    const isFirst = index === 0;
    const accentColor = isFirst ? COLORS.ACCENT_CYAN : COLORS.ACCENT_MAGENTA;

    // Card background
    const card = new Graphics();
    card
      .roundRect(x, y, w, h, 14)
      .fill({ color: COLORS.BG_SURFACE })
      .roundRect(x, y, w, h, 14)
      .stroke({ color: accentColor, width: 1.5, alpha: 0.5 });
    this.addChild(card);

    // Option label
    const labelText = new Text({
      text: opt.label,
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 18,
        fontWeight: 'bold',
        fill: accentColor,
      }),
    });
    labelText.x = x + 16;
    labelText.y = y + 16;
    this.addChild(labelText);

    // Description
    const startMult = opt.startMultiplier;
    const descStr = startMult > 0
      ? `Start at ${['1x', '2x', '4x', '8x', '10x'][startMult]} multiplier`
      : 'Start at 1x multiplier';
    const desc = new Text({
      text: descStr,
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 10,
        fill: COLORS.TEXT_MUTED,
      }),
    });
    desc.x = x + 16;
    desc.y = y + 44;
    this.addChild(desc);

    // Multiplier trail preview
    const trailY = y + 66;
    const steps = ['1x', '2x', '4x', '8x', '10x'];
    const stepW = 50;
    const trailStartX = x + 16;
    for (let s = 0; s < steps.length; s++) {
      const isActive = s >= startMult;
      const stepBg = new Graphics();
      stepBg
        .roundRect(trailStartX + s * (stepW + 4), trailY, stepW, 22, 6)
        .fill({ color: isActive ? accentColor : COLORS.BG_CONTROL, alpha: isActive ? 0.2 : 0.5 })
        .roundRect(trailStartX + s * (stepW + 4), trailY, stepW, 22, 6)
        .stroke({ color: isActive ? accentColor : COLORS.BORDER_DEFAULT, width: 1, alpha: isActive ? 0.6 : 0.3 });
      this.addChild(stepBg);

      const stepText = new Text({
        text: steps[s],
        style: new TextStyle({
          fontFamily: FONTS.MONO,
          fontSize: 10,
          fontWeight: 'bold',
          fill: isActive ? accentColor : COLORS.TEXT_MUTED,
        }),
      });
      stepText.anchor.set(0.5);
      stepText.x = trailStartX + s * (stepW + 4) + stepW / 2;
      stepText.y = trailY + 11;
      this.addChild(stepText);
    }

    // Buy button
    const btnW = w - 32;
    const btnH = 36;
    const btnY = y + h - btnH - 12;
    const btn = new Container();

    const btnBg = new Graphics();
    btnBg
      .roundRect(0, 0, btnW, btnH, 18)
      .fill({ color: accentColor });
    btn.addChild(btnBg);

    const btnLabel = new Text({
      text: `BUY FOR ${formatCurrency(cost)}`,
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 13,
        fontWeight: 'bold',
        fill: COLORS.BG_PRIMARY,
      }),
    });
    btnLabel.anchor.set(0.5);
    btnLabel.x = btnW / 2;
    btnLabel.y = btnH / 2;
    btn.addChild(btnLabel);

    btn.x = x + 16;
    btn.y = btnY;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', () => {
      const balance = gameState.get('balance');
      if (balance >= cost) {
        gameState.set('balance', balance - cost);
        gameState.update({
          gameMode: 'freespin',
          freeSpinsRemaining: opt.spins,
          freeSpinsTotalWin: 0,
          multiplierStep: opt.startMultiplier,
        });
        bus.emit('overlay:close');
        bus.emit('freespin:trigger', 0);
      }
    });
    this.addChild(btn);
  }

  onOpen(): void {}
  onClose(): void {}
}
