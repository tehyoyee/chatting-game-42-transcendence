'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react';
import User from '@/components/user/user';
import { useAuthContext } from '@/components/user/auth';
import styles from '/styles/profile.module.css';

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

export default function Profile() {
  const { loggedIn } = useAuthContext();
	const [ profile, setProfile ] = useState();

	useEffect(() => {
		(async() => {
			await fetch(profileUrl, {
				method: 'GET',
				credentials: 'include',
			})
			.then(res => res.json)
			.then(data => {console.log(data)})
			.catch(err => {
				console.log(`${profileUrl}: fetch failed: ${err}`);
			});
		})()
	}, [profile]);
  const userProps = [
    {
      prop: "name",
      value: "value",
    },
    {
      prop: "email",
      value: "a@b.com",
    },
  ];

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
					<UploadBtn callback={uploadImage}>
						Upload image
					</UploadBtn>
					<UploadBtn callback={updateName}>
						Update Name
					</UploadBtn>
				</ul>
				</div>
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
