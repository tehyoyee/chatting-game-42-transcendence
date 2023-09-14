'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';
import Tfa from '@/components/user/tfa';

const serverUrl = process.env.NEXT_PUBLIC_APP_SERVER_URL;
const tokenUrl = `${serverUrl}/auth/signup`;

export type LoginData = {
	id: number,
	firstLogin: boolean,
	two_factor: boolean,
};

export default function Callback() {
  const called = useRef(false);
  const { loggedIn, updateLoginState } = useAuthContext();
  const router = useRouter();
	const [tfa, setTfa] = useState(false);
	const [loginData, setLoginData] = useState<LoginData>({
		// NOTE: is initialization value OK?
		id: -1,
		firstLogin: true,
		two_factor: true,
	});

	function handleLogin({ res }: { res: LoginData }) {
		if (res.two_factor === true) {
			setLoginData(res);
			setTfa(true);
			return;
		} else if (res.firstLogin === true) {
			router.push('/login/setprofile');
		}
	}

  useEffect(() => {
    (async() => {
      if (loggedIn === true) {
        router.push('/');
        return;
      }
      if (called.current) return; // NOTE: prevent re-render caused by strict mode
      called.current = true;

      const searchParams = new URLSearchParams(document.location.search);
    
      if (searchParams.get('code') == null) return;

      const res = await fetch(`${tokenUrl}${window.location.search}`, {
        method: 'GET',
        credentials: 'include',
      })
			.then(res => res.json())
			.then(data => {
					if (!data.ok) throw new Error(`response is not ok: ${data}`);
					return data;
			})
      .catch(reason => {
        console.log(`${tokenUrl}: fetch failed: ${reason}`);
      });
			handleLogin(res);
      await updateLoginState();
      router.push('/');
    })()
  }, [updateLoginState, loggedIn/*, router*/]);
  return (
		<>
			{tfa && <Tfa loginData={loginData}></Tfa>}
		</>
	);
}
