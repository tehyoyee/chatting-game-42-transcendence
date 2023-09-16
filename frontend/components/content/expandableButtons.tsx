'use client';

import React, { useState } from 'react';
import styles from '../../styles/profile.module.css';

const ExpandableButtons = () => {
  const [activeButton, setActiveButton] = useState(null);

  const toggleButton = (buttonText: any) => {
    if (activeButton === buttonText) {
      setActiveButton(null);
    } else {
      setActiveButton(buttonText);
    }
  };

  return (
    <div>
      <div className={styles.buttonWrapper}>
        <button
          className={`centerItemBlock ${styles.infoBox}`}
          onClick={() => toggleButton('최근 경기 기록')}
        >
          최근 경기 기록
        </button>
        {activeButton === '최근 경기 기록' && (
          <div className="buttonContent">
            최근 경기 기록 내용
          </div>
        )}
      </div>

      <div className={styles.buttonWrapper}>
        <button
          className={`centerItemBlock ${styles.infoBox}`}
          onClick={() => toggleButton('게임 전적')}
        >
          게임 전적
        </button>
        {activeButton === '게임 전적' && (
          <div className="buttonContent">
            게임 전적 내용
          </div>
        )}
      </div>

      <div className={styles.buttonWrapper}>
        <button
          className={`centerItemBlock ${styles.infoBox}`}
          onClick={() => toggleButton('순위')}
        >
          순위
        </button>
        {activeButton === '순위' && (
          <div className="buttonContent">
            순위 내용
          </div>
        )}
      </div>

      <div className={styles.buttonWrapper}>
        <button
          className={`centerItemBlock ${styles.infoBox}`}
          onClick={() => toggleButton('업적')}
        >
          업적
        </button>
        {activeButton === '업적' && (
          <div className="buttonContent">
            업적 내용
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableButtons;
