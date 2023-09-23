import React from 'react';
import { IChatMate } from '../content/chat/context';

const UserModal = ({ user, onClose }: {user: IChatMate, onClose: any}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>유저 정보</h3>
        <p>유저 이름: {user.userNickName}</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default UserModal;
