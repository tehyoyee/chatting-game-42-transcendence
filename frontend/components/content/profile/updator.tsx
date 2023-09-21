'use client';

import React, { SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import styles from '@/styles/profile.module.css';
import Modal from '@/components/structure/modal';
import TextInputForm from '@/components/structure/textinput';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;

function UploadBtn({ 
	onClick, 
	title 
}: { 
	onClick: Function,
	title: string 
}) {
	return (
	  <>
			<button
				className={`${styles.profileUpdateBtn}`}
				type="button"
				onClick={(e) => {
					e.preventDefault();
					onClick();
				}}>
				{title}
			</button>
	  </>
	);
}

export default function ProfileUpdator({
  uid,
  name,
  update,
}: {
  uid: number;
  name: string;
  update: {
    setUpdate: React.Dispatch<SetStateAction<Object>>;
  };
}) {
  return (
    <div
      id="profileUpdator"
      className={styles.settings}>
			<ul>
				<li>
					<ImgUpdator setUpdate={update.setUpdate} uid={uid}></ImgUpdator>
				</li>
				<li>
					<NameUpdator setUpdate={update.setUpdate} uid={uid} name={name}></NameUpdator>
				</li>
				<li>
					<TfaUpdator uid={uid}></TfaUpdator>
				</li>
			</ul>
    </div>
  );
}

function TfaUpdator({ uid }: { uid: number }) {
  const tfaUpdateUrl = `${serverUrl}/updateTFA/${uid}`;
  const [state, setState] = useState<boolean | null>(sessionStorage.getItem('tfa') === 'true');

  useEffect(() => {
    setState(sessionStorage.getItem('tfa') === 'true');
  }, [setState]);

  const handleToggle = async () => {
    const checkBox = document.querySelector('#tfaCheckbox') as HTMLInputElement;
    const checkedTo: boolean = checkBox.checked;
    console.log(`checked=${checkedTo}`);
    if (!confirm(`2차 인증을 ${checkedTo ? '활성화' : '비활성화'}합니다.`)) {
      setState(!checkedTo);
      checkBox.checked = !checkedTo;
      return;
    }
    await fetch(`${tfaUpdateUrl}/${checkedTo ? 'true' : 'false'}`, {
      method: 'PATCH',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`invalid response: ${res.status}`);
        sessionStorage.setItem('tfa', checkedTo ? 'true' : 'false');
        setState(!!checkedTo);
        checkBox.checked = !!checkedTo;
        console.log(`tfa updated result=${checkedTo}`);
      })
      .catch((err) => {
        console.log(`${tfaUpdateUrl}: fetch error: ${err}`);
			// rerender?
      });
  };

  return (
    <>
      <label htmlFor="tfaCheckbox">2-factor Auth</label>
      <input
        style={{
          margin: '4px',
        }}
        onChange={(e) => {
					e.preventDefault();
          handleToggle();
        }}
        defaultChecked={!!state}
        id="tfaCheckbox"
        type="checkbox"></input>
    </>
  );
}

function NameUpdator({ 
	uid, 
	name,
	setUpdate,
}: { 
	uid: number,
	name: string,
	setUpdate: React.Dispatch<SetStateAction<Object>>,
}) {
	const [newName, setNewName] = useState(name);
	const [showModal, setShowModal] = useState(false);
	
  const requestNameUpdate = async (uid: number) => {
    const field = document.querySelector('#inputField') as HTMLInputElement;
    const updateUrl = `${serverUrl}/updateName/${uid}/${field.value}`;

    console.log(`field.value=${field.value}`);
    await fetch(updateUrl, {
      method: 'PATCH',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`invalid response: ${res.status}`);
				setNewName(field.value);
				setShowModal(false);
				setUpdate({});
      })
      .catch((err) => {
        console.log(`${updateUrl}: fetch error: ${err}`);
        alert('닉네임 변경에 실패했습니다.');
      });
  };

	return (
		<>
			<UploadBtn onClick={() => {setShowModal(true)}} title={'Update Name'}></UploadBtn>
			{showModal && (
			<Modal
				style={{
					height: '200px',
					width: '400px',
				}}
				onClose={() => setShowModal(false)}>
				<TextInputForm 
					onSubmit={() => {requestNameUpdate(uid)}}
					label="새 닉네임:"
					pattern="[a-zA-Z0-9]{4,16}"
					tailMassage="영어 소문자, 대문자, 숫자 4~16자리로 이뤄져야 합니다."
					>
				</TextInputForm>
			</Modal>
			)}
		</>
	);
	/*
  return (
    <>
      <UploadBtn title={'Update Name'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestNameUpdate();
          }}>
          <p>{`현재 닉네임: ${updated ? newName : name}`}</p>
          <label htmlFor="nameUpdateField">새 닉네임:</label>
          <input
            style={{
              margin: '0.5rem',
              border: 'solid 1px',
              width: '14rem',
            }}
            type="text"
            id="nameUpdateField"
            pattern="[a-zA-Z0-9]{4,16}"
						onInvalid={() => {console.log("invalid")}}
            required
          />
          <button
            style={{
              padding: '1px',
              border: 'solid 1px black',
              borderRadius: '0.3rem',
              backgroundColor: 'lightgray',
            }}
            type="submit">
            확인
          </button>
					<p>
						{"영어 소문자, 대문자, 숫자 4~16자리로 이뤄져야 합니다."}
					</p>
        </form>
      </UploadBtn>
    </>
  );
		*/
}

function ImgUpdator({ 
	uid,
	setUpdate,
}: { 
	uid: number,
	setUpdate: React.Dispatch<SetStateAction<Object>>,
}) {
  return (
    <>
      <UploadBtn onClick={() => {}} title={'Update Avatar'}></UploadBtn>
    </>
  );
}
