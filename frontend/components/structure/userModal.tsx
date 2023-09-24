import React, { useState } from 'react';
import { IChatMate } from '../content/chat/context';
import useSocketContext from '@/lib/socket';

const UserModal = ({ 
	user,
	onClose,
	setShowProfile,
}: {
	user: IChatMate,
	onClose: Function,
	setShowProfile: React.Dispatch<React.SetStateAction<boolean>>,
}) => {
	const { chatSocket } = useSocketContext();

	function handleProfile() {
		onClose();
		setShowProfile(true);
	}

	function handleDm() {
		chatSocket?.emit('', () => {
		});
	}

	function handleGameNormal() {
		chatSocket?.emit('', () => {
		});
	}

	function handleGameFast() {
		chatSocket?.emit('', () => {
		});
	}

  return (
		<ul>
			<li>
				<p>{user.userNickName}</p>
			</li>
			<li>
			<button 
				className='normalButton'
				onClick={handleProfile}
				>{'see profile'}</button>
			</li>
			<li>
			<button 
				className='normalButton'
				onClick={handleDm}
				>{'dm'}</button>
			</li>
			<li>
			<button 
				className='normalButton'
				onClick={handleGameNormal}
				>{'game normal'}</button>
			</li>
			<li>
			<button 
				className='normalButton'
				onClick={handleGameFast}
				>{'game fast'}</button>
			</li>
		</ul>

		/*
    <div className="modal">
      <div className="modal-content">
        <h3>유저 정보</h3>
        <p>유저 이름: {user.userNickName}</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
		*/
  );
};
export default UserModal;
