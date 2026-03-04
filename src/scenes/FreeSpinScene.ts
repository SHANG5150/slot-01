import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { Scene } from '../core/SceneManager';
import type { SceneManager } from '../core/SceneManager';
import { bus } from '../core/EventBus';
import { gameState } from '../core/GameState';
import {
  COLORS,
  FONTS,
  GAME_WIDTH,
  GAME_HEIGHT,
} from '../config/theme';
import { MULTIPLIER_STEPS } from '../config/gameConfig';
import { ReelGrid } from '../reels/ReelGrid';
import { generateOutcome } from '../logic/SpinEngine';
import { evaluateWins, WinLine } from '../logic/PaylineEvaluator';
import { formatCurrency } from '../utils/currency';

// ---------------------------------------------------------------------------
// MultiplierTrail — shows 1x 2x 4x 8x 10x progress
// ---------------------------------------------------------------------------
class MultiplierTrail extends Container {
  private steps: Container[] = [];
  private stepBgs: Graphics[] = [];
  private stepTexts: Text[] = [];

  constructor() {
    super();

    const stepW = 58;
    const stepH = 28;
    const gap = 8;
    const totalW = MULTIPLIER_STEPS.length * stepW + (MULTIPLIER_STEPS.length - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2;

    for (let i = 0; i < MULTIPLIER_STEPS.length; i++) {
      const step = new Container();
      step.x = startX + i * (stepW + gap);
      step.y = 0;

      const bg = new Graphics();
      bg.roundRect(0, 0, stepW, stepH, 8)
        .fill({ color: COLORS.BG_CONTROL })
        .roundRect(0, 0, stepW, stepH, 8)
        .stroke({ color: COLORS.BORDER_DEFAULT, width: 1 });
      step.addChild(bg);

      const label = new Text({
        text: `${MULTIPLIER_STEPS[i]}x`,
        style: new TextStyle({
          fontFamily: FONTS.MONO,
          fontSize: 12,
          fontWeight: 'bold',
          fill: COLORS.TEXT_MUTED,
        }),
      });
      label.anchor.set(0.5);
      label.x = stepW / 2;
      label.y = stepH / 2;
      step.addChild(label);

      this.addChild(step);
      this.steps.push(step);
      this.stepBgs.push(bg);
      this.stepTexts.push(label);
    }
  }

  setActiveStep(stepIndex: number): void {
    const stepW = 58;
    const stepH = 28;

    for (let i = 0; i < MULTIPLIER_STEPS.length; i++) {
      this.stepBgs[i].clear();

      if (i <= stepIndex) {
        // Active
        const color = i === stepIndex ? COLORS.ACCENT_CYAN : COLORS.ACCENT_PURPLE;
        this.stepBgs[i]
          .roundRect(0, 0, stepW, stepH, 8)
          .fill({ color, alpha: i === stepIndex ? 0.3 : 0.15 })
          .roundRect(0, 0, stepW, stepH, 8)
          .stroke({ color, width: i === stepIndex ? 2 : 1, alpha: 0.8 });
        this.stepTexts[i].style.fill = i === stepIndex ? COLORS.ACCENT_CYAN : COLORS.ACCENT_PURPLE;
      } else {
        // Inactive
        this.stepBgs[i]
          .roundRect(0, 0, stepW, stepH, 8)
          .fill({ color: COLORS.BG_CONTROL })
          .roundRect(0, 0, stepW, stepH, 8)
          .stroke({ color: COLORS.BORDER_DEFAULT, width: 1 });
        this.stepTexts[i].style.fill = COLORS.TEXT_MUTED;
      }
    }
  }
}

// ===========================================================================
// FreeSpinScene
// ===========================================================================
export class FreeSpinScene extends Scene {
  private app: Application;
  private sceneManager: SceneManager;

  private reelGrid: ReelGrid;
  private multiplierTrail: MultiplierTrail;
  private spinsRemainingText: Text;
  private totalWinText: Text;
  private totalWinAmount: Text;
  private spinActive = false;

  constructor(app: Application, sceneManager: SceneManager) {
    super();
    this.app = app;
    this.sceneManager = sceneManager;

    // --- Top banner ---
    const bannerH = 44;
    const bannerBg = new Graphics();
    bannerBg.rect(0, 0, GAME_WIDTH, bannerH).fill({ color: COLORS.BG_SURFACE });
    this.addChild(bannerBg);

    const bannerTitle = new Text({
      text: 'FREE SPINS',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 16,
        fontWeight: 'bold',
        fill: COLORS.ACCENT_MAGENTA,
        letterSpacing: 3,
      }),
    });
    bannerTitle.anchor.set(0.5, 0.5);
    bannerTitle.x = GAME_WIDTH / 2;
    bannerTitle.y = bannerH / 2;
    this.addChild(bannerTitle);

    // Spins remaining (top-left)
    this.spinsRemainingText = new Text({
      text: '10',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 14,
        fontWeight: 'bold',
        fill: COLORS.ACCENT_CYAN,
      }),
    });
    this.spinsRemainingText.x = 16;
    this.spinsRemainingText.y = (bannerH - this.spinsRemainingText.height) / 2;
    this.addChild(this.spinsRemainingText);

    const spinsLabel = new Text({
      text: 'LEFT',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 8,
        fill: COLORS.TEXT_MUTED,
      }),
    });
    spinsLabel.x = 38;
    spinsLabel.y = (bannerH - spinsLabel.height) / 2 + 2;
    this.addChild(spinsLabel);

    // --- Multiplier Trail ---
    this.multiplierTrail = new MultiplierTrail();
    this.multiplierTrail.y = bannerH + 8;
    this.addChild(this.multiplierTrail);

    // --- Reel Grid ---
    this.reelGrid = new ReelGrid(GAME_WIDTH);
    this.reelGrid.x = 0;
    this.reelGrid.y = bannerH + 48;
    this.addChild(this.reelGrid);

    // Set initial symbols
    const initialOutcome = generateOutcome();
    this.reelGrid.setSymbols(initialOutcome);

    const reelBottom = this.reelGrid.y + this.reelGrid.getGridHeight();

    // --- Total Win Display ---
    this.totalWinText = new Text({
      text: 'TOTAL WIN',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 12,
        fill: COLORS.TEXT_MUTED,
      }),
    });
    this.totalWinText.anchor.set(0.5, 0);
    this.totalWinText.x = GAME_WIDTH / 2;
    this.totalWinText.y = reelBottom + 12;
    this.addChild(this.totalWinText);

    this.totalWinAmount = new Text({
      text: '$0.00',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 36,
        fontWeight: '800',
        fill: COLORS.ACCENT_GOLD,
      }),
    });
    this.totalWinAmount.anchor.set(0.5, 0);
    this.totalWinAmount.x = GAME_WIDTH / 2;
    this.totalWinAmount.y = reelBottom + 30;
    this.addChild(this.totalWinAmount);
  }

  onEnter(): void {
    this.updateUI();
    // Start auto-spin loop after a brief delay
    gsap.delayedCall(1.0, () => this.autoSpinLoop());
  }

  onExit(): void {
    this.spinActive = false;
  }

  private updateUI(): void {
    const remaining = gameState.get('freeSpinsRemaining');
    const totalWin = gameState.get('freeSpinsTotalWin');
    const step = gameState.get('multiplierStep');

    this.spinsRemainingText.text = `${remaining}`;
    this.totalWinAmount.text = formatCurrency(totalWin);
    this.multiplierTrail.setActiveStep(step);
  }

  private async autoSpinLoop(): Promise<void> {
    this.spinActive = true;

    while (this.spinActive && gameState.get('freeSpinsRemaining') > 0) {
      // Decrement spins remaining
      const remaining = gameState.get('freeSpinsRemaining');
      gameState.set('freeSpinsRemaining', remaining - 1);

      // Clear highlights
      this.reelGrid.clearHighlights();

      // Generate outcome
      const outcome = generateOutcome();
      gameState.set('reelResult', outcome);

      this.updateUI();

      // Spin the reels
      await this.reelGrid.spin(outcome, false);

      // Evaluate wins
      const bet = gameState.get('betSize');
      const multiplier = MULTIPLIER_STEPS[gameState.get('multiplierStep')] ?? 1;
      const winLines = evaluateWins(outcome, bet);
      const spinWin = winLines.reduce((sum: number, line: WinLine) => sum + line.payout, 0) * multiplier;

      if (spinWin > 0) {
        // Add to total win
        const prevTotal = gameState.get('freeSpinsTotalWin');
        gameState.set('freeSpinsTotalWin', prevTotal + spinWin);
        gameState.set('balance', gameState.get('balance') + spinWin);

        // Highlight winning positions
        for (const wl of winLines) {
          this.reelGrid.highlightWinPositions(wl.positions);
        }

        // Animate total win text
        await this.animateTotalWin(prevTotal, prevTotal + spinWin);
      }

      // Advance multiplier every 2 spins
      const spinsUsed = gameState.get('freeSpinsRemaining');
      const totalSpins = spinsUsed + (remaining - 1 - spinsUsed) + 1;
      // Calculate how many spins have been completed
      const originalSpins = remaining; // before decrement was the remaining count
      // Actually let's just track by remaining count changes
      // Multiplier advances at certain remaining thresholds
      this.advanceMultiplier();

      this.updateUI();

      // Wait before next spin
      await this.delay(spinWin > 0 ? 1.5 : 1.0);
    }

    // Free spins complete — show summary, then return to base game
    if (this.spinActive) {
      await this.showSummary();
      this.returnToBaseGame();
    }
  }

  private advanceMultiplier(): void {
    // Advance multiplier based on how many spins are done
    // For 10 spins: step 0 (spins 10-9), step 1 (8-7), step 2 (6-5), step 3 (4-3), step 4 (2-1)
    const remaining = gameState.get('freeSpinsRemaining');
    const total = gameState.get('freeSpinsRemaining') + (10 - gameState.get('freeSpinsRemaining'));
    // Simpler: just use remaining to determine step
    // 10,9 → 0, 8,7 → 1, 6,5 → 2, 4,3 → 3, 2,1,0 → 4
    let step: number;
    if (remaining >= 8) step = 0;
    else if (remaining >= 6) step = 1;
    else if (remaining >= 4) step = 2;
    else if (remaining >= 2) step = 3;
    else step = 4;

    step = Math.min(step, MULTIPLIER_STEPS.length - 1);
    gameState.set('multiplierStep', step);
  }

  private async animateTotalWin(from: number, to: number): Promise<void> {
    const proxy = { value: from };
    return new Promise<void>((resolve) => {
      gsap.to(proxy, {
        value: to,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          this.totalWinAmount.text = formatCurrency(proxy.value);
        },
        onComplete: () => {
          this.totalWinAmount.text = formatCurrency(to);
          resolve();
        },
      });
    });
  }

  private async showSummary(): Promise<void> {
    const totalWin = gameState.get('freeSpinsTotalWin');

    // Flash the total win amount
    await gsap.to(this.totalWinAmount, {
      alpha: 0,
      duration: 0.2,
      yoyo: true,
      repeat: 5,
      ease: 'power1.inOut',
    });

    this.totalWinAmount.text = formatCurrency(totalWin);
    this.totalWinAmount.alpha = 1;

    await this.delay(1.5);
  }

  private async returnToBaseGame(): Promise<void> {
    gameState.set('gameMode', 'base');
    // Dynamic import to avoid circular dependency
    const { BaseGameScene } = await import('./BaseGameScene');
    const baseGame = new BaseGameScene(this.app, this.sceneManager);
    this.sceneManager.showScene(baseGame);
  }

  private delay(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      gsap.delayedCall(seconds, resolve);
    });
  }
}
