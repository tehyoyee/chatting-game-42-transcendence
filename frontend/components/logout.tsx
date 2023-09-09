'use client'

import styles from '/styles/logout.module.css';
import { useRouter } from 'next/navigation';
import useToken from '../lib/useToken';

export default function Logout() {
  const {token, setToken} = useToken();
  const router = useRouter();

  function showModal() {
    if (!token) {
      alert("Not logged in currently");
      return;
    }
    if (confirm("confirm")) {
      localStorage.removeItem('token');
      setToken(null);
      router.push('/');
    }
  }
  return (
    <>
      <button className={styles.logoutBtn} type="button" onClick={showModal}>log out</button>
    </>
  );
}
