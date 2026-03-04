import { Container, Graphics, Text, TextStyle, Sprite } from 'pixi.js';
import { Overlay } from '../core/SceneManager';
import { bus } from '../core/EventBus';
import { COLORS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/theme';
import { PAYOUTS, PAYLINE_PATTERNS, FREE_SPIN_SCATTER_COUNT } from '../config/gameConfig';
import { SymbolId, SYMBOLS } from '../symbols/SymbolRegistry';
import { getSymbolTexture } from '../symbols/SymbolRenderer';

const OVERLAY_W = GAME_WIDTH;
const OVERLAY_H = GAME_HEIGHT;
const PADDING = 16;
const CONTENT_W = OVERLAY_W - PADDING * 2;

export class PayTableOverlay extends Overlay {
  private scrollContainer: Container;
  private scrollMask: Graphics;
  private contentHeight = 0;
  private scrollY = 0;
  private isDragging = false;
  private lastPointerY = 0;

  constructor() {
    super();

    // Dark background
    const bg = new Graphics();
    bg.rect(0, 0, OVERLAY_W, OVERLAY_H).fill({ color: COLORS.BG_PRIMARY, alpha: 0.95 });
    this.addChild(bg);

    // Header bar
    const headerH = 48;
    const headerBg = new Graphics();
    headerBg
      .rect(0, 0, OVERLAY_W, headerH)
      .fill({ color: COLORS.BG_SURFACE });
    this.addChild(headerBg);

    const title = new Text({
      text: 'PAY TABLE',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 16,
        fontWeight: 'bold',
        fill: COLORS.ACCENT_CYAN,
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

    // Scrollable content area
    const scrollAreaY = headerH + 8;
    const scrollAreaH = OVERLAY_H - scrollAreaY;

    this.scrollMask = new Graphics();
    this.scrollMask
      .rect(0, scrollAreaY, OVERLAY_W, scrollAreaH)
      .fill({ color: 0xffffff });
    this.addChild(this.scrollMask);

    this.scrollContainer = new Container();
    this.scrollContainer.y = scrollAreaY;
    this.scrollContainer.mask = this.scrollMask;
    this.addChild(this.scrollContainer);

    // Build content
    let cy = 8;
    cy = this.buildSymbolPayouts(cy);
    cy = this.buildPaylineInfo(cy);
    cy = this.buildScatterInfo(cy);
    cy = this.buildGameRules(cy);
    this.contentHeight = cy + 20;

    // Scroll interaction on the background
    bg.eventMode = 'static';
    bg.on('pointerdown', (e) => {
      this.isDragging = true;
      this.lastPointerY = e.globalY;
    });
    bg.on('pointermove', (e) => {
      if (!this.isDragging) return;
      const dy = e.globalY - this.lastPointerY;
      this.lastPointerY = e.globalY;
      this.doScroll(dy);
    });
    bg.on('pointerup', () => (this.isDragging = false));
    bg.on('pointerupoutside', () => (this.isDragging = false));
    bg.on('wheel', (e: any) => {
      if (e.deltaY !== undefined) {
        this.doScroll(-e.deltaY * 0.5);
      }
    });
  }

  private doScroll(dy: number): void {
    const scrollAreaH = OVERLAY_H - (48 + 8);
    const maxScroll = Math.max(0, this.contentHeight - scrollAreaH);
    this.scrollY = Math.min(0, Math.max(-maxScroll, this.scrollY + dy));
    this.scrollContainer.y = (48 + 8) + this.scrollY;
  }

  private buildSymbolPayouts(startY: number): number {
    let cy = startY;

    const sectionTitle = new Text({
      text: 'SYMBOL PAYOUTS',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 12,
        fontWeight: 'bold',
        fill: COLORS.ACCENT_MAGENTA,
        letterSpacing: 1,
      }),
    });
    sectionTitle.x = PADDING;
    sectionTitle.y = cy;
    this.scrollContainer.addChild(sectionTitle);
    cy += 24;

    // Grid of symbol payout cards: 2 columns
    const cardW = (CONTENT_W - 8) / 2;
    const cardH = 72;
    const symbolIds = [
      SymbolId.LUCKY7,
      SymbolId.CROWN,
      SymbolId.STAR,
      SymbolId.DIAMOND,
      SymbolId.CHERRY,
    ];

    for (let i = 0; i < symbolIds.length; i++) {
      const sid = symbolIds[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = PADDING + col * (cardW + 8);
      const cardY = cy + row * (cardH + 6);

      const card = new Graphics();
      card
        .roundRect(cx, cardY, cardW, cardH, 10)
        .fill({ color: COLORS.BG_SURFACE })
        .roundRect(cx, cardY, cardW, cardH, 10)
        .stroke({ color: COLORS.BORDER_DEFAULT, width: 1 });
      this.scrollContainer.addChild(card);

      // Symbol icon
      const tex = getSymbolTexture(sid);
      const sprite = new Sprite(tex);
      sprite.width = 36;
      sprite.height = 36;
      sprite.x = cx + 8;
      sprite.y = cardY + (cardH - 36) / 2;
      this.scrollContainer.addChild(sprite);

      // Symbol name
      const info = SYMBOLS[sid];
      const nameText = new Text({
        text: info.name,
        style: new TextStyle({
          fontFamily: FONTS.MONO,
          fontSize: 10,
          fontWeight: 'bold',
          fill: COLORS.TEXT_PRIMARY,
        }),
      });
      nameText.x = cx + 50;
      nameText.y = cardY + 8;
      this.scrollContainer.addChild(nameText);

      // Payout values
      const payouts = PAYOUTS[sid];
      if (payouts) {
        const payText = new Text({
          text: `x5: ${payouts[5]}  x4: ${payouts[4]}  x3: ${payouts[3]}`,
          style: new TextStyle({
            fontFamily: FONTS.MONO,
            fontSize: 8,
            fill: COLORS.ACCENT_GOLD,
          }),
        });
        payText.x = cx + 50;
        payText.y = cardY + 28;
        this.scrollContainer.addChild(payText);

        // Visual payout bar
        const barY = cardY + 46;
        const maxPayout = payouts[5];
        for (const [count, value] of [[5, payouts[5]], [4, payouts[4]], [3, payouts[3]]] as const) {
          const barW = (value / maxPayout) * (cardW - 58);
          const barBg = new Graphics();
          const barOffset = count === 5 ? 0 : count === 4 ? 8 : 16;
          barBg
            .roundRect(cx + 50, barY + barOffset, barW, 6, 3)
            .fill({ color: count === 5 ? COLORS.ACCENT_CYAN : count === 4 ? COLORS.ACCENT_PURPLE : COLORS.ACCENT_MAGENTA, alpha: 0.6 });
          this.scrollContainer.addChild(barBg);
        }
      }
    }

    const totalRows = Math.ceil(symbolIds.length / 2);
    cy += totalRows * (cardH + 6) + 16;
    return cy;
  }

  private buildPaylineInfo(startY: number): number {
    let cy = startY;

    const sectionTitle = new Text({
      text: 'PAYLINES (20 Lines)',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 12,
        fontWeight: 'bold',
        fill: COLORS.ACCENT_MAGENTA,
        letterSpacing: 1,
      }),
    });
    sectionTitle.x = PADDING;
    sectionTitle.y = cy;
    this.scrollContainer.addChild(sectionTitle);
    cy += 22;

    const desc = new Text({
      text: 'All wins pay left to right on adjacent reels.\nPayline wins are multiplied by bet per line.',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 9,
        fill: COLORS.TEXT_MUTED,
        wordWrap: true,
        wordWrapWidth: CONTENT_W,
        lineHeight: 14,
      }),
    });
    desc.x = PADDING;
    desc.y = cy;
    this.scrollContainer.addChild(desc);
    cy += 36;

    // Draw payline mini-grids (5 per row)
    const miniW = 50;
    const miniH = 24;
    const miniGap = 6;
    const colsPerRow = 5;

    for (let i = 0; i < PAYLINE_PATTERNS.length; i++) {
      const pattern = PAYLINE_PATTERNS[i];
      const col = i % colsPerRow;
      const row = Math.floor(i / colsPerRow);
      const mx = PADDING + col * (miniW + miniGap);
      const my = cy + row * (miniH + 18);

      // Line number
      const numText = new Text({
        text: `#${i + 1}`,
        style: new TextStyle({
          fontFamily: FONTS.MONO,
          fontSize: 7,
          fill: COLORS.TEXT_MUTED,
        }),
      });
      numText.x = mx + miniW / 2 - 4;
      numText.y = my;
      this.scrollContainer.addChild(numText);

      // Mini 5x3 grid
      const gridY = my + 10;
      const cellS = 8;
      const cellGap = 2;

      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 3; c++) {
          const isActive = pattern[r] === c;
          const cellGraphic = new Graphics();
          cellGraphic
            .roundRect(
              mx + r * (cellS + cellGap),
              gridY + c * (cellS + cellGap),
              cellS,
              cellS,
              2,
            )
            .fill({ color: isActive ? COLORS.ACCENT_CYAN : COLORS.BG_SURFACE, alpha: isActive ? 0.8 : 0.3 });
          this.scrollContainer.addChild(cellGraphic);
        }
      }
    }

    const totalMiniRows = Math.ceil(PAYLINE_PATTERNS.length / colsPerRow);
    cy += totalMiniRows * (miniH + 18) + 16;
    return cy;
  }

  private buildScatterInfo(startY: number): number {
    let cy = startY;

    const sectionTitle = new Text({
      text: 'SCATTER & FREE SPINS',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 12,
        fontWeight: 'bold',
        fill: COLORS.ACCENT_MAGENTA,
        letterSpacing: 1,
      }),
    });
    sectionTitle.x = PADDING;
    sectionTitle.y = cy;
    this.scrollContainer.addChild(sectionTitle);
    cy += 24;

    // Scatter card
    const card = new Graphics();
    card
      .roundRect(PADDING, cy, CONTENT_W, 70, 10)
      .fill({ color: COLORS.BG_SURFACE })
      .roundRect(PADDING, cy, CONTENT_W, 70, 10)
      .stroke({ color: COLORS.ACCENT_PURPLE, width: 1, alpha: 0.5 });
    this.scrollContainer.addChild(card);

    const scatterTex = getSymbolTexture(SymbolId.SCATTER);
    const scatterSprite = new Sprite(scatterTex);
    scatterSprite.width = 40;
    scatterSprite.height = 40;
    scatterSprite.x = PADDING + 12;
    scatterSprite.y = cy + 15;
    this.scrollContainer.addChild(scatterSprite);

    const scatterText = new Text({
      text: `${FREE_SPIN_SCATTER_COUNT}+ Scatter symbols trigger 10 Free Spins!\nScatters pay on any position.\nMultiplier trail: 1x > 2x > 4x > 8x > 10x`,
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 9,
        fill: COLORS.TEXT_PRIMARY,
        wordWrap: true,
        wordWrapWidth: CONTENT_W - 72,
        lineHeight: 16,
      }),
    });
    scatterText.x = PADDING + 60;
    scatterText.y = cy + 10;
    this.scrollContainer.addChild(scatterText);

    cy += 86;
    return cy;
  }

  private buildGameRules(startY: number): number {
    let cy = startY;

    const sectionTitle = new Text({
      text: 'GAME RULES',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 12,
        fontWeight: 'bold',
        fill: COLORS.ACCENT_MAGENTA,
        letterSpacing: 1,
      }),
    });
    sectionTitle.x = PADDING;
    sectionTitle.y = cy;
    this.scrollContainer.addChild(sectionTitle);
    cy += 22;

    const rules = [
      '20 fixed paylines, all always active.',
      'Wins pay left to right on adjacent reels only.',
      'Highest win per payline is paid.',
      'Scatter wins are independent of paylines.',
      'Free Spins cannot be retriggered during Free Spins.',
      'Multiplier increases every 2 spins during Free Spins.',
      'All wins during Free Spins are multiplied by the current multiplier.',
      'Malfunction voids all pays and plays.',
    ];

    for (const rule of rules) {
      const bullet = new Text({
        text: `  ${rule}`,
        style: new TextStyle({
          fontFamily: FONTS.MONO,
          fontSize: 9,
          fill: COLORS.TEXT_MUTED,
          wordWrap: true,
          wordWrapWidth: CONTENT_W - 16,
          lineHeight: 14,
        }),
      });
      bullet.x = PADDING;
      bullet.y = cy;
      this.scrollContainer.addChild(bullet);
      cy += bullet.height + 6;
    }

    cy += 16;
    return cy;
  }

  onOpen(): void {}
  onClose(): void {}
}
