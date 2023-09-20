'use client';

import React, { useState } from 'react';
import styles from '../../styles/profile.module.css';

/*
 * 1. 임의의 자료구조를 만든다. API가 구현 안되어있으면 더미 데이터를 만들고 6번으로 간다.
 * 2. 임의의 URL을 정한다.
 * 3. 임의의 method를 정한다.
 * 4. URL, method를 사용해서 fetch하고,
 * 5. then() 안에서 예외처리, 자료구조에 맞게 데이터 가져온다.
 * 6. 데이터를 출력하는 컴포넌트를 만든다.
 * /

/*
  const test: ChatRooms = {
    curRoomId: 2,
    chatRoomArr: [
      { id: 1, name: "abc" },
      { id: 2, name: "XYZ" },
      { id: 3, name: "ijk" },
    ]
  };
	useEffect(() => {
		// fetch channel list and update state
		//  const [chatRooms, setChatRooms] = useFetch(chatReqUrl, test);
	}, []);
	const [curRoomId, setCurRoomId] = useState(chatRooms?.curRoomId);
*/

type RecentMatch = {

};

type MatchHistory = {
};

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
