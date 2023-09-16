'use client'

import React, { createContext, useContext, Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import styles from '@/styles/profile.module.css';
import Modal from '@/components/structure/modal';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;

type UpdateType = {
	setUpdate: Dispatch<SetStateAction<Object>>,
}

const UpdateContext = createContext<UpdateType | null>(null);

function UploadBtn({ children, title }: { children: React.ReactNode, title: string}) {
	const [showModal, setShowModal] = useState(false);
	const update = useContext(UpdateContext);

	useEffect(() => {
		update?.setUpdate({});
		console.log(`setupdateed showModal=${showModal}`);
	}, [showModal]);
  return (
		<>
			<button
				className={`${styles.profileUpdateBtn}`}
				type="button"
				onClick={(e) => {e.preventDefault(); setShowModal(true)}}>
				{title}
			</button>
			{showModal &&
				<Modal 
					style={{
						height: "200px",
						width: "400px",
					}}
					onClose={() => setShowModal(false)}>
					{children}
				</Modal>
			}
		</>
  );
}

export default function ProfileUpdator({
	uid, 
	name, 
	update
}: {
	uid: number,
	name: string,
	update: {
		setUpdate: Dispatch<SetStateAction<Object>>,
	}
}) {
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
			<UpdateContext.Provider value={update}>
				<ul>
					<li>
						<NameUpdator uid={uid} name={name}></NameUpdator>
					</li>
					<li>
						<ImgUpdator uid={uid}></ImgUpdator>
					</li>
					<li>
						<TfaUpdator uid={uid}></TfaUpdator>
					</li>
				</ul>
			</UpdateContext.Provider>
		</div>
	);
}

function TfaUpdator({ uid }: { uid: number }) {
	const tfaUpdateUrl = `${serverUrl}/updateTFA/${uid}`;
	const [state, setState] = useState<boolean | null>(sessionStorage.getItem('tfa') === "true");

	useEffect(() => {
		setState(sessionStorage.getItem('tfa') === "true");
	}, [setState]);

	const handleToggle = async() => {
		const checkBox = document.querySelector('input');
		const checkedTo = checkBox?.checked;
		console.log(`checked=${checkedTo}`);
		if (!confirm(`2차 인증을 ${checkedTo ? "활성화" : "비활성화"}합니다.`)) {
			setState(!checkedTo); 
			checkBox && (checkBox.checked = !checkedTo);
			return;
		}
		await fetch(`${tfaUpdateUrl}/${checkedTo ? "true" : "false"}`, {
			method: 'PATCH',
			credentials: 'include',
		})
			.then(res => {
				// NOTE: get 2fa info from backend?
				if (!res.ok) throw new Error(`invalid response: ${res.status}`);
				localStorage.setItem('tfa', checkedTo ? "true" : "false");
				setState(!!checkedTo);
				checkBox && (checkBox.checked = !!checkedTo);
				console.log(`tfa updated result=${checkedTo}`);
			})
			.catch(err => {
				console.log(`${tfaUpdateUrl}: fetch error: ${err}`);
			});
	};
	return (
		<>
			<label htmlFor='tfaCheckbox'>
				2-factor Authentication
			</label>
			<input
				style={{
					margin: "4px",
				}}
				onChange={() => {handleToggle()}}
				defaultChecked={!!state}
				id='tfaCheckbox' type='checkbox'></input>
		</>
	);
}

function NameUpdator({ uid, name }: { uid: number, name: string }) {
	const requestNameUpdate = async () => {
		const field = document.querySelector('#nameUpdateField') as HTMLInputElement;
		const updateUrl = `${serverUrl}/updateName/${uid}/${field.value}`;

		console.log(`field.value=${field.value}`);
		await fetch(updateUrl, {
			method: 'PATCH',
			credentials: 'include',
		})
		.then(res => {
			if (!res.ok) throw new Error(`invalid response: ${res.status}`);
		})
		.catch(err => {
			console.log(`${updateUrl}: fetch error: ${err}`);
			alert("닉네임 변경에 실패했습니다.");
		});
	};
	return (
		<>
			<UploadBtn title={"Update Name"}>
				<form onSubmit={(e) => {e.preventDefault(); requestNameUpdate();}}>
					<p>{`현재 닉네임: ${name}`}</p>
					<label 
						htmlFor="nameUpdateField">새 닉네임:</label>
					<input 
						style={{
							margin: "0.5rem",
							border: "solid 1px",
							width: "14rem",
						}}
						type="text" 
						id="nameUpdateField"
						pattern="[a-zA-Z0-9]{4,16}"
						required
					/>
					<button
						style={{
							padding: "1px",
							border: "solid 1px black",
							borderRadius: "0.3rem",
							backgroundColor: "lightgray",
						}}
						type="submit">
					확인
					</button>
				</form>
			</UploadBtn>
		</>
	);
}

function ImgUpdator({ uid }: { uid: number }) {
	return (
		<>
			<UploadBtn title={"Update Avatar"}>
			</UploadBtn>
		</>
	);
}
