import { useEffect } from 'react';
import { useSudokuStore } from '../stores/useSudokuStore';
import { useAppStore } from '../stores/useAppStore';
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
    setDifficulty,
  } = useSudokuStore();

  const { saveProgress } = useAppStore();

  // Start game on mount
  useEffect(() => {
    startGame();
  }, [startGame]);

  // Handle completion
  useEffect(() => {
    if (isComplete) {
      saveProgress({
        game: 'sudoku',
        date: new Date().toISOString(),
        difficulty,
      });
      onComplete();
    }
  }, [isComplete, difficulty, saveProgress, onComplete]);

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    startGame(diff);
  };

  return (
    <div className={styles.topContent}>
      <button className={styles.backButton} onClick={onBack}>
        ←
      </button>

      <div className={styles.title}>스도쿠</div>

      <div className={styles.rules}>
        가로줄, 세로줄, 3×3칸에 1~9를 중복 없이 채우세요
      </div>

      <div className={styles.difficultyButtons}>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
          <button
            key={diff}
            className={`${styles.diffButton} ${difficulty === diff ? styles.active : ''}`}
            onClick={() => handleDifficultyChange(diff)}
          >
            {diff === 'easy' ? '쉬움' : diff === 'medium' ? '보통' : '어려움'}
          </button>
        ))}
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {userGrid.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const isFixed = puzzle[rowIdx][colIdx] !== 0;
              const isSelected =
                selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
              const isError =
                cell !== 0 && cell !== solution[rowIdx][colIdx];
              const cellNotes = notes[rowIdx][colIdx];
              const hasNotes = cellNotes.size > 0 && cell === 0;

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`
                    ${styles.cell}
                    ${isFixed ? styles.fixed : ''}
                    ${isSelected ? styles.selected : ''}
                    ${isError ? styles.error : ''}
                    ${!isFixed && cell !== 0 ? styles.userInput : ''}
                    ${hasNotes ? styles.hasNotes : ''}
                  `}
                  onClick={() => selectCell(rowIdx, colIdx)}
                >
                  {cell !== 0 ? (
                    cell
                  ) : hasNotes ? (
                    <div className={styles.notesGrid}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <span
                          key={n}
                          className={`${styles.noteNum} ${cellNotes.has(n) ? styles.active : ''}`}
                        >
                          {cellNotes.has(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    ''
                  )}
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
export const SudokuGameInput = () => {
  const { inputMode, setInputMode } = useAppStore();
  const { inputNumber, eraseCell, selectedCell, noteMode, setNoteMode, difficulty } = useSudokuStore();

  const handleDrawSubmit = (digit: number) => {
    if (digit >= 1 && digit <= 9) {
      inputNumber(digit);
    }
  };

  // Only show note mode for easy/medium
  const canUseNotes = difficulty !== 'hard';

  return (
    <div className={styles.bottomContent}>
      <InputModeToggle mode={inputMode} onChange={setInputMode} />

      {!selectedCell && (
        <div className={styles.hint}>셀을 선택해주세요</div>
      )}

      {selectedCell && inputMode === 'draw' ? (
        <>
          <TwoDigitCanvas
            onSubmit={(digit) => handleDrawSubmit(digit)}
            autoSubmitDelay={400}
            singleDigitMode={true}
          />
          {canUseNotes && (
            <button
              className={`${styles.noteModeButton} ${noteMode ? styles.active : ''}`}
              onClick={() => setNoteMode(!noteMode)}
            >
              {noteMode ? '메모 ON' : '메모 OFF'}
            </button>
          )}
        </>
      ) : selectedCell ? (
        <>
          {canUseNotes && (
            <button
              className={`${styles.noteModeButton} ${noteMode ? styles.active : ''}`}
              onClick={() => setNoteMode(!noteMode)}
            >
              {noteMode ? '메모 ON' : '메모 OFF'}
            </button>
          )}
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
              지우기
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};
