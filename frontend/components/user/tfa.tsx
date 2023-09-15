'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import style from '../../styles/tfa.module.css';
import { LoginData } from '@/components/user/callback';
import { useAuthContext } from '@/components/user/auth';

const authUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/auth/twofactor`

export default function Tfa({ loginData }: { loginData: LoginData }) {
  const [message, setMessage] = useState('');
	const { loggedIn, updateLoginState } = useAuthContext();
	const [inputField, setInputField] = useState(document.querySelector("input"));
	const router = useRouter();

	useEffect(() => {
		setInputField(document.querySelector("input"));
	}, []);

  const checkAuthCode = useCallback(async () => {
		console.log(`checkAuthCode=${inputField}`)
		if (!inputField) return;
		const code = inputField.value;
    try {
			if (code.length !== 6) {
				setMessage("유효하지 않은 코드입니다.");
				return;
			}
			setMessage("잠시만 기다려주세요.");
      const res = await fetch(`${authUrl}?inputCode=${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
				},
				credentials: 'include',
        body: JSON.stringify(loginData),
			})
			.then(res => res.json());
			console.log(`res=${res.state}`);
			if (res.state !== true) {
				setMessage('인증 실패');
			} else {
				router.push('/');
			}
		} catch (error) {
			console.error('인증 요청 중 오류 발생:', error);
			setMessage('인증 요청 중 오류 발생');
		}
  }, [loggedIn, updateLoginState, router]);

  const handleEnterKey = (e: any) => {
		if (e.key === 'Enter') {
			checkAuthCode();
		}
	};

  return (
    <div className={style.tfa}>
      <h1>인증 코드 입력</h1>
      <input className={style.tfaInput}
        type="text"
        placeholder="6자리 코드를 입력해주세요"
        onKeyDown={handleEnterKey}
        maxLength={6} />
      <button onClick={checkAuthCode} className={style.tfaConfirm}>확인</button>
      <div>{message}</div>
    </div>
  );
}
