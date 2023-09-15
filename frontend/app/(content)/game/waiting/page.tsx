import Image from 'next/image';
import styles from '@/styles/profile.module.css'
import Link from 'next/link';
import d from '/frontend/public/default.png'
import { useAuthContext } from '@/components/user/auth';
import { useEffect, useState } from 'react';
export default function Page() {
  // const [match, setMatch] = useState(false);

  // useEffect(() => {
  //   (async() => {
  //     fetch('http://localhost:3000/game/math', {
  //       method: 'POST',
  //       credentials: 'include',
  //     })
  //     .then(res => res.json())
  //     .then(data => {
  //         setMatch(true);
  //     })
  //     .catch(err => {

  //     })
  //   })()
  // })

  return (
  <>
    {/* <div className="centerItemBlock gridRow1_2 gridCol1_2">
        <Image
          className={`${styles.profileImage}`}
          src={'/default.png'}
          height={128}
          width={128}
          alt={"profile image"} />
      </div>

    {match && <div className="centerItemBlock gridRow1_2 gridCol1_2">
      <Image
        className={`${styles.profileImage}`}
        src={'/default.png'}
        height={128}
        width={128}
        alt={"profile image"} />
    </div>} */}

  </>
  );
}
