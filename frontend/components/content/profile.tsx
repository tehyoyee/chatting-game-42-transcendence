'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from '/styles/profile.module.css';
import ProfileUpdator from '@/components/content/profile_updator';

// incomplete
export interface IProfileType {
	user_id: number,
	username: string,
	nickname: string,
	avartar: string, // path to profile image stored in frontend server local directory
	email: string,
};

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const profileUrl = `${serverUrl}/profile`;

export default function Profile({ uid, isMyProfile }: { uid: number, isMyProfile: boolean }) {
  const [ profile, setProfile ] = useState<IProfileType>({
		user_id: 0,
		username: '',
		nickname: '',
		avartar: '',
		email: '',
	});
	const [ update, setUpdate ] = useState<Object | null>(null);

  useEffect(() => {
    (async() => {
      await fetch(`${profileUrl}/${uid}`, {
        method: 'GET',
        credentials: 'include',
      })
      .then(res => res.json())
      .then(data => {setProfile(data)})
      .catch(err => {
        console.log(`${profileUrl}: fetch failed: ${err}`);
      });
    })()
  }, [update]);
	//////////////////////////////
  const userProps = [
    {
      prop: "username",
      value: profile.username,
    },
    {
      prop: "nickname",
      value: profile.nickname,
    },
    {
      prop: "email",
      value: profile.email,
    },
  ];
	//////////////////////////////

  return (
    <>
      <div className="centerItemBlock gridRow1_2 gridCol1_2">
        <Image
          className={`${styles.profileImage}`}
          src={'/default.png'}
          height={128}
          width={128}
          alt={"profile image"} />
      </div>
      <div 
				className={`${styles.infoBox}`}
        style={{
					display: "flex",
          alignItems: "center",
          gridRow: "1 / 2",
          gridColumn: "2 / 4",
        }}>
        <ul>
          {userProps.map(({ prop, value }) => {
             return (
							<li key={prop}>
								{prop}: {value}
							</li>
						);
 					})}
          <br />
        </ul>
      </div>
			{isMyProfile &&
				<ProfileUpdator 
					uid={uid} 
					name={profile.nickname} 
					update={{setUpdate}}
				></ProfileUpdator>}
      <div
        className={`centerItemBlock ${styles.infoBox}`}
      >
      최근 경기 기록
      </div>
      <div
        className={`centerItemBlock ${styles.infoBox}`}
      >
      게임 전적
      </div>
      <div
        className={`centerItemBlock ${styles.infoBox}`}
      >
      순위
      </div>
      <div
        className={`centerItemBlock ${styles.infoBox}`}
      >
      업적
      </div>
    </>
  );
}
