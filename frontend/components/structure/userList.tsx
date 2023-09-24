import React, { useState } from 'react';
import { IChatMate } from '../content/chat/context';
import UserModal from '@/components/structure/userModal';
import Modal from './modal';
import styles from '@/styles/chat.module.css';
import Profile from '@/components/content/profile/profile';

const UserList = ({users}: {users: IChatMate[] }) => {
	const dialog = document.querySelector('dialog');
	const [showModal, setShowModal] = useState<boolean>(false);
	const [user, setUser] = useState<IChatMate>({
		userId: -1,
		userNickName: '',
		userType: 'member',
		isMuted: false,
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
						<Profile isMyProfile={false} uid={user.userId}></Profile>
					</Modal>
			}
			{
				showModal && 
					<Modal
						style={{
							borderRadius: '0',
							height: '200px',
							width: '200px',
						}}
						onClose={() => {setShowModal(false)}}>
						<UserModal 
							setShowProfile={setShowProfile}
							user={user} 
							onClose={() => {setShowModal(false)}}></UserModal>
					</Modal>
			}
      <ul>
        {users.map((user, index) => (
          <li key={index}>
						<button
							type='button'
							onClick={(e) => {
								e.preventDefault();
								setUser(user);
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

export default UserList;
