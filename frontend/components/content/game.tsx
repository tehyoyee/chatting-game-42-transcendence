import Link from "next/link";
import styles from "../../styles/game.module.css"

export default function Game() {

  return (
    <>
      <div className={styles.body}>
      <br></br>
      <br></br>
      <br></br>
        <h1 className={styles.h1}>기본 모드</h1>
        <p className={styles.p}>기본 속도</p>
        <div className={styles.frame}>
          <Link href='/game/waiting' className={`${styles.button} ${styles.customBtn} ${styles.btn1}`}>
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
          <Link href='/game/waiting' className={`${styles.button} ${styles.customBtn} ${styles.btn2}`}>
            <span>Game Start</span>
          </Link>
        </div>
      </div>
    </>
  );
}
