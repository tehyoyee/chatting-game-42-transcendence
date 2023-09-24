import React, { useState } from 'react';
import { IChatMate } from '../content/chat/context';
import UserModal from '@/components/structure/userModal';
import Modal from './modal';
import styles from '@/styles/chat.module.css';

const UserList = ({users}: {users: IChatMate[] }) => {
	const dialog = document.querySelector('dialog');
	const [showModal, setShowModal] = useState<boolean>(false);
	const [user, setUser] = useState<IChatMate>({
		userId: -1,
		userNickName: '',
		userType: 'member',
		isMuted: false,
	});
  return (
    <div>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
						<Modal
							onClose={() => {setShowModal(false)}}
							>
							<button
								className={styles.button}>
								{user.userNickName}
							</button>
						</Modal>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
