import type { ProfessorExpression } from '../types';
import styles from './Professor.module.css';

interface ProfessorProps {
  expression?: ProfessorExpression;
  size?: number;
}

const getMouthPath = (expression: ProfessorExpression) => {
  switch (expression) {
    case 'happy':
      return 'M30 62 Q40 72 50 62';
    case 'sad':
      return 'M32 66 Q40 60 48 66';
    case 'thinking':
      return 'M35 64 L45 64';
    default:
      return 'M32 62 Q40 68 48 62';
  }
};

const getBrowPaths = (expression: ProfessorExpression) => {
  switch (expression) {
    case 'happy':
      return {
        left: 'M20 32 Q28 30 36 33',
        right: 'M44 33 Q52 30 60 32',
      };
    case 'sad':
      return {
        left: 'M20 36 Q28 34 36 37',
        right: 'M44 37 Q52 34 60 36',
      };
    case 'thinking':
      return {
        left: 'M20 32 Q28 30 36 35',
        right: 'M44 33 Q52 32 60 36',
      };
    default:
      return {
        left: 'M20 34 Q28 32 36 35',
        right: 'M44 35 Q52 32 60 34',
      };
  }
};

export const Professor = ({
  expression = 'normal',
  size = 80,
}: ProfessorProps) => {
  const mouthPath = getMouthPath(expression);
  const browPaths = getBrowPaths(expression);

  return (
    <div className={styles.professor} style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" className={styles.face}>
        {/* Head */}
        <ellipse
          cx="40"
          cy="45"
          rx="30"
          ry="32"
          fill="#FFE4C4"
          stroke="#333"
          strokeWidth="2"
        />

        {/* Hair */}
        <path
          d="M15 35 Q20 15 40 12 Q60 15 65 35"
          fill="none"
          stroke="#333"
          strokeWidth="3"
        />
        <path
          d="M18 32 Q22 20 40 17 Q58 20 62 32"
          fill="#555"
          stroke="#333"
          strokeWidth="1"
        />

        {/* Glasses */}
        <ellipse
          cx="28"
          cy="42"
          rx="10"
          ry="8"
          fill="none"
          stroke="#333"
          strokeWidth="2"
        />
        <ellipse
          cx="52"
          cy="42"
          rx="10"
          ry="8"
          fill="none"
          stroke="#333"
          strokeWidth="2"
        />
        <line x1="38" y1="42" x2="42" y2="42" stroke="#333" strokeWidth="2" />

        {/* Eyes */}
        <circle cx="28" cy="42" r="3" fill="#333" />
        <circle cx="52" cy="42" r="3" fill="#333" />

        {/* Eyebrows */}
        <path
          d={browPaths.left}
          fill="none"
          stroke="#333"
          strokeWidth="2"
        />
        <path
          d={browPaths.right}
          fill="none"
          stroke="#333"
          strokeWidth="2"
        />

        {/* Nose */}
        <path
          d="M40 45 L42 55 L38 55"
          fill="none"
          stroke="#333"
          strokeWidth="1.5"
        />

        {/* Mouth */}
        <path d={mouthPath} fill="none" stroke="#333" strokeWidth="2" />
      </svg>
    </div>
  );
};
