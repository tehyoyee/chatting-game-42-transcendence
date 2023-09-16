import React from 'react';
import { useState, useEffect } from 'react';
import styles from '@/styles/profile.module.css';
import Modal from '@/components/structure/modal';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;

function uploadImage() {
  alert("upload image");
}

function updateName () {
  alert("update name");
}

function UploadBtn({ children, title }: { children: React.ReactNode, title: string}) {
	const [showModal, setShowModal] = useState(false);
  return (
		<>
			<button
				className={`${styles.profileUpdateBtn}`}
				type="button"
				onClick={(e) => {e.preventDefault(); setShowModal(true)}}>
				{title}
			</button>
			{showModal &&
			<Modal title={`${title}`} onClose={() => setShowModal(false)}>
				{children}
			</Modal>}
		</>
  );
}

export default function ProfileUpdator({ uid }: { uid: number }) {
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
					<TfaUpdator uid={uid}></TfaUpdator>
				</li>
				<li>
					<ImgUpdator uid={uid}></ImgUpdator>
				</li>
				<li>
					<NameUpdator uid={uid}></NameUpdator>
				</li>
			</ul>
		</div>
	);
}
function TfaUpdator({ uid }: { uid: number }) {
	const tfaUpdateUrl = `${serverUrl}/updateTFA/${uid}`;
	const [state, setState] = useState<string | null>(sessionStorage.getItem('tfa'));

	useEffect(() => {
		setState(sessionStorage.getItem('tfa'));
	}, []);

	const handleToggle = async() => {
		const checked = document.querySelector('input')?.checked;
		fetch(`${tfaUpdateUrl}/${checked ? "true" : "false"}`, {
			method: 'PATCH',
			credentials: 'include',
		})
			.then(res => {
					// NOTE: get 2fa info from backend?
				if (!res.ok) throw new Error(`invalid response: ${res.status}`);
				const result = checked ? "true" : "false";
				localStorage.setItem('tfa', result);
				setState(result);
				console.log(`tfa updated result=${result}`);
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
				onChange={(e) => {e.preventDefault(); handleToggle()}}
				defaultChecked={state === "true"}
				id='tfaCheckbox' type='checkbox'></input>
		</>
	);
}

function ImgUpdator({ uid }: { uid: number }) {
	return (
		<>
			<UploadBtn title={"Update Avatar"}>
				<div>
					<p>
						modal test
					</p>
				</div>
			</UploadBtn>
		</>
	);
}

function NameUpdator({ uid }: { uid: number }) {
	return (
		<>
			<UploadBtn title={"Update Name"}>
				<div>
					<p>
						modal test 2
					</p>
				</div>
			</UploadBtn>
		</>
	);
}
