// components/LoadingBar.tsx
import React from 'react';
import styles from '../styles/deworkexports.module.css';

interface LoadingBarProps {
  current: number;
  total: number;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div>
      <div className={styles.loadingBarContainer}>
        <div 
          className={styles.loadingBarFill}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className={styles.loadingText}>
        Loading workspaces: {current} / {total}
      </div>
    </div>
  );
};