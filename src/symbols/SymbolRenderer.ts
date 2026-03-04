import { Graphics, Text, TextStyle, RenderTexture, Container, Application } from 'pixi.js';
import { SymbolId, SYMBOLS } from './SymbolRegistry';
import { FONTS } from '../config/theme';

const textureCache = new Map<SymbolId, RenderTexture>();

function drawStar(g: Graphics, cx: number, cy: number, r: number, color: number) {
  const points: number[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
    const rad = i % 2 === 0 ? r : r * 0.4;
    points.push(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
  }
  g.poly(points).fill({ color }).stroke({ color, width: 2 });
}

function drawDiamond(g: Graphics, cx: number, cy: number, r: number, color: number) {
  g.poly([cx, cy - r, cx + r * 0.7, cy, cx, cy + r, cx - r * 0.7, cy])
    .stroke({ color, width: 2.5 });
}

function drawCrown(g: Graphics, cx: number, cy: number, size: number, color: number) {
  const w = size * 0.9;
  const h = size * 0.65;
  const top = cy - h / 2;
  const bot = cy + h / 2;
  const left = cx - w / 2;
  const right = cx + w / 2;
  g.poly([
    left, bot,
    left, top + h * 0.3,
    left + w * 0.25, top + h * 0.5,
    cx, top,
    right - w * 0.25, top + h * 0.5,
    right, top + h * 0.3,
    right, bot,
  ]).stroke({ color, width: 2.5 });
}

function drawCherry(g: Graphics, cx: number, cy: number, size: number, color: number) {
  const r = size * 0.18;
  g.circle(cx - r * 1.2, cy + r * 0.5, r).stroke({ color, width: 2.5 });
  g.circle(cx + r * 1.2, cy + r * 0.5, r).stroke({ color, width: 2.5 });
  // stems
  g.moveTo(cx - r * 1.2, cy + r * 0.5 - r).quadraticCurveTo(cx, cy - size * 0.4, cx + r * 0.5, cy - size * 0.35).stroke({ color, width: 2 });
  g.moveTo(cx + r * 1.2, cy + r * 0.5 - r).quadraticCurveTo(cx + r, cy - size * 0.3, cx + r * 0.5, cy - size * 0.35).stroke({ color, width: 2 });
}

function drawScatter(g: Graphics, cx: number, cy: number, size: number, color: number) {
  // sparkle / 4-point star
  const r = size * 0.4;
  const inner = r * 0.2;
  const points: number[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : inner;
    points.push(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
  }
  g.poly(points).fill({ color }).stroke({ color, width: 1.5 });
  // small sparkles
  g.circle(cx + r * 0.7, cy - r * 0.5, 2).fill({ color });
  g.circle(cx - r * 0.5, cy + r * 0.6, 1.5).fill({ color });
}

export function prerenderSymbols(app: Application, cellW: number, cellH: number): void {
  for (const [id, def] of Object.entries(SYMBOLS)) {
    const container = new Container();
    const cx = cellW / 2;
    const cy = cellH / 2;
    const iconSize = Math.min(cellW, cellH) * 0.55;

    if (def.type === 'text') {
      const style = new TextStyle({
        fontFamily: FONTS.DISPLAY,
        fontSize: def.fontSize ?? 48,
        fontWeight: '900',
        fill: def.colorCSS,
      });
      const text = new Text({ text: def.textContent ?? '', style });
      text.anchor.set(0.5);
      text.x = cx;
      text.y = cy;
      container.addChild(text);
    } else {
      const g = new Graphics();
      switch (id as SymbolId) {
        case SymbolId.STAR:
          drawStar(g, cx, cy, iconSize * 0.45, def.color);
          break;
        case SymbolId.DIAMOND:
          drawDiamond(g, cx, cy, iconSize * 0.45, def.color);
          break;
        case SymbolId.CROWN:
          drawCrown(g, cx, cy, iconSize, def.color);
          break;
        case SymbolId.CHERRY:
          drawCherry(g, cx, cy, iconSize, def.color);
          break;
        case SymbolId.SCATTER:
          drawScatter(g, cx, cy, iconSize, def.color);
          break;
      }
      container.addChild(g);
    }

    const rt = RenderTexture.create({ width: cellW, height: cellH });
    app.renderer.render({ container, target: rt });
    textureCache.set(id as SymbolId, rt);
  }
}

export function getSymbolTexture(id: SymbolId): RenderTexture {
  return textureCache.get(id)!;
}
