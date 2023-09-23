import React from 'react';

const UserModal = ({ user, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>유저 정보</h3>
        <p>유저 이름: {user}</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default UserModal;
