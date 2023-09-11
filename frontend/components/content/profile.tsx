'use client'

import Image from 'next/image';
import User from '@/components/user/user';
import styles from '/styles/profile.module.css';

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

// component parameter explained
// ({ props, children })
// export default function Profile({ user }: { user: User }) {
export default function Profile() {
  const user: User = {
    id: 0,
    name: "who",
    email: "abc@student.42seoul.kr",
  };
  const userProps: { prop: string, value: string }[] = [
    { prop: "name", value: user.name },
    { prop: "email", value: user.email },
  ];
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
