'use client';

import Image from 'next/image';
import Link from 'next/link';
import defaultImage from '../../public/default.png';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/matching.module.css';

export default function Matching() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleReady = () => {
    setReady(true);
  };

  useEffect(() => {
    if (ready) {
      const countdownInterval = setInterval(() => {
        if (countdown <= 1) {
          clearInterval(countdownInterval);
          router.push('https://www.naver.com');
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);
    }
  }, [ready, countdown, router]);

  return (
    <div>
      <div className={styles.userProfileContainer}>
        <div className={styles.userProfile}>
          <Image src={defaultImage} alt='profile image' className={styles.userImage} />
          <div className={styles.userText}>user1</div>
        </div>
        <div className={styles.userProfile}>
          <Image src={defaultImage} alt='profile image' className={styles.userImage} />
          <div className={styles.userText}>user2</div>
        </div>
      </div>
      {loading && <p>Loading...</p>}
      {!loading && !ready && (
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={() => setReady(true)}>Ready</button>
        </div>
      )}
      {countdown !== null && ready && countdown > 0 && (
        <div className={styles.countdownContainer}>
          <p className={styles.countdown}>{countdown}</p>
        </div>
      )}
        <div>
          <Link href='/game' className={styles.bottomRight}>Exit</Link>
        </div>
    </div>
  );
}
