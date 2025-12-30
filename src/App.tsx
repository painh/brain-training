import { useAppStore } from './stores/useAppStore';
import { useCalcStore } from './stores/useCalcStore';
import { useI18nStore, languageNames, type Language } from './stores/useI18nStore';
import {
  DSConsole,
  DSButton,
  Professor,
  Calendar,
  CalendarStats,
} from './components';
import { CalcGame, CalcGameInput, SudokuGame, SudokuGameInput, RecognitionDebug, RecognitionDebugInput } from './games';
import styles from './App.module.css';

// Format build time as version string (YYMMDD.HHmm)
const formatBuildVersion = (isoString: string) => {
  const date = new Date(isoString);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yy}${mm}${dd}.${hh}${min}`;
};

const BUILD_VERSION = formatBuildVersion(__BUILD_TIME__);
console.log(`🧠 두뇌 트레이닝 v${BUILD_VERSION}`);

function App() {
  const {
    currentView,
    setView,
    professorExpression,
    getBrainAge,
    useCandidates,
    setUseCandidates,
    useInstantSubmitDelay,
    setUseInstantSubmitDelay,
  } = useAppStore();

  const { language, setLanguage, t } = useI18nStore();

  const { getStats } = useCalcStore();

  const brainAge = getBrainAge();

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greeting_morning;
    if (hour < 18) return t.greeting_afternoon;
    return t.greeting_evening;
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

      case 'settings':
        return (
          <div className={styles.settingsScreen}>
            <button className={styles.backButton} onClick={goToMenu}>
              ←
            </button>
            <div className={styles.settingsTitle}>{t.settings}</div>
            <div className={styles.settingsList}>
              <label className={styles.settingItem}>
                <span className={styles.settingLabel}>{t.use_candidates}</span>
                <span className={styles.settingDesc}>{t.use_candidates_desc}</span>
                <input
                  type="checkbox"
                  checked={useCandidates}
                  onChange={(e) => setUseCandidates(e.target.checked)}
                  className={styles.settingCheckbox}
                />
              </label>
              <label className={styles.settingItem}>
                <span className={styles.settingLabel}>{t.use_instant_delay}</span>
                <span className={styles.settingDesc}>{t.use_instant_delay_desc}</span>
                <input
                  type="checkbox"
                  checked={useInstantSubmitDelay}
                  onChange={(e) => setUseInstantSubmitDelay(e.target.checked)}
                  className={styles.settingCheckbox}
                />
              </label>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>{t.language}</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className={styles.settingSelect}
                >
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <option key={lang} value={lang}>
                      {languageNames[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return <Calendar onBack={goToMenu} />;

      case 'complete':
        const stats = getStats();
        return (
          <div className={styles.completeScreen}>
            <div className={styles.completeTitle}>{t.training_complete}</div>
            <div className={styles.completeStats}>
              {t.accuracy}: {stats.accuracy}%
            </div>
            <div className={styles.completeStats}>
              {t.time_spent}: {Math.floor(stats.elapsedSeconds / 60)}:{String(stats.elapsedSeconds % 60).padStart(2, '0')}
            </div>
            <div className={styles.brainAgeSection}>
              <div className={styles.brainAgeLabel}>{t.measured_brain_age}</div>
              <div className={styles.brainAgeValue}>{stats.brainAge}</div>
              <div className={styles.brainAgeUnit}>{t.years_old}</div>
            </div>
            <DSButton variant="primary" onClick={goToMenu}>
              {t.confirm}
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
              {t.start_training.split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </div>
            <div className={styles.brainAgeDisplay}>
              <div className={styles.brainAgeLabel}>{t.current_brain_age}</div>
              <div className={styles.brainAgeValue}>
                {brainAge ?? '--'}
              </div>
              <div className={styles.brainAgeUnit}>{t.years_old}</div>
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
        return <RecognitionDebugInput />;

      case 'settings':
        return null;

      case 'calendar':
        return <CalendarStats />;

      case 'complete':
        return (
          <div className={styles.menuBottom}>
            <div className={styles.mainTitle}>{t.app_title}</div>
          </div>
        );

      default: // menu
        return (
          <div className={styles.menuBottom}>
            <div className={styles.titleRow}>
              <div className={styles.mainTitle}>{t.app_title}</div>
              <div className={styles.version}>v{BUILD_VERSION}</div>
            </div>
            <div className={styles.menuButtons}>
              <button className={styles.menuButton} onClick={() => setView('calc')}>
                <div className={`${styles.menuIcon} ${styles.calc}`}>🔢</div>
                <span className={styles.menuText}>{t.calc_training}</span>
              </button>
              <button className={styles.menuButton} onClick={() => setView('sudoku')}>
                <div className={`${styles.menuIcon} ${styles.sudoku}`}>🧩</div>
                <span className={styles.menuText}>{t.sudoku}</span>
              </button>
              <button className={styles.menuButton} onClick={() => setView('calendar')}>
                <div className={`${styles.menuIcon} ${styles.calendar}`}>📅</div>
                <span className={styles.menuText}>{t.study_record}</span>
              </button>
              <button className={styles.menuButton} onClick={() => setView('debug')}>
                <div className={styles.menuIcon}>🔧</div>
                <span className={styles.menuText}>{t.recognition_debug}</span>
              </button>
              <button className={styles.menuButton} onClick={() => setView('settings')}>
                <div className={styles.menuIcon}>⚙️</div>
                <span className={styles.menuText}>{t.settings}</span>
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
