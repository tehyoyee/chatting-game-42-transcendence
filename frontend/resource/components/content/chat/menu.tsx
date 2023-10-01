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

enum EUserEventType {
	KICK = 1,
	BAN,
	MUTE,
	UNMUTE,
	ADMIN,
	JOIN,
	CLOSE,
	LEAVE,
};

const userEventTypeMap = {
	kick: EUserEventType.KICK,
	ban: EUserEventType.BAN,
	mute: EUserEventType.MUTE,
	unmute: EUserEventType.UNMUTE,
	admin: EUserEventType.ADMIN,
	join: EUserEventType.JOIN,
	close: EUserEventType.CLOSE,
	leave: EUserEventType.LEAVE,
};

type TUserEvent = {
	event_type: string,
	user_id: number,
	user_nickname: string,
};

enum EChannelType {
	PUBLIC = "public",
	PROTECTED = "protected",
	PRIVATE = "private",
	DM = "dm",
}

interface IChannelInfo {
	channel_id: number,
	channel_name: string,
	channel_type: EChannelType,
}

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`
const channelUrl = `${serverUrl}/chat/channel`;
const chatInfoReqUrl = `${serverUrl}/chat/users-in-channel`;

const userListFetcher = async (path: string): Promise<IChatMate[]> => {
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
	const playerContext = usePlayerContext();

	const { user, setUser, joined, setJoined } = chatContext;
	const [ userList, updateUserList ] = useFetch<IChatMate[]>(`${chatInfoReqUrl}/${userInfo.id}/${user.channel_id}`, [], userListFetcher);
	const [ channelInfo, updateChannelInfo ] = useFetch<IChannelInfo>(`${channelUrl}/${user.channel_id}`,
		{
			channel_id: -1,
			channel_name: '',
			channel_type: EChannelType.PUBLIC,
		});

	const [controlModal, setControlModal] = useState<boolean>(false);
	const [isDm, setIsDm] = useState<boolean>(false);
  const [channelName, setChannelName] = useState('');

	useEffect(() => {
		if (!chatSocket) return;
		socketInit(userInfo.id, chatSocket, chatContext, updateUserList, setIsDm);
		return () => {
			socketOff(chatSocket);
			setJoined(false);
			setUser({
				...user,
				channel_id: -1,
			});
		};
	}, [chatSocket]);

	useEffect(() => {
		updateChannelInfo();
	}, [user]);

	useEffect(() => {
		setChannelName(isDm ? 'DM' : channelInfo.channel_name);
	}, [channelInfo]);

	useEffect(() => {
		//console.log(`chat joined: ${user.channel_id}`);
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
            <div style={{fontSize: '20px',}}>{channelName}</div>
			<ul>
				<div>
					<UserList userList={userList} updateUserList={updateUserList}></UserList>
				</div>
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
	//console.log('exitChat request');
	socket.emit('leave-channel', user.channel_id);
}

function closeChat(user: IChatUser, socket: Socket) {
	//console.log('closeChat request');
	socket.emit('close-channel-window', user.channel_id);
}

function socketOff(chatSocket: Socket) {
	chatSocket.off('enter-dm-fail')
	chatSocket.off('enter-dm-success')
	chatSocket.off('leave-fail')
	chatSocket.off('leave-success')
	chatSocket.off('close-fail')
	chatSocket.off('close-success')
	chatSocket.off('got-kicked');
	chatSocket.off('got-banned');
	chatSocket.off('user-event');
}

function socketInit(
	userId: number,
	chatSocket: Socket,
	chatContext: TChatContext,
	updateUserList: Function,
	setIsDm: React.Dispatch<React.SetStateAction<boolean>>,
) {
	const { user, setUser, joined, setJoined } = chatContext;

	function close() {
		setJoined(false);
		setUser({
			...user,
			channel_id: -1,
		});
	}

	socketOff(chatSocket);

	chatSocket.on('enter-dm-success', 
		(data: IChatUser) => {
			setUser(data);
			setIsDm(true);
			//console.log('dm-enter-success: ', data);
	});

	chatSocket.on('enter-dm-fail', (msg) => {
		//console.log(`enter-dm fail: ${msg}`); 
		alert('오류: DM을 보낼 수 없습니다.');
	});

	chatSocket.on('leave-fail', (msg) => {
		//console.log(`leave-fail error: ${msg}`)
	})

	chatSocket.on('leave-success', (msg) => {
		//console.log(`leave-success: ${msg}`)
		close();
		socketOff(chatSocket);
	});

	chatSocket.on('close-fail', (msg) => {
		//console.log(`close-fail error: ${msg}`)
	})

	chatSocket.on('close-success', (msg) => {
		//console.log(`close-success: ${msg}`)
		close();
		socketOff(chatSocket);
	});

	chatSocket.on('got-kicked', (msg) => {
		//console.log(`got-kicked: ${msg}`)
		close();
		alert('채널에서 퇴장당했습니다.');
		socketOff(chatSocket);
	});

	chatSocket.on('got-banned', (msg) => {
		//console.log(`got-banned: ${msg}`)
		close();
		alert('채널에서 영구 퇴장당했습니다.');
		socketOff(chatSocket);
	});

	/*
	chatSocket.off('got-mutted');
	chatSocket.on('got-mutted', (msg) => {
		//console.log(`got-mutted: ${msg}`)
	});
	*/

	chatSocket.on('user-event', (msg: TUserEvent) => {
		//console.log("new admin");
		switch (userEventTypeMap[msg.user_nickname as keyof typeof userEventTypeMap]) {
			case EUserEventType.KICK:
				break;
			case EUserEventType.BAN:
				break;
			case EUserEventType.MUTE:
				break;
			case EUserEventType.UNMUTE:
				break;
			case EUserEventType.ADMIN:
				if (msg.user_id === userId) {
					setUser({
						...user,
						user_type: EChatUserType.ADMIN,
					});
				}
				
				break;
			case EUserEventType.JOIN:
				break;
			case EUserEventType.CLOSE:
				break;
			case EUserEventType.LEAVE:
				break;
		};
		updateUserList();
	});
}
