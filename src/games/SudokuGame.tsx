import { useEffect } from 'react';
import { useSudokuStore } from '../stores/useSudokuStore';
import { useAppStore } from '../stores/useAppStore';
import { useI18nStore } from '../stores/useI18nStore';
import { TwoDigitCanvas, InputModeToggle } from '../components';
import type { Difficulty } from '../types';
import styles from './SudokuGame.module.css';

interface SudokuGameProps {
  onBack: () => void;
  onComplete: () => void;
}

export const SudokuGame = ({ onBack, onComplete }: SudokuGameProps) => {
  const {
    puzzle,
    userGrid,
    solution,
    notes,
    selectedCell,
    difficulty,
    isComplete,
    startGame,
    selectCell,
    showHints,
    getCandidates,
    getStats,
  } = useSudokuStore();

  const { saveProgress } = useAppStore();

  // Start game on mount
  useEffect(() => {
    startGame();
  }, [startGame]);

  // Handle completion
  useEffect(() => {
    if (isComplete) {
      const stats = getStats();
      saveProgress({
        game: 'sudoku',
        date: new Date().toISOString(),
        difficulty,
        brainAge: stats.brainAge,
      });
      onComplete();
    }
  }, [isComplete, difficulty, saveProgress, onComplete, getStats]);

  // Only show errors in easy mode (to prevent brute force in medium/hard)
  const showErrors = difficulty === 'easy';

  return (
    <div className={styles.topContent}>
      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {userGrid.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const isFixed = puzzle[rowIdx][colIdx] !== 0;
              const isSelected =
                selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
              const isError =
                showErrors && cell !== 0 && cell !== solution[rowIdx][colIdx];
              const cellNotes = notes[rowIdx][colIdx];
              const hasUserNotes = cellNotes.size > 0 && cell === 0;

              // Get auto-calculated candidates if hints are enabled
              const candidates = showHints && cell === 0 && !isFixed
                ? getCandidates(rowIdx, colIdx)
                : new Set<number>();
              const showCandidates = showHints && candidates.size > 0 && !hasUserNotes;

              // Determine which notes to show (user notes take priority over hints)
              const notesToShow = hasUserNotes
                ? cellNotes
                : (showCandidates ? candidates : new Set<number>());

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`
                    ${styles.cell}
                    ${isFixed ? styles.fixed : ''}
                    ${isSelected ? styles.selected : ''}
                    ${isError ? styles.error : ''}
                    ${!isFixed && cell !== 0 ? styles.userInput : ''}
                  `}
                  onClick={() => selectCell(rowIdx, colIdx)}
                >
                  {/* Number layer */}
                  <span className={`${styles.cellNumber} ${cell === 0 ? styles.hidden : ''}`}>
                    {cell || ''}
                  </span>
                  {/* Notes/Hints layer - always present */}
                  <div className={`${styles.notesGrid} ${cell !== 0 ? styles.hidden : ''}`}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <span
                        key={n}
                        className={styles.noteNum}
                        style={{ color: notesToShow.has(n) ? (hasUserNotes ? '#4A90D9' : '#555555') : 'transparent' }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Bottom screen input
interface SudokuGameInputProps {
  onBack: () => void;
}

export const SudokuGameInput = ({ onBack }: SudokuGameInputProps) => {
  const { inputMode, setInputMode } = useAppStore();
  const { inputNumber, eraseCell, selectedCell, showHints, setShowHints, difficulty, setDifficulty, startGame } = useSudokuStore();
  const { t } = useI18nStore();

  const handleDrawSubmit = (digit: number) => {
    if (digit >= 1 && digit <= 9) {
      inputNumber(digit);
    }
  };

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    startGame(diff);
  };

  // Only show hints for easy/medium
  const canUseHints = difficulty !== 'hard';

  return (
    <div className={styles.bottomContent}>
      <div className={styles.header}>
        <div className={styles.title}>{t.sudoku_title}</div>
        <div className={styles.rules}>{t.sudoku_rules}</div>
        <div className={styles.difficultyButtons}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              className={`${styles.diffButton} ${difficulty === diff ? styles.active : ''}`}
              onClick={() => handleDifficultyChange(diff)}
            >
              {diff === 'easy' ? t.easy : diff === 'medium' ? t.medium : t.hard}
            </button>
          ))}
        </div>
      </div>

      <InputModeToggle mode={inputMode} onChange={setInputMode} />

      {!selectedCell && (
        <div className={styles.hint}>{t.select_cell}</div>
      )}

      {canUseHints && (
        <button
          className={`${styles.hintModeButton} ${showHints ? styles.active : ''}`}
          onClick={() => setShowHints(!showHints)}
        >
          {showHints ? t.hint_on || '힌트 ON' : t.hint_off || '힌트 OFF'}
        </button>
      )}

      {selectedCell && inputMode === 'draw' ? (
        <>
          <TwoDigitCanvas
            onSubmit={(digit) => handleDrawSubmit(digit)}
            autoSubmitDelay={400}
            singleDigitMode={true}
          />
          <button
            className={`${styles.numButton} ${styles.eraseButton}`}
            onClick={eraseCell}
          >
            {t.erase}
          </button>
        </>
      ) : selectedCell ? (
        <div className={styles.sudokuPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className={styles.numButton}
              onClick={() => inputNumber(num)}
            >
              {num}
            </button>
          ))}
          <button
            className={`${styles.numButton} ${styles.wide}`}
            onClick={eraseCell}
          >
            {t.erase}
          </button>
        </div>
      ) : null}

      <button className={styles.quitButton} onClick={onBack}>
        {t.quit_game}
      </button>
    </div>
  );
};
