import type { ReactNode } from 'react';
import styles from './DSConsole.module.css';

interface DSConsoleProps {
  topScreen: ReactNode;
  bottomScreen: ReactNode;
}

export const DSConsole = ({ topScreen, bottomScreen }: DSConsoleProps) => {
  return (
    <div className={styles.console}>
      {/* Top Screen */}
      <div className={styles.screen}>
        <div className={styles.screenInner}>{topScreen}</div>
      </div>

      {/* Hinge */}
      <div className={styles.hinge}>
        <div className={styles.hingeCenter} />
      </div>

      {/* Bottom Screen (Touch) */}
      <div className={`${styles.screen} ${styles.touchScreen}`}>
        <div className={`${styles.screenInner} ${styles.touchScreenInner}`}>
          {bottomScreen}
        </div>
      </div>
    </div>
  );
};
