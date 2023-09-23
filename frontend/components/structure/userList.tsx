import React from 'react';

const UserList = ({ onUserClick }: {onUserClick: Function}) => {
  const users = ['유저1', '유저2', '유저3']; // 유저 목록 데이터

  return (
    <div>
      <h2>유저 목록</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index} onClick={() => onUserClick(user)}>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
