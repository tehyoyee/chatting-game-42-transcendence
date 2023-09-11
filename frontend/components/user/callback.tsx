'use client'

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';

const serverUrl = process.env.NEXT_PUBLIC_APP_SERVER_URL;
const tokenUrl = `${serverUrl}/auth/signup`;

export default function Callback() {
  const called = useRef(false);
  const { loggedIn, updateLoginState } = useAuthContext();
  const router = useRouter();
  useEffect(() => {
    if (loggedIn === true) {
      router.push('/');
    }
    if (called.current) return; // prevent re-render caused by strict mode

    const searchParams = new URLSearchParams(document.location.search);
  
    if (searchParams.get('code') == null) return;

    called.current = true;
    fetch(`${tokenUrl}${window.location.search}`, {
      method: 'GET',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => { // debuggin log
      updateLoginState();
      console.log(`response: ${data}`);
    })
    .catch(reason => {
      console.log(`${tokenUrl}: fetch failed: ${reason}`);
    });
    router.push('/');
  }, [ updateLoginState, loggedIn, router]);
  return <></>;
}
