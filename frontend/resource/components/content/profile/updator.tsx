"use client";

import React, { Children, SetStateAction } from "react";
import { useState, useEffect } from "react";
import styles from "@/styles/profile.module.css";
import Modal from "@/components/structure/modal";
import TextInputForm from "@/components/structure/textinput";

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;

function UploadBtn({ onClick, title }: { onClick: Function; title: string }) {
  return (
    <>
      <button
        className={`${styles.profileUpdateBtn}`}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {title}
      </button>
    </>
  );
}

export default function ProfileUpdator({
  uid,
  update,
}: {
  uid: number;
  update: {
    setUpdate: React.Dispatch<SetStateAction<Object>>;
  };
}) {
  return (
    <div id="profileUpdator" className={styles.settings}>
      <ul>
        <li>
          <ImgUpdator
            setUpdate={{update: update.setUpdate}}
            uid={uid}
          ></ImgUpdator>
        </li>
        <li>
          <NameUpdator
            setUpdate={{update: update.setUpdate}}
            uid={uid}
          ></NameUpdator>
        </li>
        <li>
          <TfaUpdator uid={uid}></TfaUpdator>
        </li>
      </ul>
    </div>
  );
}

export function TfaUpdator({ uid }: { uid: number }) {
  const tfaUpdateUrl = `${serverUrl}/updateTFA/${uid}`;
  const [state, setState] = useState<boolean | null>(
    sessionStorage.getItem("tfa") === "true"
  );

  useEffect(() => {
    setState(sessionStorage.getItem("tfa") === "true");
  }, [setState]);

  const handleToggle = async () => {
    const checkBox = document.querySelector("#tfaCheckbox") as HTMLInputElement;
    const checkedTo: boolean = checkBox.checked;
    console.log(`checked=${checkedTo}`);
    if (!confirm(`2차 인증을 ${checkedTo ? "활성화" : "비활성화"}합니다.`)) {
      setState(!checkedTo);
      checkBox.checked = !checkedTo;
      return;
    }
    await fetch(`${tfaUpdateUrl}/${checkedTo ? "true" : "false"}`, {
      method: "PATCH",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`invalid response: ${res.status}`);
        sessionStorage.setItem("tfa", checkedTo ? "true" : "false");
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
          margin: "4px",
        }}
        onChange={(e) => {
          e.preventDefault();
          handleToggle();
        }}
        defaultChecked={!!state}
        id="tfaCheckbox"
        type="checkbox"
      ></input>
    </>
  );
}

export function NameUpdator({
  uid,
  setUpdate,
}: {
  uid: number;
  setUpdate: {
		update: React.Dispatch<SetStateAction<Object>>;
	}
}) {
  const [showModal, setShowModal] = useState(false);

  const requestNameUpdate = async (uid: number) => {
    const field = document.querySelector("#inputField") as HTMLInputElement;
    const updateUrl = `${serverUrl}/updateName/${uid}/${field.value}`;

    console.log(`field.value=${field.value}`);
    await fetch(updateUrl, {
      method: "PATCH",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`invalid response: ${res.status}`);
        setShowModal(false);
        setUpdate.update({});
      })
      .catch((err) => {
        console.log(`${updateUrl}: fetch error: ${err}`);
        alert("닉네임 변경에 실패했습니다.");
      });
  };

  return (
    <>
      <UploadBtn
        onClick={() => {
          setShowModal(true);
        }}
        title={"Update Name"}
      ></UploadBtn>
      {showModal && (
        <Modal
          style={{
            height: "200px",
            width: "450px",
          }}
          onClose={() => setShowModal(false)}
        >
          <TextInputForm
            onSubmit={() => {
              requestNameUpdate(uid);
            } }
            label="새 닉네임:"
            pattern="[a-zA-Z0-9]{4,16}"
            tailMessage="영어 소문자, 대문자, 숫자 4~16자리로 이뤄져야 합니다.">{}</TextInputForm>
        </Modal>
      )}
    </>
  );
}

export function ImgUpdator({
  uid,
  setUpdate,
}: {
  uid: number;
  setUpdate: {
		update: React.Dispatch<SetStateAction<Object>>;
	}
}) {
  const [showModal, setShowModal] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileChange = (targetFile: File) => {
		const kbytes = 200;
		console.log(`input=${JSON.stringify(targetFile)}`);
    if (targetFile) {
			if ((targetFile.type != 'image/png' && targetFile.type != 'image/jpg') || targetFile.size > (kbytes * 1024)) {
				alert(`파일의 확장자명은 .png, 크기는 ${kbytes}kB 이하여야 합니다.`);
				return;
			}
			console.log(`avatar image type=${targetFile.type}, size=${targetFile.size}`);
			setImageFile(targetFile);
    }
  };

  const uploadAvatar = async () => {
		const formData = new FormData();
    const updateUrl = `${serverUrl}/updateAvatar/${uid}`;

		if (!imageFile) {
			alert('이미지가 선택되지 않았습니다.');
			return;
		}
		formData.append('file', imageFile);
    try {
      const response = await fetch(updateUrl, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        console.log('성공:', result);
        setShowModal(false);
        setUpdate.update({});
      } else {
        console.error('업로드 실패:', response.statusText);
				alert('업로드 실패');
      }
    } catch (error) {
      console.error('업로드 오류:', error);
    }
  };

  return (
    <>
      <UploadBtn
        onClick={() => {
          setShowModal(true);
        }}
        title={'Update Avatar'}
      ></UploadBtn>
      {showModal && (
        <Modal
        style={{
          height: "200px",
          width: "400px",
        }}
        onClose={() => setShowModal(false)}>
					<div>
						<form 
							encType="multipart/form-data"
							onSubmit={(e) => {
								e.preventDefault(); uploadAvatar();
							}}>
							<div>
								<label htmlFor="file">Choose file to upload</label>
								<input 
									type="file" 
									id="file" 
									name="file" 
									accept="image/png, image/jpg" 
									onChange={(e) => {e?.target?.files?.[0] && handleFileChange(e.target.files[0]);}}/>
							</div>
							<div>
								<button className="normalButton" type="submit">
									Submit
								</button>
							</div>
						</form>
					</div>
        </Modal>
      )}
    </>
  );
}
