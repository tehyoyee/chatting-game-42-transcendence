import Link from "next/link";
import styles from "../../styles/game.module.css"
import BackToTop from "./backToTop";
import Matching from '../../components/content/matching';
import usePlayerContext, { EPlayerState } from "./player_state";
import { useEffect } from "react";


export default function Game() {
	const { setPlayerState } = usePlayerContext();

	useEffect(() => {
		setPlayerState(EPlayerState.GAME);
	}, []);
  

  return (
    <>
      <div className={styles.body}>
      <br></br>
      <br></br>
      <br></br>
        <h1 className={styles.h1}>기본 모드</h1>
        <p className={styles.p}>기본 속도</p>
        <div className={styles.frame}>
          <Link href={{ pathname: '/game/matching', query: {normal: 'NORMAL'}}} className={`${styles.button} ${styles.customBtn} ${styles.btn1}`}>
            <span>Game Start</span>
          </Link>
        </div>
      </div>

      <div className={styles.body}>
      <br></br>
      <br></br>
      <br></br>
        <h1 className={styles.h1}>가속 모드</h1>
        <p className={styles.p}>빠른 속도</p>
        <div className={styles.frame}>
          <Link href={{ pathname: '/game/matching', query: {advanced: 'ADVANCED'}}} className={`${styles.button} ${styles.customBtn} ${styles.btn2}`}>
            <span>Game Start</span>
          </Link>
        </div>
      </div>
      <BackToTop></BackToTop>
    </>
  );
}
