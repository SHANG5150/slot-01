import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { COLORS, FONTS } from '../config/theme';
import { bus } from '../core/EventBus';
import gsap from 'gsap';

const BUTTON_RADIUS = 45; // 90px diameter
const GLOW_RADIUS = 52;

export class SpinButton extends Container {
  private _disabled = false;
  private buttonContainer: Container;
  private glowCircle: Graphics;
  private mainCircle: Graphics;
  private triangleIcon: Graphics;
  private spinLabel: Text;

  constructor() {
    super();

    this.buttonContainer = new Container();
    this.addChild(this.buttonContainer);

    // --- outer glow shadow ---
    this.glowCircle = new Graphics();
    this.glowCircle
      .circle(0, 0, GLOW_RADIUS)
      .fill({ color: COLORS.ACCENT_CYAN, alpha: 0.15 });
    this.buttonContainer.addChild(this.glowCircle);

    // --- main circle with gradient approximation ---
    this.mainCircle = new Graphics();
    // Outer ring (darker shade)
    this.mainCircle
      .circle(0, 0, BUTTON_RADIUS)
      .fill({ color: 0x0098b8 });
    // Inner highlight (lighter)
    this.mainCircle
      .circle(0, -4, BUTTON_RADIUS - 4)
      .fill({ color: COLORS.ACCENT_CYAN });
    // Overlay to restore gradient feel: a semi-transparent darker bottom half
    this.mainCircle
      .circle(0, 0, BUTTON_RADIUS - 1)
      .fill({ color: 0x0098b8, alpha: 0.45 });
    this.buttonContainer.addChild(this.mainCircle);

    // --- play triangle icon ---
    this.triangleIcon = new Graphics();
    const triSize = 18;
    const offsetX = 3; // shift right slightly to optically center
    this.triangleIcon
      .poly([
        -triSize * 0.45 + offsetX, -triSize * 0.55,
        triSize * 0.55 + offsetX, 0,
        -triSize * 0.45 + offsetX, triSize * 0.55,
      ])
      .fill({ color: COLORS.BG_PRIMARY });
    this.buttonContainer.addChild(this.triangleIcon);

    // --- SPIN text below ---
    const spinStyle = new TextStyle({
      fontFamily: FONTS.MONO,
      fontSize: 10,
      fontWeight: 'bold',
      fill: COLORS.ACCENT_CYAN,
    });
    this.spinLabel = new Text({ text: 'SPIN', style: spinStyle });
    this.spinLabel.anchor.set(0.5, 0);
    this.spinLabel.x = 0;
    this.spinLabel.y = BUTTON_RADIUS + 8;
    this.addChild(this.spinLabel);

    // --- interactivity ---
    this.buttonContainer.eventMode = 'static';
    this.buttonContainer.cursor = 'pointer';
    // Set a hit area circle for reliable pointer events
    this.buttonContainer.hitArea = {
      contains: (x: number, y: number) => {
        return x * x + y * y <= BUTTON_RADIUS * BUTTON_RADIUS;
      },
    };

    this.buttonContainer.on('pointerdown', this.onPointerDown, this);
    this.buttonContainer.on('pointerup', this.onPointerUp, this);
    this.buttonContainer.on('pointerupoutside', this.onPointerUp, this);
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
    this.alpha = value ? 0.4 : 1.0;
    this.buttonContainer.cursor = value ? 'default' : 'pointer';
  }

  private onPointerDown(): void {
    if (this._disabled) return;
    gsap.to(this.buttonContainer.scale, {
      x: 0.92,
      y: 0.92,
      duration: 0.08,
      ease: 'power2.out',
    });
  }

  private onPointerUp(): void {
    if (this._disabled) return;
    gsap.to(this.buttonContainer.scale, {
      x: 1.0,
      y: 1.0,
      duration: 0.12,
      ease: 'back.out(1.5)',
    });
    bus.emit('spin:start');
  }
}
