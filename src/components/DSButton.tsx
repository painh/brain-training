import type { ButtonHTMLAttributes } from 'react';
import styles from './DSButton.module.css';

interface DSButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary';
  size?: 'small' | 'medium' | 'large';
}

export const DSButton = ({
  variant = 'default',
  size = 'medium',
  className = '',
  children,
  ...props
}: DSButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
