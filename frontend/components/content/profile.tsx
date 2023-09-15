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

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const profileUrl = `${serverUrl}/profile`;

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
  }, []);
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
			<ProfileUpdator uid={uid}></ProfileUpdator>
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

function ProfileUpdator({ uid }: { uid: number }) {
	const tfaUpdateUrl = `${serverUrl}/updateTFA/${uid}`;
	const [checked, setChecked] = useState<string | null>(sessionStorage.getItem('tfa'));

	useEffect(() => {
		setChecked(sessionStorage.getItem('tfa'));
	}, []);

	const handleToggle = async() => {
		const state = document.querySelector('input')?.checked;
		fetch(`${tfaUpdateUrl}/${state ? "true" : "false"}`, {
			method: 'PATCH',
			credentials: 'include',
		})
			.then(res => {
					// NOTE: get 2fa info from backend?
				if (!res.ok) throw new Error(`invalid response: ${res.status}`);
				const result = state ? "true" : "false";
				localStorage.setItem('tfa', result);
				setChecked(result);
				console.log(`tfa updated result=${result}`);
			})
			.catch(err => {
				console.log(`${tfaUpdateUrl}: fetch error: ${err}`);
			});
	};
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
					<label htmlFor='tfaCheckbox'>
						2-factor Authentication
					</label>
					<input
						style={{
							margin: "4px",
						}}
						onChange={() => {handleToggle()}}
						defaultChecked={checked === "true"}
						id='tfaCheckbox' type='checkbox'></input>
				</li>
				<li>
				<UploadBtn callback={uploadImage}>
					Upload image
				</UploadBtn>
				</li>
				<li>
				<UploadBtn callback={updateName}>
					Update Name
				</UploadBtn>
				</li>
			</ul>
		</div>
	);
}
