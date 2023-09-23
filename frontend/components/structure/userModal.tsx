import React from 'react';
import { IChatMate } from '../content/chat/context';
import useSocketContext from '@/lib/socket';

const UserModal = ({ user }: {user: IChatMate }) => {
	const { chatSocket } = useSocketContext();

	function handleInvite() {
		chatSocket?.emit('', () => {
		});
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
		<dialog id='userDialog'>
			<p>{user.userId}</p>
			<button 
				className='normalButton'
				onClick={handleInvite}
				>{'see profile'}</button>
			<button 
				className='normalButton'
				onClick={handleInvite}
				>{'invite'}</button>
			<button 
				className='normalButton'
				onClick={handleDm}
				>{'dm'}</button>
			<button 
				className='normalButton'
				onClick={handleGameNormal}
				>{'game normal'}</button>
			<button 
				className='normalButton'
				onClick={handleGameFast}
				>{'game fast'}</button>
			<button className='normalButton' 
				value='cancel' 
				formMethod="dialog"
				onClick={(e) => {
					e.preventDefault();
					const dialog = document.querySelector('dialog');
					dialog?.close();
				}}
				>{'exit'}</button>
		</dialog>

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
