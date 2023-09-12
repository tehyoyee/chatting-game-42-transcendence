'use client'

import styles from '/styles/logout.module.css';
import { useAuthContext } from '@/components/user/auth';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const logoutUrl = `${serverUrl}/auth/signout`;

// TODO: logout should send logout request to remove cookie

export default function Logout() {
	const { loggedIn, updateLoginState } = useAuthContext();

  async function handleLogout() {
		await updateLoginState(); // for TEST
    if (!loggedIn) {
      alert("Not logged in currently");
      return;
    }
		if (!confirm("confirm sign out")) return;
		await fetch(logoutUrl, {
			method: 'GET',
			credentials: 'include',
		})
		.then(() => {
			updateLoginState();
		})
		.catch(err => {
			console.log(err);
		});
  }
  return (
    <>
      <button className={styles.logoutBtn} type="button" onClick={handleLogout}>log out</button>
    </>
  );
}
