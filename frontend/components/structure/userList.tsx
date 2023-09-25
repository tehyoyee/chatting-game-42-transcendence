import React, { useState, useEffect } from 'react';
import { IChatMate, EChatUserType, ISocial, EUserStatus } from '../content/chat/context';
import UserModal from '@/components/structure/userModal';
import Modal from './modal';
import styles from '@/styles/chat.module.css';
import Profile from '@/components/content/profile/profile';
import useChatContext from '../content/chat/context';

const UserList = ({
	userList,
	updateUserList,
}: { 
		userList: ISocial[],
		updateUserList: Function,
}) => {
	const { user, setUser, joined, setJoined } = useChatContext();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [targetUser, setTargetUser] = useState<ISocial>({
		userId: -1,
		userNickName: '',
		isFriend: false,
		isBlocked: false,
		userStatus: EUserStatus.OFFLINE,
	});
	const [showProfile, setShowProfile] = useState<boolean>(false);

	useEffect(() => {
		updateUserList();
	}, [showModal]);
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
        {userList.map((user, index) => (
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
							{' '}
							{user.userStatus}
						</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

function getColor(user: any) {
	let color;

	if (!(typeof user.userType)) {
		return "lightgray";
	}
	switch (user.userType) {
		case EChatUserType.OWNER:
			color = "lightcoral";
			break;
		case EChatUserType.ADMIN:
			color = "lightpink";
			break;
		default:
			color = "lightgray";
	}
	return color;
}

export default UserList;
