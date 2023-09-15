'use client';

import { useState, useCallback, SetStateAction } from 'react';
import styles from '../../styles/tfa.module.css';
import { LoginData } from '@/components/user/callback';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';

export default function Tfa({ loginData }: { loginData: LoginData }) {
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState('');
  // const [messageFail, setMessageFail] = useState('');
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
      if (loggedIn === true) {
        // setMessage('인증 성공');
				router.push('/');
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

	// frequent callback refresh -> refresh overhead caching advantage?
  const handleButtonClick = useCallback(() => {
    checkAuthCode(inputCode);
  }, [checkAuthCode, inputCode]);

  return (
    <>
    <div className={styles.tfaContainer}>
      <h1 className={styles.tfaPhrase}>인증 코드 입력</h1>
      <input type="text"
        value={inputCode}
        placeholder="6자리 코드를 입력해주세요."
        onChange={handleChange}
        onKeyDown={handleEnterKey}
        maxLength={6} className={styles.tfaInput} />
      <button onClick={handleButtonClick} className={styles.tfaButton}>확인</button>
      <div className={styles.tfaResult}>{message}</div>
    </div>
</>
  );
}
