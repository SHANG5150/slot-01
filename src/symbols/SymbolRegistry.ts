export enum SymbolId {
  LUCKY7 = 'lucky7',
  CROWN = 'crown',
  STAR = 'star',
  DIAMOND = 'diamond',
  CHERRY = 'cherry',
  SCATTER = 'scatter',
}

export interface SymbolDef {
  id: SymbolId;
  name: string;
  color: number;
  colorCSS: string;
  type: 'text' | 'icon';
  textContent?: string;
  fontSize?: number;
  svgPath?: string;
}

// Simple SVG-like paths for drawing symbols with PixiJS Graphics
export const SYMBOLS: Record<SymbolId, SymbolDef> = {
  [SymbolId.LUCKY7]: {
    id: SymbolId.LUCKY7,
    name: 'Lucky Seven',
    color: 0xff2266,
    colorCSS: '#ff2266',
    type: 'text',
    textContent: '7',
    fontSize: 48,
  },
  [SymbolId.CROWN]: {
    id: SymbolId.CROWN,
    name: 'Crown',
    color: 0xe040fb,
    colorCSS: '#e040fb',
    type: 'icon',
  },
  [SymbolId.STAR]: {
    id: SymbolId.STAR,
    name: 'Star',
    color: 0x00f0ff,
    colorCSS: '#00f0ff',
    type: 'icon',
  },
  [SymbolId.DIAMOND]: {
    id: SymbolId.DIAMOND,
    name: 'Diamond',
    color: 0x7b61ff,
    colorCSS: '#7b61ff',
    type: 'icon',
  },
  [SymbolId.CHERRY]: {
    id: SymbolId.CHERRY,
    name: 'Cherry',
    color: 0xff40a0,
    colorCSS: '#ff40a0',
    type: 'icon',
  },
  [SymbolId.SCATTER]: {
    id: SymbolId.SCATTER,
    name: 'Scatter',
    color: 0xe040fb,
    colorCSS: '#e040fb',
    type: 'icon',
  },
};

export const ALL_SYMBOL_IDS = Object.values(SymbolId);
export const REGULAR_SYMBOL_IDS = ALL_SYMBOL_IDS.filter((s) => s !== SymbolId.SCATTER);
