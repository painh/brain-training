import { useState } from 'react';
import { TwoDigitCanvas } from '../components';
import styles from './RecognitionDebug.module.css';

interface RecognitionResult {
  tens: { digit: number | null; candidates: number[] };
  ones: { digit: number | null; candidates: number[] };
  combined: number | null;
  combinedCandidates: number[];
}

export const RecognitionDebug = ({ onBack }: { onBack: () => void }) => {
  const [history, setHistory] = useState<number[]>([]);

  const handleRecognize = (res: RecognitionResult) => {
    if (res.combined !== null) {
      setHistory(prev => [res.combined!, ...prev].slice(0, 10));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>←</button>
        <h1>인식 디버그</h1>
      </div>

      <div className={styles.main}>
        <TwoDigitCanvas
          onRecognize={handleRecognize}
          showDebugInfo={true}
        />

        {/* History */}
        {history.length > 0 && (
          <div className={styles.history}>
            <h3>History</h3>
            <div className={styles.historyList}>
              {history.map((h, i) => (
                <span key={i} className={styles.historyItem}>{h}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
