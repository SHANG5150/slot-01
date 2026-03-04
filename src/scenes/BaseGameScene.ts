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
} from '../config/theme';
import { FREE_SPIN_SCATTER_COUNT, FREE_SPIN_COUNT } from '../config/gameConfig';
import { Header } from '../ui/Header';
import { WinDisplay } from '../ui/WinDisplay';
import { SpinButton } from '../ui/SpinButton';
import { BetControls } from '../ui/BetControls';
import { ReelGrid } from '../reels/ReelGrid';
import { generateOutcome, countScatters } from '../logic/SpinEngine';
import { evaluateWins, WinLine } from '../logic/PaylineEvaluator';
import { PayTableOverlay } from '../overlays/PayTableOverlay';
import { BuyFreeSpinOverlay } from '../overlays/BuyFreeSpinOverlay';
import { FreeSpinScene } from './FreeSpinScene';

// ---------------------------------------------------------------------------
// Inline helper: BuyButton
// ---------------------------------------------------------------------------
class BuyButton extends Container {
  constructor() {
    super();
    const w = 72;
    const h = 30;
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 15).fill({ color: COLORS.ACCENT_MAGENTA });
    bg.roundRect(0, 0, w, h, 15).fill({ color: COLORS.ACCENT_PINK, alpha: 0.35 });
    this.addChild(bg);

    const cart = new Graphics();
    cart
      .moveTo(8, 10)
      .lineTo(12, 10)
      .lineTo(14, 20)
      .lineTo(24, 20)
      .lineTo(26, 12)
      .lineTo(14, 12)
      .stroke({ color: COLORS.BG_PRIMARY, width: 1.8 });
    cart.circle(16, 24, 2).fill({ color: COLORS.BG_PRIMARY });
    cart.circle(22, 24, 2).fill({ color: COLORS.BG_PRIMARY });
    this.addChild(cart);

    const label = new Text({
      text: 'BUY',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 11,
        fontWeight: 'bold',
        fill: COLORS.BG_PRIMARY,
      }),
    });
    label.x = 32;
    label.y = (h - label.height) / 2;
    this.addChild(label);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', () => {
      bus.emit('overlay:buy');
    });
  }
}

// ---------------------------------------------------------------------------
// Inline helper: PayTableButton
// ---------------------------------------------------------------------------
class PayTableButton extends Container {
  constructor() {
    super();
    const w = 80;
    const h = 30;
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 15)
      .fill({ color: COLORS.BG_CONTROL })
      .roundRect(0, 0, w, h, 15)
      .stroke({ color: COLORS.BORDER_DEFAULT, width: 1 });
    this.addChild(bg);

    const label = new Text({
      text: 'Pay Table',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 10,
        fontWeight: 'bold',
        fill: COLORS.TEXT_SECONDARY,
      }),
    });
    label.anchor.set(0.5);
    label.x = w / 2;
    label.y = h / 2;
    this.addChild(label);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', () => {
      bus.emit('overlay:paytable');
    });
  }
}

// ---------------------------------------------------------------------------
// Inline helper: QuickSpinToggle
// ---------------------------------------------------------------------------
class QuickSpinToggle extends Container {
  private indicator: Graphics;
  private active = false;

  constructor() {
    super();
    const w = 70;
    const h = 26;
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 13)
      .fill({ color: COLORS.BG_CONTROL })
      .roundRect(0, 0, w, h, 13)
      .stroke({ color: COLORS.BORDER_DEFAULT, width: 1 });
    this.addChild(bg);

    this.indicator = new Graphics();
    this.indicator.circle(h / 2, h / 2, 8).fill({ color: COLORS.TEXT_MUTED });
    this.addChild(this.indicator);

    const label = new Text({
      text: 'Quick',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 9,
        fill: COLORS.TEXT_MUTED,
      }),
    });
    label.x = 28;
    label.y = (h - label.height) / 2;
    this.addChild(label);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', () => this.toggle());
  }

  private toggle(): void {
    this.active = !this.active;
    gameState.set('quickSpin', this.active);
    this.indicator.clear();
    this.indicator
      .circle(this.active ? 70 - 13 : 13, 13, 8)
      .fill({ color: this.active ? COLORS.ACCENT_CYAN : COLORS.TEXT_MUTED });
  }
}

// ---------------------------------------------------------------------------
// Inline helper: AutoPlayButton
// ---------------------------------------------------------------------------
class AutoPlayButton extends Container {
  private active = false;
  private bg: Graphics;
  private labelText: Text;

  constructor() {
    super();
    const w = 70;
    const h = 26;
    this.bg = new Graphics();
    this.bg
      .roundRect(0, 0, w, h, 13)
      .fill({ color: COLORS.BG_CONTROL })
      .roundRect(0, 0, w, h, 13)
      .stroke({ color: COLORS.BORDER_DEFAULT, width: 1 });
    this.addChild(this.bg);

    this.labelText = new Text({
      text: 'Auto',
      style: new TextStyle({
        fontFamily: FONTS.MONO,
        fontSize: 10,
        fontWeight: 'bold',
        fill: COLORS.TEXT_SECONDARY,
      }),
    });
    this.labelText.anchor.set(0.5);
    this.labelText.x = w / 2;
    this.labelText.y = h / 2;
    this.addChild(this.labelText);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', () => this.toggle());
  }

  private toggle(): void {
    this.active = !this.active;
    gameState.set('autoPlay', this.active);
    this.bg.clear();
    const w = 70;
    const h = 26;
    if (this.active) {
      this.bg
        .roundRect(0, 0, w, h, 13)
        .fill({ color: COLORS.ACCENT_CYAN, alpha: 0.2 })
        .roundRect(0, 0, w, h, 13)
        .stroke({ color: COLORS.ACCENT_CYAN, width: 1 });
      this.labelText.style.fill = COLORS.ACCENT_CYAN;
    } else {
      this.bg
        .roundRect(0, 0, w, h, 13)
        .fill({ color: COLORS.BG_CONTROL })
        .roundRect(0, 0, w, h, 13)
        .stroke({ color: COLORS.BORDER_DEFAULT, width: 1 });
      this.labelText.style.fill = COLORS.TEXT_SECONDARY;
    }
  }
}

// ===========================================================================
// BaseGameScene
// ===========================================================================
export class BaseGameScene extends Scene {
  private app: Application;
  private sceneManager: SceneManager;

  private header: Header;
  private reelGrid: ReelGrid;
  private winDisplay: WinDisplay;
  private spinButton: SpinButton;
  private betControls: BetControls;

  private isSpinning = false;

  constructor(app: Application, sceneManager: SceneManager) {
    super();
    this.app = app;
    this.sceneManager = sceneManager;

    // --- Header ---
    this.header = new Header();
    this.header.y = 0;
    this.addChild(this.header);

    // --- Reel Grid (real ReelGrid with symbols) ---
    this.reelGrid = new ReelGrid(GAME_WIDTH);
    this.reelGrid.x = 0;
    this.reelGrid.y = 48;
    this.addChild(this.reelGrid);

    // Set initial random symbols
    const initialOutcome = generateOutcome();
    this.reelGrid.setSymbols(initialOutcome);

    const reelBottom = this.reelGrid.y + this.reelGrid.getGridHeight();

    // --- Win Display ---
    this.winDisplay = new WinDisplay();
    this.winDisplay.y = reelBottom + 2;
    this.addChild(this.winDisplay);

    const controlsY = this.winDisplay.y + 52;

    // --- Controls area (absolute positioning) ---
    const controls = new Container();
    controls.y = controlsY;
    this.addChild(controls);

    // Spin button (absolutely centered horizontally)
    this.spinButton = new SpinButton();
    this.spinButton.x = GAME_WIDTH / 2;
    this.spinButton.y = 60;
    controls.addChild(this.spinButton);

    // Buy button (left of spin)
    const buyBtn = new BuyButton();
    buyBtn.x = 16;
    buyBtn.y = 35;
    controls.addChild(buyBtn);

    // Pay Table button (below buy)
    const payTableBtn = new PayTableButton();
    payTableBtn.x = 16;
    payTableBtn.y = 75;
    controls.addChild(payTableBtn);

    // Right side controls group
    const rightX = 300;

    // Quick Spin toggle
    const quickSpin = new QuickSpinToggle();
    quickSpin.x = rightX;
    quickSpin.y = 10;
    controls.addChild(quickSpin);

    // Auto Play button
    const autoPlay = new AutoPlayButton();
    autoPlay.x = rightX;
    autoPlay.y = 44;
    controls.addChild(autoPlay);

    // Bet Controls
    this.betControls = new BetControls();
    this.betControls.x = rightX;
    this.betControls.y = 78;
    controls.addChild(this.betControls);
  }

  onEnter(): void {
    bus.on('spin:start', this.handleSpin);
    bus.on('state:balance', this.onBalanceChanged);
    bus.on('state:coins', this.onCoinsChanged);
    bus.on('overlay:paytable', this.openPayTable);
    bus.on('overlay:buy', this.openBuyFreeSpin);
    bus.on('overlay:close', this.closeOverlay);
    bus.on('freespin:trigger', this.enterFreeSpin);

    this.header.updateBalance(gameState.get('balance'));
    this.header.updateCoins(gameState.get('coins'));
  }

  onExit(): void {
    bus.off('spin:start', this.handleSpin);
    bus.off('state:balance', this.onBalanceChanged);
    bus.off('state:coins', this.onCoinsChanged);
    bus.off('overlay:paytable', this.openPayTable);
    bus.off('overlay:buy', this.openBuyFreeSpin);
    bus.off('overlay:close', this.closeOverlay);
    bus.off('freespin:trigger', this.enterFreeSpin);
  }

  private onBalanceChanged = (value: number): void => {
    this.header.updateBalance(value);
  };

  private onCoinsChanged = (value: number): void => {
    this.header.updateCoins(value);
  };

  private openPayTable = (): void => {
    const overlay = new PayTableOverlay();
    this.sceneManager.showOverlay(overlay);
  };

  private openBuyFreeSpin = (): void => {
    const overlay = new BuyFreeSpinOverlay();
    this.sceneManager.showOverlay(overlay);
  };

  private closeOverlay = (): void => {
    this.sceneManager.hideOverlay();
  };

  private enterFreeSpin = (): void => {
    // Close any open overlay first
    this.sceneManager.hideOverlay();
    // Switch to FreeSpinScene
    const freeSpinScene = new FreeSpinScene(this.app, this.sceneManager);
    this.sceneManager.showScene(freeSpinScene);
  };

  private handleSpin = async (): Promise<void> => {
    if (this.isSpinning) return;

    const bet = gameState.get('betSize');
    const balance = gameState.get('balance');

    if (balance < bet) return;

    this.isSpinning = true;
    this.spinButton.disabled = true;
    gameState.set('isSpinning', true);

    // Deduct bet
    gameState.set('balance', balance - bet);

    // Reset win display
    this.winDisplay.setAmount(0);

    // Clear previous highlights
    this.reelGrid.clearHighlights();

    // Generate outcome
    const outcome = generateOutcome();
    gameState.set('reelResult', outcome);

    // Spin the reels with quickSpin setting
    const quickSpin = gameState.get('quickSpin');
    await this.reelGrid.spin(outcome, quickSpin);

    // Evaluate wins
    const winLines = evaluateWins(outcome, bet);
    const totalWin = winLines.reduce((sum: number, line: WinLine) => sum + line.payout, 0);

    // Check for scatter bonus
    const scatterCount = countScatters(outcome);

    if (totalWin > 0) {
      gameState.set('totalWin', totalWin);
      gameState.set('balance', gameState.get('balance') + totalWin);

      // Highlight winning positions
      for (const wl of winLines) {
        this.reelGrid.highlightWinPositions(wl.positions);
      }

      // Animate win display
      await this.winDisplay.animateWin(totalWin);

      bus.emit('win:complete', { winLines, totalWin });
    }

    // Handle scatter -> free spins trigger
    if (scatterCount >= FREE_SPIN_SCATTER_COUNT) {
      gameState.update({
        gameMode: 'freespin',
        freeSpinsRemaining: FREE_SPIN_COUNT,
        freeSpinsTotalWin: 0,
        multiplierStep: 0,
      });
      bus.emit('freespin:trigger', scatterCount);
    }

    this.isSpinning = false;
    this.spinButton.disabled = false;
    gameState.set('isSpinning', false);

    // Auto-play: trigger next spin after a short delay
    if (gameState.get('autoPlay') && gameState.get('balance') >= gameState.get('betSize')) {
      gsap.delayedCall(0.5, () => {
        if (gameState.get('autoPlay')) {
          bus.emit('spin:start');
        }
      });
    }
  };
}
