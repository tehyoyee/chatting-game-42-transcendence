'use client';

import { useState, useCallback, SetStateAction } from 'react';
import styles from '../../styles/tfa.module.css';
import { LoginData } from '@/components/user/callback';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';
import { setTimeout } from 'timers';

export default function Tfa({ loginData }: { loginData: LoginData }) {
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState('');
	const router = useRouter();
	const { loggedIn, updateLoginState } = useAuthContext();

  const handleChange = useCallback((e: { target: { value: SetStateAction<string>; }; }) => {
    setInputCode(e.target.value);
  }, []);

  const checkAuthCode = useCallback(async (code: any) => {
    try {
      const response = await fetch(`http://localhost:3000/auth/twofactor?inputCode=${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
				credentials: 'include',
        body: JSON.stringify(loginData),
      });

			console.log("response arrived");
			await updateLoginState();
			console.log(`loggedIn=${loggedIn}`);
      setMessage('');
      if (loggedIn === true) {
				router.push('/');
      } else {
        setMessage('입력하신 코드가 올바르지 않습니다');
        setTimeout(() => {
          setMessage('');
        }, 3000);
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

	// frequent callback refresh -> refresh overhead caching advantage?
  const handleButtonClick = useCallback(() => {
    checkAuthCode(inputCode);
  }, [checkAuthCode, inputCode]);
  
  return (
    <>
    <hr></hr>
    <div className={styles.tfa}>
    <div className={styles.tfaFail}>{message}</div>
      <h1 className={styles.tfaFont}>{!message && '인증 코드 입력'}</h1>
      <input className={styles.tfaInput}
        type="text"
        value={inputCode}
        placeholder="6자리 코드를 입력해주세요."
        onChange={handleChange}
        onKeyDown={handleEnterKey}
        maxLength={6}
      />
      <button onClick={handleButtonClick} className={styles.tfaConfirm}>확인</button>
    </div>
      </>
  );
}
