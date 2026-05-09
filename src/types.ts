export interface PuzzlePiece {
  id: number;
  originalIndex: number;
  currentPos: number | null; // null if in pool, number if in slot index
}

export type AppView = 'intro' | 'puzzle' | 'boarding';
