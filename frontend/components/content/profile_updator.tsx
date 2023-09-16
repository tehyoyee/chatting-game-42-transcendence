import { useState, useEffect } from 'react';
import styles from '/styles/profile.module.css';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;

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
				</li>
			</ul>
		</div>
	);
}
function TfaUpdator({ uid }: { uid: number }) {
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
		<>
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
		</>
	);
}

function ImgUpdator({ uid }: { uid: number }) {
	return (
		<>
			<UploadBtn callback={uploadImage}>
				Upload image
			</UploadBtn>
		</>
	);
}

function NameUpdator({ uid }: { uid: number }) {
	return (
		<>
			<UploadBtn callback={updateName}>
				Update Name
			</UploadBtn>
		</>
	);
}
