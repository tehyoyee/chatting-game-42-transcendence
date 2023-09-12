'use client'

import { useRouter } from 'next/navigation';
import styles from '/styles/logout.module.css';
import { useAuthContext } from '@/components/user/auth';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const logoutUrl = `${serverUrl}/auth/signout`;

// TODO: logout should send logout request to remove cookie

export default function Logout() {
	const { loggedIn, updateLoginState } = useAuthContext();
	const router = useRouter();

	console.log("logout rerender");
  async function handleLogout() {
    if (!loggedIn) {
      alert("Not logged in currently");
      return;
    }
		if (!confirm("confirm sign out")) return;
		await fetch(logoutUrl, {
			method: 'GET',
			credentials: 'include',
		})
		.catch(err => {
			console.log(err);
		});
		await updateLoginState();
		router.push('/');
  }
  return (
    <>
			{loggedIn && <button className={styles.logoutBtn} type="button" onClick={handleLogout}>log out</button>}
    </>
  );
}
