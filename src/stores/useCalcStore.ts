import { create } from 'zustand';
import type { CalcProblem, CalcAnswer, Difficulty } from '../types';

interface CalcStore {
  problems: CalcProblem[];
  currentIndex: number;
  answers: CalcAnswer[];
  startTime: number | null;
  isComplete: boolean;
  difficulty: Difficulty;

  // Actions
  startGame: (difficulty?: Difficulty) => void;
  submitAnswer: (userAnswer: number, forceCorrect?: boolean) => boolean;
  nextProblem: () => void;
  getCurrentProblem: () => CalcProblem | null;
  getStats: () => {
    correct: number;
    total: number;
    accuracy: number;
    elapsedSeconds: number;
    brainAge: number;
  };
  reset: () => void;
}

const generateProblems = (difficulty: Difficulty, count = 25): CalcProblem[] => {
  const problems: CalcProblem[] = [];
  const ops: ('+' | '-' | '×' | '÷')[] = ['+', '-', '×', '÷'];

  for (let i = 0; i < count; i++) {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, answer: number;

    switch (difficulty) {
      case 'easy':
        // 초급: 정답이 한 자리수 (1~9)
        switch (op) {
          case '+':
            answer = Math.floor(Math.random() * 8) + 2; // 2~9
            a = Math.floor(Math.random() * (answer - 1)) + 1;
            b = answer - a;
            break;
          case '-':
            answer = Math.floor(Math.random() * 8) + 1; // 1~8
            b = Math.floor(Math.random() * 8) + 1; // 1~8
            a = answer + b;
            break;
          case '×':
            // 구구단 쉬운 것: 2~5단
            a = Math.floor(Math.random() * 4) + 2; // 2~5
            b = Math.floor(Math.random() * Math.floor(9 / a)) + 1;
            answer = a * b;
            break;
          case '÷':
            answer = Math.floor(Math.random() * 4) + 2; // 2~5
            b = Math.floor(Math.random() * 4) + 2; // 2~5
            a = answer * b;
            break;
        }
        break;

      case 'medium':
        // 중급: 정답이 두 자리수 (10~99)
        switch (op) {
          case '+':
            answer = Math.floor(Math.random() * 90) + 10; // 10~99
            a = Math.floor(Math.random() * (answer - 1)) + 1;
            b = answer - a;
            break;
          case '-':
            answer = Math.floor(Math.random() * 90) + 10; // 10~99
            b = Math.floor(Math.random() * 40) + 1;
            a = answer + b;
            break;
          case '×':
            a = Math.floor(Math.random() * 9) + 2; // 2~10
            b = Math.floor(Math.random() * 9) + 2;
            answer = a * b;
            break;
          case '÷':
            answer = Math.floor(Math.random() * 9) + 2; // 2~10
            b = Math.floor(Math.random() * 9) + 2;
            a = answer * b;
            break;
        }
        break;

      case 'hard':
        // 고급: 더 큰 수, 복잡한 계산
        switch (op) {
          case '+':
            a = Math.floor(Math.random() * 50) + 30; // 30~79
            b = Math.floor(Math.random() * Math.min(99 - a, 50)) + 10;
            answer = a + b;
            break;
          case '-':
            a = Math.floor(Math.random() * 50) + 50; // 50~99
            b = Math.floor(Math.random() * 40) + 10;
            answer = a - b;
            break;
          case '×':
            // 두 자리 × 한 자리
            a = Math.floor(Math.random() * 10) + 11; // 11~20
            b = Math.floor(Math.random() * 4) + 2; // 2~5
            answer = a * b;
            break;
          case '÷':
            // 더 큰 나눗셈
            answer = Math.floor(Math.random() * 10) + 5; // 5~14
            b = Math.floor(Math.random() * 5) + 5; // 5~9
            a = answer * b;
            break;
        }
        break;
    }

    problems.push({ a, b, op, answer });
  }

  return problems;
};

export const useCalcStore = create<CalcStore>((set, get) => ({
  problems: [],
  currentIndex: 0,
  answers: [],
  startTime: null,
  isComplete: false,
  difficulty: 'easy',

  startGame: (difficulty = 'easy') => {
    set({
      problems: generateProblems(difficulty),
      currentIndex: 0,
      answers: [],
      startTime: Date.now(),
      isComplete: false,
      difficulty,
    });
  },

  submitAnswer: (userAnswer, forceCorrect) => {
    const { problems, currentIndex, answers } = get();
    const problem = problems[currentIndex];
    if (!problem) return false;

    // If forceCorrect is provided (from drawing recognition), use it
    // Otherwise compute from exact match
    const isCorrect = forceCorrect !== undefined
      ? forceCorrect
      : userAnswer === problem.answer;

    set({
      answers: [...answers, { problem, userAnswer, isCorrect }],
    });

    return isCorrect;
  },

  nextProblem: () => {
    const { currentIndex, problems } = get();
    if (currentIndex + 1 >= problems.length) {
      set({ isComplete: true });
    } else {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  getCurrentProblem: () => {
    const { problems, currentIndex } = get();
    return problems[currentIndex] || null;
  },

  getStats: () => {
    const { answers, startTime } = get();
    const correct = answers.filter((a) => a.isCorrect).length;
    const total = answers.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const elapsedSeconds = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;

    // Calculate brain age
    let brainAge = 20;
    if (accuracy < 100) brainAge += Math.floor((100 - accuracy) / 5);
    if (elapsedSeconds > 60) brainAge += Math.floor((elapsedSeconds - 60) / 10);
    brainAge = Math.min(80, Math.max(20, brainAge));

    return { correct, total, accuracy, elapsedSeconds, brainAge };
  },

  reset: () => {
    set({
      problems: [],
      currentIndex: 0,
      answers: [],
      startTime: null,
      isComplete: false,
    });
  },
}));
