'use client'

import { useRef, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext, useAuthContext } from '@/components/auth';

const serverUrl = process.env.APP_SERVER_URL;
const tokenUrl = `${serverUrl}/auth/token`;

export default function Callback() {
  const called = useRef(false);
  const { loggedIn, checkLoginState } = useAuthContext();
  const router = useRouter();
  useEffect(() => {
    if (loggedIn === true) {
      router.push('/');
    }
    if (called.current) return; // prevent re-render caused by strict mode
    called.current = true;
    fetch(`${tokenUrl}${window.location.search}`, {
      method: 'GET'
    })
    .then(res => res.json())
    .then(data => { // TODO: remove after check
      console.log(`response: ${data}`);
    })
    .catch(reason => {
      console.log(`${tokenUrl}: fetch failed: ${reason}`);
    });
    router.push('/');
  }, [ checkLoginState, loggedIn, router]);
  return <></>;
}
