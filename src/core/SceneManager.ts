import { Container } from 'pixi.js';

export abstract class Scene extends Container {
  abstract onEnter(): void;
  abstract onExit(): void;
}

export abstract class Overlay extends Container {
  abstract onOpen(): void;
  abstract onClose(): void;
}

export class SceneManager {
  private sceneLayer = new Container();
  private overlayLayer = new Container();
  private currentScene: Scene | null = null;
  private currentOverlay: Overlay | null = null;

  constructor(stage: Container) {
    stage.addChild(this.sceneLayer);
    stage.addChild(this.overlayLayer);
  }

  showScene(scene: Scene): void {
    if (this.currentScene) {
      this.currentScene.onExit();
      this.sceneLayer.removeChild(this.currentScene);
    }
    this.currentScene = scene;
    this.sceneLayer.addChild(scene);
    scene.onEnter();
  }

  showOverlay(overlay: Overlay): void {
    this.hideOverlay();
    this.currentOverlay = overlay;
    this.overlayLayer.addChild(overlay);
    overlay.onOpen();
  }

  hideOverlay(): void {
    if (this.currentOverlay) {
      this.currentOverlay.onClose();
      this.overlayLayer.removeChild(this.currentOverlay);
      this.currentOverlay = null;
    }
  }

  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  hasOverlay(): boolean {
    return this.currentOverlay !== null;
  }
}
