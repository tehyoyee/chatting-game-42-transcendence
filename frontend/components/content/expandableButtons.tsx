'use client';

import React, { useState } from 'react';
import styles from '../../styles/profile.module.css';

const ExpandableButtons = () => {
  const [activeButton1, setActiveButton1] = useState('');
  const [activeButton2, setActiveButton2] = useState('');
  const [activeButton3, setActiveButton3] = useState('');
  const [activeButton4, setActiveButton4] = useState('');

  const toggleButton1 = (buttonText: any) => {
    if (activeButton1 === buttonText) {
      setActiveButton1('');
    } else {
      setActiveButton1(buttonText);
    }
  };
  const toggleButton2 = (buttonText: any) => {
    if (activeButton2 === buttonText) {
      setActiveButton2('');
    } else {
      setActiveButton2(buttonText);
    }
  };
  const toggleButton3 = (buttonText: any) => {
    if (activeButton3 === buttonText) {
      setActiveButton3('');
    } else {
      setActiveButton3(buttonText);
    }
  };
  const toggleButton4 = (buttonText: any) => {
    if (activeButton4 === buttonText) {
      setActiveButton4('');
    } else{
      setActiveButton4(buttonText);
    }
  };

  return (
    <div>
      <div className={styles.buttonWrapper}>
        <button
          className={`centerItemBlock ${styles.infoBox}`}
          onClick={() => toggleButton1('최근 경기 기록')}
        >
          최근 경기 기록
        </button>
        {activeButton1 === '최근 경기 기록' && (
          <div className={styles.buttonContent}>
            최근 경기 기록 내용
          </div>
        )}
        {activeButton1 === '' && (<div className={styles.buttonContentFadeOut}>
          최근 경기 기록 내용
      </div>)}
      </div>

      <div className={styles.buttonWrapper}>
        <button
          className={`centerItemBlock ${styles.infoBox}`}
          onClick={() => toggleButton2('게임 전적')}
        >
          게임 전적
        </button>
        {activeButton2 === '게임 전적' && (
          <div className={styles.buttonContent}>
            게임 전적 내용
          </div>
        )}
        {activeButton2 === '' && (<div className={styles.buttonContentFadeOut}>
          게임 전적 내용
      </div>)}
      </div>

      <div className={styles.buttonWrapper}>
        <button
          className={`centerItemBlock ${styles.infoBox}`}
          onClick={() => toggleButton3('순위')}
        >
          순위
        </button>
        {activeButton3 === '순위' && (
          <div className={styles.buttonContent}>
            순위 내용
          </div>
        )}
        {activeButton3 === '' && (<div className={styles.buttonContentFadeOut}>
        순위 내용
      </div>)}
      </div>

      <div className={styles.buttonWrapper}>
        <button
          className={`centerItemBlock ${styles.infoBox}`}
          onClick={() => toggleButton4('업적')}
        >
          업적
        </button>
        {activeButton4 === '업적' && (
          <div className={styles.buttonContent}>
            업적 내용
          </div>
        )}
        {activeButton4 === '' && (<div className={styles.buttonContentFadeOut}>
        업적 내용
      </div>)}
      </div>
    </div>
  );
        }

export default ExpandableButtons;
