import React from 'react';
import { IChatMate } from '../content/chat/context';

const UserList = ({users, onUserClick }: {users: IChatMate[], onUserClick: Function}) => {

  return (
    <div>
      <h2>유저 목록</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index} onClick={() => onUserClick(user)}>
            {user.userNickName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
