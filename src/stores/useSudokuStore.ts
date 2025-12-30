import { create } from 'zustand';
import type { SudokuGrid, Difficulty } from '../types';

// Notes grid: each cell has a set of candidate numbers (1-9)
type NotesGrid = Set<number>[][];

interface SudokuStore {
  solution: SudokuGrid;
  puzzle: SudokuGrid;
  userGrid: SudokuGrid;
  notes: NotesGrid; // Pencil marks for each cell
  selectedCell: { row: number; col: number } | null;
  difficulty: Difficulty;
  isComplete: boolean;
  noteMode: boolean; // Toggle between input mode and note mode
  showHints: boolean; // Auto-show possible candidates

  // Actions
  startGame: (difficulty?: Difficulty) => void;
  selectCell: (row: number, col: number) => void;
  inputNumber: (num: number) => void;
  toggleNote: (num: number) => void; // Toggle a note number on selected cell
  eraseCell: () => void;
  setDifficulty: (diff: Difficulty) => void;
  setNoteMode: (enabled: boolean) => void;
  setShowHints: (enabled: boolean) => void;
  getCandidates: (row: number, col: number) => Set<number>; // Get possible candidates for a cell
  checkComplete: () => boolean;
  reset: () => void;
}

const createEmptyGrid = (): SudokuGrid =>
  Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

const createEmptyNotes = (): NotesGrid =>
  Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => new Set<number>())
    );

const isValidPlacement = (
  grid: SudokuGrid,
  row: number,
  col: number,
  num: number
): boolean => {
  // Check row
  if (grid[row].includes(num)) return false;

  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }

  return true;
};

const fillSudoku = (grid: SudokuGrid, row = 0, col = 0): boolean => {
  if (col === 9) {
    row++;
    col = 0;
  }
  if (row === 9) return true;

  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

  for (const num of nums) {
    if (isValidPlacement(grid, row, col, num)) {
      grid[row][col] = num;
      if (fillSudoku(grid, row, col + 1)) return true;
      grid[row][col] = 0;
    }
  }

  return false;
};

const generateSudoku = (
  difficulty: Difficulty
): { solution: SudokuGrid; puzzle: SudokuGrid } => {
  const solution = createEmptyGrid();
  fillSudoku(solution);

  const puzzle = solution.map((row) => [...row]);
  const removeCount = {
    easy: 35,
    medium: 45,
    hard: 55,
  }[difficulty];

  let removed = 0;
  while (removed < removeCount) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return { solution, puzzle };
};

export const useSudokuStore = create<SudokuStore>((set, get) => ({
  solution: createEmptyGrid(),
  puzzle: createEmptyGrid(),
  userGrid: createEmptyGrid(),
  notes: createEmptyNotes(),
  selectedCell: null,
  difficulty: 'easy',
  isComplete: false,
  noteMode: false,
  showHints: true, // Default to showing hints

  startGame: (difficulty) => {
    const diff = difficulty || get().difficulty;
    const { solution, puzzle } = generateSudoku(diff);

    set({
      solution,
      puzzle,
      userGrid: puzzle.map((row) => [...row]),
      notes: createEmptyNotes(),
      selectedCell: null,
      difficulty: diff,
      isComplete: false,
      noteMode: false,
    });
  },

  selectCell: (row, col) => {
    const { puzzle } = get();
    // Can only select non-fixed cells
    if (puzzle[row][col] !== 0) {
      return;
    }
    set({ selectedCell: { row, col } });
  },

  inputNumber: (num) => {
    const { selectedCell, userGrid, puzzle, notes, noteMode } = get();
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return; // Can't modify fixed cells

    if (noteMode) {
      // In note mode, toggle the note
      get().toggleNote(num);
    } else {
      // In normal mode, set the number and clear notes
      const newGrid = userGrid.map((r) => [...r]);
      newGrid[row][col] = num;

      // Clear notes for this cell when entering a number
      const newNotes = notes.map((r) => r.map((s) => new Set(s)));
      newNotes[row][col].clear();

      set({ userGrid: newGrid, notes: newNotes });

      // Check if complete
      get().checkComplete();
    }
  },

  toggleNote: (num) => {
    const { selectedCell, userGrid, puzzle, notes } = get();
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return; // Can't add notes to fixed cells

    // If cell has a number, clear it first to allow notes
    const newGrid = userGrid.map((r) => [...r]);
    if (newGrid[row][col] !== 0) {
      newGrid[row][col] = 0;
    }

    const newNotes = notes.map((r) => r.map((s) => new Set(s)));
    if (newNotes[row][col].has(num)) {
      newNotes[row][col].delete(num);
    } else {
      newNotes[row][col].add(num);
    }

    set({ userGrid: newGrid, notes: newNotes });
  },

  eraseCell: () => {
    const { selectedCell, userGrid, puzzle, notes } = get();
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const newGrid = userGrid.map((r) => [...r]);
    newGrid[row][col] = 0;

    // Also clear notes
    const newNotes = notes.map((r) => r.map((s) => new Set(s)));
    newNotes[row][col].clear();

    set({ userGrid: newGrid, notes: newNotes });
  },

  setDifficulty: (diff) => {
    set({ difficulty: diff });
  },

  setNoteMode: (enabled) => {
    set({ noteMode: enabled });
  },

  setShowHints: (enabled) => {
    set({ showHints: enabled });
  },

  getCandidates: (row, col) => {
    const { userGrid, puzzle } = get();
    const candidates = new Set<number>();

    // If cell is fixed or already has a number, return empty
    if (puzzle[row][col] !== 0 || userGrid[row][col] !== 0) {
      return candidates;
    }

    // Check each number 1-9
    for (let num = 1; num <= 9; num++) {
      let isValid = true;

      // Check row (both puzzle fixed numbers and user input)
      for (let c = 0; c < 9; c++) {
        if (puzzle[row][c] === num || userGrid[row][c] === num) {
          isValid = false;
          break;
        }
      }

      // Check column
      if (isValid) {
        for (let r = 0; r < 9; r++) {
          if (puzzle[r][col] === num || userGrid[r][col] === num) {
            isValid = false;
            break;
          }
        }
      }

      // Check 3x3 box
      if (isValid) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3 && isValid; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            if (puzzle[r][c] === num || userGrid[r][c] === num) {
              isValid = false;
              break;
            }
          }
        }
      }

      if (isValid) {
        candidates.add(num);
      }
    }

    return candidates;
  },

  checkComplete: () => {
    const { userGrid, solution } = get();

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (userGrid[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }

    set({ isComplete: true });
    return true;
  },

  reset: () => {
    set({
      solution: createEmptyGrid(),
      puzzle: createEmptyGrid(),
      userGrid: createEmptyGrid(),
      notes: createEmptyNotes(),
      selectedCell: null,
      isComplete: false,
      noteMode: false,
    });
  },
}));
