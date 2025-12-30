import { useState } from 'react';
import styles from './NumberPad.module.css';

interface NumberPadProps {
  onSubmit?: (value: number) => void;
  maxDigits?: number;
  showSubmit?: boolean;
}

export const NumberPad = ({
  onSubmit,
  maxDigits = 3,
  showSubmit = true,
}: NumberPadProps) => {
  const [value, setValue] = useState('');

  const handleNumber = (num: number) => {
    if (value.length < maxDigits) {
      setValue((prev) => prev + num);
    }
  };

  const handleClear = () => {
    setValue('');
  };

  const handleSubmit = () => {
    if (value) {
      onSubmit?.(parseInt(value, 10));
      setValue('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.display}>{value || '-'}</div>

      <div className={styles.pad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className={styles.button}
            onClick={() => handleNumber(num)}
          >
            {num}
          </button>
        ))}
        <button className={styles.button} onClick={() => handleNumber(0)}>
          0
        </button>
        <button className={styles.button} onClick={handleClear}>
          C
        </button>
        {showSubmit && (
          <button className={styles.button} onClick={handleSubmit}>
            →
          </button>
        )}
      </div>
    </div>
  );
};
