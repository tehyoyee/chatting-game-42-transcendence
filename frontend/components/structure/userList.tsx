import React, { useState } from 'react';
import { IChatMate, EChatUserType } from '../content/chat/context';
import UserModal from '@/components/structure/userModal';
import Modal from './modal';
import styles from '@/styles/chat.module.css';
import Profile from '@/components/content/profile/profile';
import useChatContext from '../content/chat/context';

const UserList = ({users}: { users: IChatMate[] }) => {
	const { user, setUser, joined, setJoined } = useChatContext();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [targetUser, setTargetUser] = useState<IChatMate>({
		userId: -1,
		userNickName: '',
		userType: 'member',
		isMuted: false,
		isFriend: false,
		isBlocked: false,
	});
	const [showProfile, setShowProfile] = useState<boolean>(false);
  return (
    <div>
			{
				showProfile &&
					<Modal
						style={{
							overflow: 'scroll',
						}}
						onClose={() => {setShowProfile(false)}}
						>
						<Profile isMyProfile={false} uid={targetUser.userId}></Profile>
					</Modal>
			}
			{
				showModal && 
					<Modal
						style={{
							borderRadius: '0',
							height: '300px',
							width: '200px',
						}}
						onClose={() => {setShowModal(false)}}>
						<UserModal 
							setUser={setUser}
							setShowProfile={setShowProfile}
							targetUser={targetUser} 
							onClose={() => {setShowModal(false)}}></UserModal>
					</Modal>
			}
      <ul>
        {users.map((user, index) => (
          <li key={index}>
						<button
							style={{
								backgroundColor: getColor(user),
							}}
							type='button'
							onClick={(e) => {
								e.preventDefault();
								setTargetUser(user);
								setShowModal(true);
							}}
							className={styles.button}>
							{user.userNickName}
						</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

function getColor(user: IChatMate) {
	let color;

	switch (user.userType) {
		case EChatUserType.OWNER:
			color = "lightpink";
			break;
		case EChatUserType.ADMIN:
			color = "lightcoral";
			break;
		default:
			color = "lightgray";
	}
	return color;
}

export default UserList;
