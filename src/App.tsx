import { useAppStore } from './stores/useAppStore';
import { useCalcStore } from './stores/useCalcStore';
import {
  DSConsole,
  DSButton,
  Professor,
  Calendar,
  CalendarStats,
} from './components';
import { CalcGame, CalcGameInput, SudokuGame, SudokuGameInput, RecognitionDebug } from './games';
import styles from './App.module.css';

function App() {
  const {
    currentView,
    setView,
    professorExpression,
    getBrainAge,
  } = useAppStore();

  const { getStats } = useCalcStore();

  const brainAge = getBrainAge();

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요!';
    if (hour < 18) return '좋은 오후에요!';
    return '좋은 저녁이에요!';
  };

  const goToMenu = () => {
    setView('menu');
  };

  const renderTopScreen = () => {
    switch (currentView) {
      case 'calc':
        return <CalcGame onBack={goToMenu} onComplete={() => setView('complete')} />;

      case 'sudoku':
        return <SudokuGame onBack={goToMenu} onComplete={() => setView('complete')} />;

      case 'debug':
        return <RecognitionDebug onBack={goToMenu} />;

      case 'calendar':
        return <Calendar onBack={goToMenu} />;

      case 'complete':
        const stats = getStats();
        return (
          <div className={styles.completeScreen}>
            <div className={styles.completeTitle}>훈련 완료!</div>
            <div className={styles.completeStats}>
              정답률: {stats.accuracy}%
            </div>
            <div className={styles.completeStats}>
              소요 시간: {Math.floor(stats.elapsedSeconds / 60)}:{String(stats.elapsedSeconds % 60).padStart(2, '0')}
            </div>
            <div className={styles.brainAgeSection}>
              <div className={styles.brainAgeLabel}>측정된 두뇌 나이</div>
              <div className={styles.brainAgeValue}>{stats.brainAge}</div>
              <div className={styles.brainAgeUnit}>세</div>
            </div>
            <DSButton variant="primary" onClick={goToMenu}>
              확인
            </DSButton>
          </div>
        );

      default: // menu
        return (
          <div className={styles.menuTop}>
            <div className={styles.professorArea}>
              <Professor expression={professorExpression} size={80} />
            </div>
            <div className={styles.speechBubble}>
              {getGreeting()}<br />
              오늘도 두뇌 훈련을<br />
              시작해볼까요?
            </div>
            <div className={styles.brainAgeDisplay}>
              <div className={styles.brainAgeLabel}>현재 두뇌 나이</div>
              <div className={styles.brainAgeValue}>
                {brainAge ?? '--'}
              </div>
              <div className={styles.brainAgeUnit}>세</div>
            </div>
          </div>
        );
    }
  };

  const renderBottomScreen = () => {
    switch (currentView) {
      case 'calc':
        return <CalcGameInput />;

      case 'sudoku':
        return <SudokuGameInput />;

      case 'debug':
        return null;

      case 'calendar':
        return <CalendarStats />;

      case 'complete':
        return (
          <div className={styles.menuBottom}>
            <div className={styles.mainTitle}>매일매일 두뇌 훈련</div>
          </div>
        );

      default: // menu
        return (
          <div className={styles.menuBottom}>
            <div className={styles.mainTitle}>매일매일 두뇌 훈련</div>
            <div className={styles.menuButtons}>
              <button className={styles.menuButton} onClick={() => setView('calc')}>
                <div className={`${styles.menuIcon} ${styles.calc}`}>🔢</div>
                <span className={styles.menuText}>계산 훈련</span>
              </button>
              <button className={styles.menuButton} onClick={() => setView('sudoku')}>
                <div className={`${styles.menuIcon} ${styles.sudoku}`}>🧩</div>
                <span className={styles.menuText}>스도쿠</span>
              </button>
              <button className={styles.menuButton} onClick={() => setView('calendar')}>
                <div className={`${styles.menuIcon} ${styles.calendar}`}>📅</div>
                <span className={styles.menuText}>학습 기록</span>
              </button>
              <button className={styles.menuButton} onClick={() => setView('debug')}>
                <div className={styles.menuIcon}>🔧</div>
                <span className={styles.menuText}>인식 디버그</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <DSConsole
      topScreen={renderTopScreen()}
      bottomScreen={renderBottomScreen()}
    />
  );
}

export default App;
