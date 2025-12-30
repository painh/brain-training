import type { InputMode } from '../types';
import styles from './InputModeToggle.module.css';

interface InputModeToggleProps {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
}

export const InputModeToggle = ({ mode, onChange }: InputModeToggleProps) => {
  return (
    <div className={styles.toggle}>
      <button
        className={`${styles.button} ${mode === 'draw' ? styles.active : ''}`}
        onClick={() => onChange('draw')}
      >
        손글씨
      </button>
      <button
        className={`${styles.button} ${mode === 'numpad' ? styles.active : ''}`}
        onClick={() => onChange('numpad')}
      >
        숫자패드
      </button>
    </div>
  );
};
