export const COLORS = {
  BG_PRIMARY: 0x06060e,
  BG_SURFACE: 0x0f0f22,
  BG_CELL: 0x0c0c1e,
  BG_HEADER: 0x0a0828,
  BG_CONTROL: 0x12122a,
  BG_OVERLAY: 0x06060e,

  ACCENT_CYAN: 0x00f0ff,
  ACCENT_MAGENTA: 0xe040fb,
  ACCENT_PURPLE: 0x7b61ff,
  ACCENT_GOLD: 0xffd700,
  ACCENT_RED: 0xff2266,
  ACCENT_PINK: 0xff40a0,

  TEXT_PRIMARY: 0xffffff,
  TEXT_SECONDARY: 0x8888aa,
  TEXT_MUTED: 0x6b6b8d,
  TEXT_DARK: 0x3a3a5a,

  BORDER_DEFAULT: 0x1a1a3a,
  BORDER_DARK: 0x12122a,
} as const;

export const COLORS_CSS = {
  BG_PRIMARY: '#06060e',
  ACCENT_CYAN: '#00f0ff',
  ACCENT_MAGENTA: '#e040fb',
  ACCENT_PURPLE: '#7b61ff',
  ACCENT_GOLD: '#ffd700',
  ACCENT_RED: '#ff2266',
  ACCENT_PINK: '#ff40a0',
} as const;

export const FONTS = {
  DISPLAY: 'Inter',
  MONO: 'JetBrains Mono',
} as const;

export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 700;

export const REEL_COLS = 5;
export const REEL_ROWS = 3;
export const CELL_GAP = 6;
export const CELL_RADIUS = 12;
export const REEL_PADDING = 8;
export const REEL_FRAME_RADIUS = 16;
