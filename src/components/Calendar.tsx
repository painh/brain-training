import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import styles from './Calendar.module.css';

interface CalendarProps {
  onBack: () => void;
}

export const Calendar = ({ onBack }: CalendarProps) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const { studyDays, getMonthlyStudyCount } = useAppStore();

  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = ['일', '월', '화', '수', '목', '금', '토'];

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

      <div className={styles.title}>학습 기록</div>

      <div className={styles.header}>
        <button className={styles.navButton} onClick={prevMonth}>
          ◀
        </button>
        <span className={styles.monthTitle}>{year}년 {month + 1}월</span>
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
        이번 달 학습: <span className={styles.count}>{monthlyCount}</span>일
      </div>
    </div>
  );
};

// Bottom screen for calendar
export const CalendarStats = () => {
  const { getTotalStudyDays } = useAppStore();
  const totalDays = getTotalStudyDays();

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsLabel}>총 학습 일수</div>
      <div className={styles.statsValue}>{totalDays}일</div>
      <div className={styles.legend}>
        <span className={styles.star}>★</span> = 학습 완료
      </div>
    </div>
  );
};
