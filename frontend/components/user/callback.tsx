'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthContext from '@/components/user/auth';
import Tfa from '@/components/user/tfa';

const serverUrl = process.env.NEXT_PUBLIC_APP_SERVER_URL;
const tokenUrl = `${serverUrl}/auth/signup`;

export type LoginData = {
	id: number,
	firstLogin: boolean,
	two_factor: boolean,
};

export default function Callback() {
  const { loggedIn, updateLoginState } = useAuthContext();
  const called = useRef(false);
  const router = useRouter();
	const [tfa, setTfa] = useState(false);
	const [firstLogin, setFirstLogin] = useState<boolean>(false);
	const [loginData, setLoginData] = useState<LoginData>({
		// NOTE: is initialization value OK?
		id: -1,
		firstLogin: true,
		two_factor: true,
	});

  useEffect(() => {
    (async() => {
      if (loggedIn === true) {
        router.push('/profile');
        return;
      }
      if (called.current) return; // NOTE: prevent re-render caused by strict mode
      called.current = true;

      const searchParams = new URLSearchParams(document.location.search);
    
      if (searchParams.get('code') == null) return;

      await fetch(`${tokenUrl}${window.location.search}`, {
        method: 'GET',
        credentials: 'include',
      })
			.then(res => {
				if (!res.ok) throw new Error(`response is not ok: ${res.status}`);
				return res.json()
			})
			.then(res => {
				console.log('res: ', res);
				if (res.two_factor === true) {
					setFirstLogin(res.firstLogin);
					setLoginData(res);
					setTfa(true);
					sessionStorage.setItem('tfa', 'true');
					return;
				} 
				else if (res.firstLogin === true) {
					router.push('/profile?firstLogin=true');
					return;
				}
				router.push('/');
			})
      .catch(reason => {
        console.log(`${tokenUrl}: fetch failed: ${JSON.stringify(reason)}`);
				router.push('/');
      });
//      await updateLoginState();
    })()
  }, [updateLoginState, loggedIn, router]);
  return (
		<>
			{tfa && <Tfa loginData={loginData} firstLogin={firstLogin}></Tfa>}
		</>
	);
}
