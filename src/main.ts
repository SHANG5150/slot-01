import { Application } from 'pixi.js';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from './config/theme';
import { prerenderSymbols } from './symbols/SymbolRenderer';
import { SceneManager } from './core/SceneManager';
import { BaseGameScene } from './scenes/BaseGameScene';

async function boot() {
  const app = new Application();
  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORS.BG_PRIMARY,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  const container = document.getElementById('game-container')!;
  container.appendChild(app.canvas as HTMLCanvasElement);

  // Responsive scaling
  function resize() {
    const scaleX = window.innerWidth / GAME_WIDTH;
    const scaleY = window.innerHeight / GAME_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    container.style.transform = `scale(${scale})`;
  }
  window.addEventListener('resize', resize);
  resize();

  // Wait for fonts to load
  await document.fonts.ready;

  // Pre-render symbol textures
  const cellW = 60;
  const cellH = 85;
  prerenderSymbols(app, cellW, cellH);

  // Scene manager
  const sceneManager = new SceneManager(app.stage);

  // Start base game
  const baseGame = new BaseGameScene(app, sceneManager);
  sceneManager.showScene(baseGame);
}

boot().catch(console.error);
