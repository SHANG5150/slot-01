import { bus } from './EventBus';
import { SymbolId } from '../symbols/SymbolRegistry';

export interface GameStateData {
  balance: number;
  coins: number;
  betSize: number;
  totalWin: number;
  reelResult: SymbolId[][];
  isSpinning: boolean;
  gameMode: 'base' | 'freespin';
  freeSpinsRemaining: number;
  freeSpinsTotalWin: number;
  multiplierStep: number;
  quickSpin: boolean;
  autoPlay: boolean;
  activeOverlay: 'none' | 'paytable' | 'buyfreespin';
}

const MULTIPLIER_VALUES = [1, 2, 4, 8, 10];

class GameState {
  private data: GameStateData = {
    balance: 1250.0,
    coins: 12500,
    betSize: 0.5,
    totalWin: 0,
    reelResult: [],
    isSpinning: false,
    gameMode: 'base',
    freeSpinsRemaining: 0,
    freeSpinsTotalWin: 0,
    multiplierStep: 0,
    quickSpin: false,
    autoPlay: false,
    activeOverlay: 'none',
  };

  get<K extends keyof GameStateData>(key: K): GameStateData[K] {
    return this.data[key];
  }

  set<K extends keyof GameStateData>(key: K, value: GameStateData[K]): void {
    this.data[key] = value;
    bus.emit(`state:${key}`, value);
    bus.emit('state:update', this.data);
  }

  update(partial: Partial<GameStateData>): void {
    Object.assign(this.data, partial);
    for (const key of Object.keys(partial)) {
      bus.emit(`state:${key}`, (partial as any)[key]);
    }
    bus.emit('state:update', this.data);
  }

  getMultiplierValue(): number {
    return MULTIPLIER_VALUES[this.data.multiplierStep] ?? 1;
  }

  getSnapshot(): Readonly<GameStateData> {
    return { ...this.data };
  }
}

export const gameState = new GameState();
export { MULTIPLIER_VALUES };
