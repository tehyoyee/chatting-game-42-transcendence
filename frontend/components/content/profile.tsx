'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from '/styles/profile.module.css';

// incomplete
interface IProfileType {
	user_id: number,
	username: string,
	nickname: string,
	avartar: string, // path to profile image stored in frontend server local directory
	email: string,
};

const profileUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/profile`;

function uploadImage() {
  alert("upload image");
}

function updateName () {
  alert("update name");
}

function UploadBtn({ callback, children }: { callback: any, children: any}) {
  return (
    <button
      className={`${styles.profileUpdateBtn}`}
      type="button"
      onClick={callback}>
      {children}
    </button>
  );
}

export default function Profile({ uid }: { uid: number }) {
  const [ profile, setProfile ] = useState<IProfileType>();

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
  }, [profile]);
	//////////////////////////////
  const userProps = [
    {
      prop: "id",
      value: profile?.user_id,
    },
    {
      prop: "username",
      value: profile?.username,
    },
    {
      prop: "nickname",
      value: profile?.nickname,
    },
    {
      prop: "email",
      value: profile?.email,
    },
  ];
	//////////////////////////////

//  const { recentMatchHistory, matchRecord, ranking, archivement } = pullProfileData();

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
			<ProfileUpdator></ProfileUpdator>
      <div
        className="centerItemBlock"
      >
      최근 경기 기록
      </div>
      <div
        className="centerItemBlock"
      >
      게임 전적
      </div>
      <div
        className="centerItemBlock"
      >
      순위
      </div>
      <div
        className="centerItemBlock"
      >
      업적
      </div>
    </>
  );
}

function ProfileUpdator() {
	return (
		<div
			id="profileUpdator"
			style={{
				borderWidth: '1px',
				borderStyle: 'solid',
				borderColor: 'black',
				borderRadius: '0.3rem',
				display: "flex",
				alignItems: "center",
				gridRow: "1 / 2",
				gridColumn: "4 / 5",
			}}>
			<ul>
				<li>
					<label>
						two factor auth:
					</label>
					<input type='checkbox' checked></input>
					<button>submit</button>
				</li>
				<UploadBtn callback={uploadImage}>
					Upload image
				</UploadBtn>
				<UploadBtn callback={updateName}>
					Update Name
				</UploadBtn>
				<br></br>
					<button>적용</button>
			</ul>
		</div>
	);
}
