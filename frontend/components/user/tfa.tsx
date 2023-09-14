'use client';

import { useState, useCallback, SetStateAction } from 'react';
import style from '../../styles/tfa.module.css';


export default function Tfa() {
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = useCallback((e: { target: { value: SetStateAction<string>; }; }) => {
    setInputCode(e.target.value);
  }, []);

  const checkAuthCode = useCallback(async (code: any) => {
    try {
      const response = await fetch('/api/checkAuthCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.success ? '인증 성공' : '인증 실패');
      } else {
        setMessage('인증 실패');
      }
    } catch (error) {
      console.error('인증 요청 중 오류 발생:', error);
      setMessage('인증 요청 중 오류 발생');
    }
  }, []);

  const handleEnterKey = useCallback(
    (e: { key: string; }) => {
      if (e.key === 'Enter') {
        checkAuthCode(inputCode);
      }
    },
    [checkAuthCode, inputCode]
  );

  const handleButtonClick = useCallback(() => {
    checkAuthCode(inputCode);
  }, [checkAuthCode, inputCode]);

  return (
    <div className={style.tfa}>
      <h1>인증 코드 입력</h1>
      <input className={style.tfaInput}
        type="text"
        value={inputCode}
        placeholder="6자리 코드를 입력해주세요"
        onChange={handleChange}
        onKeyDown={handleEnterKey}
        maxLength={6}
      />
      <button onClick={handleButtonClick} className={style.tfaConfirm}>확인</button>
      <div>{message}</div>
    </div>
  );
}
