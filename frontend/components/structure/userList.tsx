import React, { useState } from 'react';
import { IChatMate } from '../content/chat/context';
import UserModal from '@/components/structure/userModal';

const UserList = ({users}: {users: IChatMate[] }) => {
	const dialog = document.querySelector('dialog');
	const [user, setUser] = useState<IChatMate>({
		userId: -1,
		userNickName: '',
		userType: 'member',
		isMuted: false,
	});
  return (
    <div>
			<UserModal user={user}/>
      <h2>유저 목록</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index} onClick={() => {dialog?.showModal();setUser(user)}}>
            {user.userNickName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
