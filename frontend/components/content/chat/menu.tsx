import React, { useState, useEffect } from 'react';

import { Socket } from 'socket.io-client';
import styles from '@/styles/chat.module.css';

import useSocketContext from '@/lib/socket';
import { useFetch } from '@/lib/hook';

import UserCard from '@/components/structure/usercard';
import Modal from '@/components/structure/modal';
import SideBar from '@/components/structure/sidebar';
import useChatContext, { IChatUser, IChatMate, EChatUserType, TChatContext } from './context';
import ChatControl from './control';
import usePlayerContext, { EPlayerState, TPlayerContext } from '@/components/content/player_state';
import UserList from '@/components/structure/userList';
import UserModal from '@/components/structure/userModal';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`
const chatInfoReqUrl = `${serverUrl}/chat/users-in-channel/`;

const fetcher = async (path: string): Promise<IChatMate[]> => {
	const res = await fetch(path, {
		method: 'GET',
		credentials: 'include',
	})
	.then(res => {
		if (!res.ok) throw new Error("invalid response");
		return res.json()
	});
	return res;
};

export default function ChatMenu() {
	const {chatSocket} = useSocketContext();
	const chatContext = useChatContext();
	const { user, setUser, joined, setJoined } = chatContext;
	const [userList, updateUserList] = useFetch<IChatMate[]>(`${chatInfoReqUrl}${user.channel_id}`, [], fetcher);
	const [controlModal, setControlModal] = useState<boolean>(false);
	const playerContext = usePlayerContext();

	const [selectedUser, setSelectedUser] = useState<IChatMate>({userId: 0,
		userNickName: '',
		userType: 'string',
		isMuted: false});

	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleUserClick = (user: any) => {
		setSelectedUser(user);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	  };

	useEffect(() => {
		if (!chatSocket) return;
		chatSocket.off('leave');
		chatSocket.on('leave', (msg) => {
			console.log("an user exited");
			console.log(`exit: ${JSON.stringify(msg)}`)
			updateUserList();
		});
		chatSocket.off('join');
		chatSocket.on('join', (msg) => {
			console.log("new user joined");
			console.log(`join: ${JSON.stringify(msg)}`)
			updateUserList();
		});
		socketInit(chatSocket, chatContext, playerContext);
	}, [chatSocket]);

	return (
		<SideBar
			className={"full-background-color overflow-y-scroll overflow-x-hidden"}>
			<ul>
				{
					(user.user_type === EChatUserType.OWNER || user.user_type === EChatUserType.ADMIN) &&
					<li>
						<button
							type='button'
							onClick={(e) => 
									{e.preventDefault(); setControlModal(true);}}
							className={`${styles.button}`}
							style={{
								backgroundColor: 'lightsalmon',
							}}>
							{'채널 설정'} 
						</button>
					</li>
				}
				{
					controlModal && 
						<Modal
							onClose={setControlModal}
							style={{}}
							>
							<ChatControl userList={userList}></ChatControl>
						</Modal>
				}
				<li>
					<button
						type='button'
						onClick={(e) => 
							{e.preventDefault(); chatSocket && exitChat(user, chatSocket);}}
						className={`${styles.button}`}
						style={{
							backgroundColor: 'lightsalmon',
						}}>
						{'채널 탈퇴'} 
					</button>
				</li>
				<li>
					<button
						type='button'
						onClick={(e) => 
							{e.preventDefault(); chatSocket && closeChat(user, chatSocket);}}
						className={`${styles.button}`}
						style={{
							backgroundColor: 'lightcyan',
						}}>
						{'채널 닫기'} 
					</button>
				</li>
				{
					<div>
					<UserList users={userList} onUserClick={handleUserClick}></UserList>
					{isModalOpen && (
						<UserModal user={selectedUser} onClose={handleCloseModal} />
					  )}
					</div>
				}
			</ul>
		</SideBar>
	);
}

function exitChat(user: IChatUser, socket: Socket) {
	if (!confirm("채널에서 나가시겠습니까?")) return;
	console.log('exitChat request');
	socket.emit('leave-channel', user.channel_id);
}

function closeChat(user: IChatUser, socket: Socket) {
	console.log('closeChat request');
	socket.emit('close-channel-window', user.channel_id);
}

function socketInit(chatSocket: Socket, chatContext: TChatContext, playerContext: TPlayerContext) {
	const { user, setUser, joined, setJoined } = chatContext;
	const { setPlayerState, setPlayerData } = playerContext;

	function close() {
		setJoined(false);
		setUser({
			...user,
			channel_id: -1,
		});
		setPlayerData(null);
	}

	chatSocket.off('leave-fail')
	chatSocket.off('leave-success')
	chatSocket.on('leave-fail', (msg) => {console.log(`leave-fail error: ${msg}`)})
	chatSocket.on('leave-success', (msg) => {
		console.log(`leave-success: ${msg}`)
		close();
		chatSocket.off(); // NOTE
	});

	chatSocket.off('close-fail')
	chatSocket.off('close-success')
	chatSocket.on('close-fail', (msg) => {console.log(`close-fail error: ${msg}`)})
	chatSocket.on('close-success', (msg) => {
		console.log(`close-success: ${msg}`)
		close();
		chatSocket.off(); // NOTE
	});
}
