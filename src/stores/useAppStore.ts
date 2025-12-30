import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ScreenView,
  InputMode,
  ProfessorExpression,
  GameResult,
  StudyRecord,
} from '../types';

interface AppStore {
  // Navigation
  currentView: ScreenView;
  setView: (view: ScreenView) => void;
  lastCompletedGame: 'calc' | 'sudoku' | null;
  setLastCompletedGame: (game: 'calc' | 'sudoku' | null) => void;

  // Input mode
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;

  // Settings
  useCandidates: boolean; // Use candidate matching for digit recognition (lenient mode)
  setUseCandidates: (use: boolean) => void;
  useInstantSubmitDelay: boolean; // Wait 0.1s before submitting correct answer (default: true)
  setUseInstantSubmitDelay: (use: boolean) => void;

  // Professor
  professorExpression: ProfessorExpression;
  setProfessorExpression: (expr: ProfessorExpression) => void;

  // Progress data (persisted)
  studyDays: StudyRecord;
  history: GameResult[];
  brainAges: { age: number; date: string }[];

  // Actions
  saveProgress: (result: GameResult) => void;
  getBrainAge: () => number | null;
  getMonthlyStudyCount: (year: number, month: number) => number;
  getTotalStudyDays: () => number;
}

const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'menu',
      setView: (view) => set({ currentView: view }),
      lastCompletedGame: null,
      setLastCompletedGame: (game) => set({ lastCompletedGame: game }),

      // Input mode
      inputMode: 'draw',
      setInputMode: (mode) => set({ inputMode: mode }),

      // Settings
      useCandidates: false,
      setUseCandidates: (use) => set({ useCandidates: use }),
      useInstantSubmitDelay: true,
      setUseInstantSubmitDelay: (use) => set({ useInstantSubmitDelay: use }),

      // Professor
      professorExpression: 'normal',
      setProfessorExpression: (expr) => set({ professorExpression: expr }),

      // Progress data
      studyDays: {},
      history: [],
      brainAges: [],

      // Actions
      saveProgress: (result) => {
        const dateKey = getTodayKey();

        set((state) => ({
          studyDays: { ...state.studyDays, [dateKey]: true },
          history: [...state.history, result],
          brainAges: result.brainAge
            ? [...state.brainAges, { age: result.brainAge, date: result.date }]
            : state.brainAges,
        }));
      },

      getBrainAge: () => {
        const { brainAges } = get();
        if (brainAges.length === 0) return null;

        // Average of last 5 measurements
        const recent = brainAges.slice(-5);
        return Math.round(
          recent.reduce((sum, b) => sum + b.age, 0) / recent.length
        );
      },

      getMonthlyStudyCount: (year, month) => {
        const { studyDays } = get();
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        return Object.keys(studyDays).filter((key) =>
          key.startsWith(monthKey)
        ).length;
      },

      getTotalStudyDays: () => {
        const { studyDays } = get();
        return Object.keys(studyDays).length;
      },
    }),
    {
      name: 'brain-training-storage',
      partialize: (state) => ({
        studyDays: state.studyDays,
        history: state.history,
        brainAges: state.brainAges,
        useCandidates: state.useCandidates,
        useInstantSubmitDelay: state.useInstantSubmitDelay,
      }),
    }
  )
);
