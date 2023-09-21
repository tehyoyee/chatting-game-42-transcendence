'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from '/styles/profile.module.css';
import ProfileUpdator from '@/components/content/profile_updator';
import ExpandableButtons from './expandableButtons';
import BackToTop from './backToTop';

// incomplete
export interface IProfileType {
	user_id: number,
	username: string,
	nickname: string,
	avartar: string, // path to profile image stored in frontend server local directory
	email: string,
};

export enum UserAchievement {
  A0 = '',
  A1 = 'WIN 1',
  A2 = 'WIN 3',
  A3 = 'WIN 5'
};

export interface IGameProfileType {
  win_count: number,
  lose_count: number,
  point: number,
  achievement: UserAchievement,
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
  const [ gameProfile, setGameProfile ] = useState<IGameProfileType>({
    win_count: 0,
    lose_count: 0,
    point: 0,
    achievement: UserAchievement.A0,
	});
  
	// const [ updateGame, setGameUpdate ] = useState<Object | null>(null);

  useEffect(() => {
    (async() => {
      await fetch(`${profileUrl}/${uid}`, {
        method: 'GET',
        credentials: 'include',
      })
      .then(res => res.json())
      .then(data => {setGameProfile(data)})
      .catch(err => {
        console.log(`${profileUrl}: fetch failed: ${err}`);
      });
    })()
  }, []);

  return (
    <>
    {isMyProfile &&
				// NOTE: it doesn't re-render when setProfile is called.
      <ProfileUpdator
        uid={uid}
        name={profile.nickname}
        update={{setUpdate}}
      ></ProfileUpdator>}
      <div className={`${"centerItemBlock gridRow1_2 gridCol1_2"} ${styles.profileImage}`}>
        <Image
          src={'/default.png'}
          height={128}
          width={128}
          alt={"profile image"} />
      </div>
      <br></br>
        <ul>
          {userProps.map(({ prop, value }) => {
            return (
              <li className={styles.userProps} key={prop}>
                {prop}: {value}
              </li>
            );
          })}
          <br />
        </ul>
        <hr></hr>
      <ExpandableButtons
        win_count={gameProfile.win_count}
        lose_count={gameProfile.lose_count}
        point={gameProfile.point}
        achievement={gameProfile.achievement}
      ></ExpandableButtons>
      <BackToTop></BackToTop>
    </>
  );
}

