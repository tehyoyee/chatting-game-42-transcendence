'use client'

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from '/styles/logout.module.css';
import useAuthContext from '@/components/user/auth';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const logoutUrl = `${serverUrl}/auth/signout`;

// TODO: should logout request has to be sent to remove cookie?
// ERROR: too many refresh occurs in short time and it causes fatal error

export default function Logout() {
  const { loggedIn, updateLoginState } = useAuthContext();
  const router = useRouter();

  console.log("logout rerender");
	const handleLogout = useCallback(async() => {
    if (!loggedIn) {
      alert("Not logged in currently");
      return;
    }
    if (!confirm("confirm sign out")) return;
    await fetch(logoutUrl, {
      method: 'GET',
      credentials: 'include',
    })
		.then(res => {
			if (!res.ok) throw new Error(`invalid response: ${res.status}`);
		})
		.catch(err => {
			console.log(err);
		});
		sessionStorage.removeItem('tfa');
		document.cookie = '';
    await updateLoginState();
    router.push('/');
  }, []);
  return (
    <>
      {loggedIn && <button className={styles.logoutBtn} type="button" onClick={(e) => {e.preventDefault(); handleLogout()}}>log out</button>}
    </>
  );
}
