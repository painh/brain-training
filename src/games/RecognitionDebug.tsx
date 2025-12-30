import { create } from 'zustand';
import { TwoDigitCanvas } from '../components';
import { useI18nStore } from '../stores/useI18nStore';
import styles from './RecognitionDebug.module.css';

interface RecognitionResult {
  tens: { digit: number | null; candidates: number[] };
  ones: { digit: number | null; candidates: number[] };
  combined: number | null;
  combinedCandidates: number[];
}

// Store for sharing state between top and bottom screens
interface DebugStore {
  history: number[];
  addHistory: (num: number) => void;
  clearHistory: () => void;
}

const useDebugStore = create<DebugStore>((set) => ({
  history: [],
  addHistory: (num) => set((state) => ({
    history: [num, ...state.history].slice(0, 20)
  })),
  clearHistory: () => set({ history: [] }),
}));

export const RecognitionDebug = ({ onBack }: { onBack: () => void }) => {
  const { t } = useI18nStore();
  const { addHistory } = useDebugStore();

  const handleRecognize = (res: RecognitionResult) => {
    if (res.combined !== null) {
      addHistory(res.combined);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>←</button>
        <h1>{t.debug_title}</h1>
      </div>

      <div className={styles.main}>
        <TwoDigitCanvas
          onRecognize={handleRecognize}
          showDebugInfo={true}
        />
      </div>
    </div>
  );
};

// Bottom screen component
export const RecognitionDebugInput = () => {
  const { t } = useI18nStore();
  const { history, clearHistory } = useDebugStore();

  return (
    <div className={styles.bottomContainer}>
      <div className={styles.bottomHeader}>
        <h3>{t.history}</h3>
        {history.length > 0 && (
          <button className={styles.clearButton} onClick={clearHistory}>
            {t.clear}
          </button>
        )}
      </div>
      {history.length > 0 ? (
        <div className={styles.historyList}>
          {history.map((h, i) => (
            <span key={i} className={styles.historyItem}>{h}</span>
          ))}
        </div>
      ) : (
        <div className={styles.emptyMessage}>
          {t.no_history}
        </div>
      )}
    </div>
  );
};
