'use client';

import React, { useState } from 'react';
import styles from '../../styles/profile.module.css';

const buttonData = [
  { text: '최근 경기 기록', content: '최근 경기 기록 내용' },
  { text: '게임 전적', content: '게임 전적 내용' },
  { text: '순위', content: '순위 내용' },
  { text: '업적', content: '업적 내용' },
];

const ExpandableButtons = () => {
  const initialState = buttonData.map(obj => obj.text);
  const [activeButtons, setActiveButtons] = useState(initialState);

  const toggleButton = (index: number) => {
    setActiveButtons((prevActiveButtons) => {
      const newActiveButtons = [...prevActiveButtons];
      newActiveButtons[index] = prevActiveButtons[index] === '' ? buttonData[index].text : '';
      return newActiveButtons;
    });
  };

  return (
    <div>
      {buttonData.map((button, index) => (
        <div key={index} className={styles.buttonWrapper}>
          <button
            className={`centerItemBlock ${styles.infoBox}`}
            onClick={() => toggleButton(index)}
          >
            {button.text}
          </button>
          {activeButtons[index] === button.text && (
            <div className={styles.buttonContent}>{button.content}</div>
          )}
          {activeButtons[index] === '' && (
            <div className={styles.buttonContentFadeOut}>{button.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExpandableButtons;
