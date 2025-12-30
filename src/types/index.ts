// Game Types
export type GameType = 'calc' | 'sudoku';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type InputMode = 'draw' | 'numpad';

// Calculation Game
export interface CalcProblem {
  a: number;
  b: number;
  op: '+' | '-' | '×' | '÷';
  answer: number;
}

export interface CalcAnswer {
  problem: CalcProblem;
  userAnswer: number;
  isCorrect: boolean;
}

export interface CalcGameState {
  problems: CalcProblem[];
  currentIndex: number;
  answers: CalcAnswer[];
  startTime: number | null;
  isComplete: boolean;
}

// Sudoku
export type SudokuGrid = number[][];

export interface SudokuGameState {
  solution: SudokuGrid;
  puzzle: SudokuGrid;
  userGrid: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  difficulty: Difficulty;
  isComplete: boolean;
}

// Progress & Stats
export interface GameResult {
  game: GameType;
  date: string;
  accuracy?: number;
  time?: number;
  brainAge?: number;
  difficulty?: Difficulty;
}

export interface StudyRecord {
  [date: string]: boolean;
}

export interface AppState {
  studyDays: StudyRecord;
  history: GameResult[];
  brainAges: { age: number; date: string }[];
}

// Professor expressions
export type ProfessorExpression = 'normal' | 'happy' | 'sad' | 'thinking';

// Screen views
export type ScreenView = 'menu' | 'calc' | 'sudoku' | 'calendar' | 'complete' | 'debug' | 'settings';
