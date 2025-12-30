import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useI18nStore } from '../stores/useI18nStore';
import styles from './Calendar.module.css';

interface CalendarProps {
  onBack: () => void;
}

export const Calendar = ({ onBack }: CalendarProps) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const { studyDays, getMonthlyStudyCount } = useAppStore();
  const { t, language } = useI18nStore();

  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Day headers per language
  const daysByLang: Record<string, string[]> = {
    ko: ['일', '월', '화', '수', '목', '금', '토'],
    en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    ja: ['日', '月', '火', '水', '木', '金', '土'],
    'zh-CN': ['日', '一', '二', '三', '四', '五', '六'],
    'zh-TW': ['日', '一', '二', '三', '四', '五', '六'],
    es: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  };
  const days = daysByLang[language] || daysByLang.en;

  // Month formatting per language
  const formatMonth = () => {
    if (language === 'ko') return `${year}년 ${month + 1}월`;
    if (language === 'ja') return `${year}年 ${month + 1}月`;
    if (language === 'zh-CN' || language === 'zh-TW') return `${year}年${month + 1}月`;
    if (language === 'es') {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${months[month]} ${year}`;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month]} ${year}`;
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthlyCount = getMonthlyStudyCount(year, month);

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        ←
      </button>

      <div className={styles.title}>{t.calendar_title}</div>

      <div className={styles.header}>
        <button className={styles.navButton} onClick={prevMonth}>
          ◀
        </button>
        <span className={styles.monthTitle}>{formatMonth()}</span>
        <button className={styles.navButton} onClick={nextMonth}>
          ▶
        </button>
      </div>

      <div className={styles.grid}>
        {days.map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className={`${styles.day} ${styles.empty}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday =
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate();
          const isStudied = studyDays[dateKey];

          return (
            <div
              key={day}
              className={`
                ${styles.day}
                ${isToday ? styles.today : ''}
                ${isStudied ? styles.studied : ''}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className={styles.monthStats}>
        {t.this_month}: <span className={styles.count}>{monthlyCount}</span>{t.days}
      </div>
    </div>
  );
};

// Bottom screen for calendar
export const CalendarStats = () => {
  const { getTotalStudyDays } = useAppStore();
  const { t } = useI18nStore();
  const totalDays = getTotalStudyDays();

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsLabel}>{t.total_study_days}</div>
      <div className={styles.statsValue}>{totalDays}{t.days}</div>
    </div>
  );
};
