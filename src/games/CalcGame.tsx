import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useCalcStore } from '../stores/useCalcStore';
import { useAppStore } from '../stores/useAppStore';
import { TwoDigitCanvas, NumberPad, InputModeToggle } from '../components';
import { playCorrectSound, playWrongSound } from '../utils/sounds';
import type { Difficulty } from '../types';
import styles from './CalcGame.module.css';

interface CalcGameProps {
  onBack: () => void;
  onComplete: () => void;
}

export const CalcGame = ({ onBack, onComplete }: CalcGameProps) => {
  const {
    currentIndex,
    problems,
    startTime,
    isComplete,
    startGame,
    getCurrentProblem,
    getStats,
    answers,
    difficulty,
  } = useCalcStore();

  const { saveProgress } = useAppStore();
  const [timer, setTimer] = useState('0:00');
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);

  const handleSelectDifficulty = (diff: Difficulty) => {
    setShowDifficultySelect(false);
    startGame(diff);
  };

  // Timer
  useEffect(() => {
    if (!startTime || isComplete) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      setTimer(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  // Handle completion
  useEffect(() => {
    if (isComplete) {
      const stats = getStats();
      saveProgress({
        game: 'calc',
        date: new Date().toISOString(),
        accuracy: stats.accuracy,
        time: stats.elapsedSeconds,
        brainAge: stats.brainAge,
      });
      onComplete();
    }
  }, [isComplete, getStats, saveProgress, onComplete]);

  const problem = getCurrentProblem();

  // Refs must be declared before any conditional returns
  const problemListRef = useRef<HTMLDivElement>(null);
  const currentProblemRef = useRef<HTMLDivElement>(null);

  // Scroll to current problem when it changes
  useLayoutEffect(() => {
    if (currentProblemRef.current && problemListRef.current) {
      currentProblemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [currentIndex]);

  // Difficulty selection screen
  if (showDifficultySelect) {
    const difficultyLabels: Record<Difficulty, string> = {
      easy: '초급',
      medium: '중급',
      hard: '고급',
    };
    const difficultyDesc: Record<Difficulty, string> = {
      easy: '한 자리수 정답',
      medium: '두 자리수 정답',
      hard: '복잡한 계산',
    };

    return (
      <div className={styles.topContent}>
        <button className={styles.backButton} onClick={onBack}>
          ←
        </button>
        <div className={styles.title}>계산 훈련</div>
        <div className={styles.difficultySelect}>
          <div className={styles.difficultyTitle}>난이도 선택</div>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              className={styles.difficultyButton}
              onClick={() => handleSelectDifficulty(diff)}
            >
              <span className={styles.difficultyLabel}>{difficultyLabels[diff]}</span>
              <span className={styles.difficultyDesc}>{difficultyDesc[diff]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!problem) return null;

  // Get last answer result for display
  const lastAnswer = answers[answers.length - 1];
  const showResult = lastAnswer && answers.length === currentIndex;

  const difficultyLabels: Record<Difficulty, string> = {
    easy: '초급',
    medium: '중급',
    hard: '고급',
  };

  return (
    <div className={styles.topContent}>
      <button className={styles.backButton} onClick={onBack}>
        ←
      </button>

      <div className={styles.title}>계산 훈련 ({difficultyLabels[difficulty]})</div>

      <div className={styles.stats}>
        <span>문제: {currentIndex + 1}/{problems.length}</span>
        <span className={styles.timer}>{timer}</span>
      </div>

      {/* Problem list */}
      <div className={styles.problemList} ref={problemListRef}>
        {problems.map((p, idx) => {
          const answer = answers[idx];
          const isCurrent = idx === currentIndex;
          const isPast = idx < currentIndex;

          return (
            <div
              key={idx}
              ref={isCurrent ? currentProblemRef : null}
              className={`${styles.problemItem} ${isCurrent ? styles.current : ''} ${isPast ? styles.past : ''} ${answer?.isCorrect === true ? styles.correct : ''} ${answer?.isCorrect === false ? styles.wrong : ''}`}
            >
              <span className={styles.problemNumber}>{idx + 1}</span>
              <span className={styles.problemText}>{p.a} {p.op} {p.b}</span>
              {isPast && <span className={styles.problemAnswer}>= {p.answer}</span>}
              {isCurrent && <span className={styles.problemAnswer}>= ?</span>}
            </div>
          );
        })}
      </div>

      <div className={`${styles.result} ${showResult ? (lastAnswer.isCorrect ? styles.correct : styles.wrong) : ''}`}>
        {showResult && lastAnswer.isCorrect && `${lastAnswer.userAnswer} 정답! ⭕`}
        {showResult && !lastAnswer.isCorrect && `${lastAnswer.userAnswer}? 오답 ❌ (정답: ${lastAnswer.problem.answer})`}
      </div>
    </div>
  );
};

// Bottom screen input component
export const CalcGameInput = () => {
  const { inputMode, setInputMode, setProfessorExpression } = useAppStore();
  const { submitAnswer, nextProblem, getCurrentProblem, currentIndex } = useCalcStore();
  const isProcessingRef = useRef(false);

  const problem = getCurrentProblem();

  // Submit answer for drawing (receives isCorrect from candidate matching)
  const handleDrawSubmit = (value: number, isCorrect: boolean) => {
    if (isProcessingRef.current || !problem) return;

    isProcessingRef.current = true;
    // Record the answer with the matched result
    submitAnswer(value, isCorrect);
    setProfessorExpression(isCorrect ? 'happy' : 'sad');

    // Play sound effect
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    // Quick feedback then next problem - faster for correct answers
    const feedbackDelay = isCorrect ? 200 : 500;
    setTimeout(() => {
      setProfessorExpression('normal');
      nextProblem();
      isProcessingRef.current = false;
    }, feedbackDelay);
  };

  // Submit answer for numberpad (simple exact match)
  const handleNumberPadSubmit = (value: number) => {
    if (isProcessingRef.current || !problem) return;

    isProcessingRef.current = true;
    const isCorrect = submitAnswer(value);
    setProfessorExpression(isCorrect ? 'happy' : 'sad');

    // Play sound effect
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    // Quick feedback then next problem - faster for correct answers
    const feedbackDelay = isCorrect ? 200 : 500;
    setTimeout(() => {
      setProfessorExpression('normal');
      nextProblem();
      isProcessingRef.current = false;
    }, feedbackDelay);
  };

  return (
    <div className={styles.bottomContent}>
      <InputModeToggle mode={inputMode} onChange={setInputMode} />

      {inputMode === 'draw' ? (
        <TwoDigitCanvas
          onSubmit={handleDrawSubmit}
          expectedAnswer={problem?.answer}
          problemKey={currentIndex}
          autoSubmitDelay={1200}
        />
      ) : (
        <NumberPad onSubmit={handleNumberPadSubmit} />
      )}
    </div>
  );
};
