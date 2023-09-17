'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../styles/dotLoader.module.css';


const DotLoader = () => {
  const [loadingText, setLoadingText] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown === 0) {
        setLoadingText('');
        setCountdown(3);
      } else {
        setCountdown(countdown - 1);
        setLoadingText(loadingText + '. ');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, loadingText]);

  return (
    <div className={styles.dotLoader}>
      <p>{loadingText}</p>
    </div>
  );
};

export default DotLoader;
