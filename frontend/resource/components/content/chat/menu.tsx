import React, { useState, useEffect } from 'react';

import { Socket } from 'socket.io-client';
import styles from '@/styles/chat.module.css';

import useSocketContext from '@/lib/socket';
import { useFetch } from '@/lib/hook';

import Modal from '@/components/structure/modal';
import SideBar from '@/components/structure/sidebar';
import useChatContext, { IChatUser, IChatMate, EChatUserType, TChatContext } from './context';
import ChatControl from './control';
import usePlayerContext, { EPlayerState, TPlayerContext } from '@/components/content/player_state';
import UserList from '@/components/structure/userList';
import useAuthContext from '@/components/user/auth';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`
const chatInfoReqUrl = `${serverUrl}/chat/users-in-channel`;

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
	const { user: userInfo } = useAuthContext();
	const { chatSocket, gameSocket } = useSocketContext();
	const chatContext = useChatContext();
	const { user, setUser, joined, setJoined } = chatContext;
	const [userList, updateUserList] = useFetch<IChatMate[]>(`${chatInfoReqUrl}/${userInfo.id}/${user.channel_id}`, [], fetcher);
	const [controlModal, setControlModal] = useState<boolean>(false);
	const playerContext = usePlayerContext();

	useEffect(() => {
		if (!chatSocket) return;
		socketInit(chatSocket, chatContext, playerContext, updateUserList);
		return () => {
			socketOff(chatSocket);
		};
	}, [chatSocket, user]);

	useEffect(() => {
		if (!chatSocket || !gameSocket) return;
		chatSocket.on('refreshStatus', () => {
			updateUserList();
		});
		gameSocket?.on('refreshGameStatus', () => {
			updateUserList();
		});
		return () => {
			chatSocket.off('refreshStatus');
			gameSocket.off('refreshGameStatus');
		}
	}, []);

	return (
		<SideBar
			className={`${styles.chatList} full-background-color overflow-y-scroll overflow-x-hidden"`}>
			<ul>
				{
					<div>
						<UserList userList={userList} updateUserList={updateUserList}></UserList>
					</div>
				}
				{
					(user.user_type === EChatUserType.OWNER || user.user_type === EChatUserType.ADMIN) &&
					<li>
						<button
							type='button'
							onClick={(e) => 
									{e.preventDefault(); setControlModal(true);}}
							className={`${styles.chatRoomButton}`}
							style={{
								color: 'black',
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
						className={`${styles.chatRoomButton}`}
						style={{
							color: 'black',
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
						className={`${styles.chatRoomButton}`}
						style={{
							color: 'black',
							backgroundColor: 'lightcyan',
						}}>
						{'채널 닫기'} 
					</button>
				</li>
				
			</ul>
		</SideBar>
	);
}

function exitChat(user: IChatUser, socket: Socket) {
	if (!confirm("채널에서 탈퇴하시겠습니까?")) return;
	console.log('exitChat request');
	socket.emit('leave-channel', user.channel_id);
}

function closeChat(user: IChatUser, socket: Socket) {
	console.log('closeChat request');
	socket.emit('close-channel-window', user.channel_id);
}

function socketOff(chatSocket: Socket) {
	chatSocket.off('leave-fail')
	chatSocket.off('leave-success')
	chatSocket.off('close-fail')
	chatSocket.off('close-success')
	chatSocket.off('got-kicked');
	chatSocket.off('got-banned');
	chatSocket.off('kick');
	chatSocket.off('ban');
	chatSocket.off('mute');
	chatSocket.off('leave');
	chatSocket.off('join');
}

function socketInit(
	chatSocket: Socket,
	chatContext: TChatContext,
	playerContext: TPlayerContext,
	updateUserList: Function,
) {
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

	socketOff(chatSocket);

	chatSocket.on('leave-fail', (msg) => {console.log(`leave-fail error: ${msg}`)})

	chatSocket.on('leave-success', (msg) => {
		console.log(`leave-success: ${msg}`)
		close();
		socketOff(chatSocket);
	});

	chatSocket.on('close-fail', (msg) => {console.log(`close-fail error: ${msg}`)})

	chatSocket.on('close-success', (msg) => {
		console.log(`close-success: ${msg}`)
		close();
		socketOff(chatSocket);
	});

	chatSocket.on('got-kicked', (msg) => {
		console.log(`got-kicked: ${msg}`)
		close();
		alert('채널에서 퇴장당했습니다.');
		socketOff(chatSocket);
	});

	chatSocket.on('got-banned', (msg) => {
		console.log(`got-banned: ${msg}`)
		close();
		alert('채널에서 영구 퇴장당했습니다.');
		socketOff(chatSocket);
	});

	/*
	chatSocket.off('got-mutted');
	chatSocket.on('got-mutted', (msg) => {
		console.log(`got-mutted: ${msg}`)
	});
	*/

	chatSocket.on('kick', () => {
		console.log("an user got kicked");
		updateUserList();
	});

	chatSocket.on('ban', () => {
		console.log("an user got banned");
		updateUserList();
	});

	chatSocket.on('mute', () => {
		console.log("an user got muted");
		updateUserList();
	});

	chatSocket.on('leave', (msg) => {
		console.log("an user exited");
		console.log(`exit: ${JSON.stringify(msg)}`)
		updateUserList();
	});

	chatSocket.on('join', (msg) => {
		console.log("new user joined");
		console.log(`join: ${JSON.stringify(msg)}`)
		updateUserList();
	});
}
