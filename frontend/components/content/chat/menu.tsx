import React, { useEffect } from 'react';

import { Socket } from 'socket.io-client';
import styles from '@/styles/chat.module.css';

import useSocketContext from '@/lib/socket';
import { useFetch } from '@/lib/hook';

import SideBar from '@/components/structure/sidebar';
import { IChatUser, IChatMate, EChatUserType } from './context';
import useChatContext from './context';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`
const chatInfoReqUrl = `${serverUrl}/`;

export default function ChatMenu() {
	const { user, setUser, joined, setJoined } = useChatContext();
	const {chatSocket} = useSocketContext();
	const [userList, updateUserList] = useFetch<IChatMate[]>(chatInfoReqUrl, []);
	const list: IChatMate[] = [];

	useEffect(() => {
		if (!chatSocket) return;
		chatSocket.off('leave-fail')
		chatSocket.off('leave-success')
		chatSocket.on('leave-fail', (msg) => {console.log(`leave-fail error: ${msg}`)})
		chatSocket.on('leave-success', (msg) => {
			setJoined(false);
			setUser({
				...user,
				channel_id: -1,
			});
		});

	}, [chatSocket]);

	return (
		<SideBar
			className={"full-background-color overflow-y-scroll overflow-x-hidden"}>
			<ul>
				<li>
					{
						(user.user_type === EChatUserType.OWNER || user.user_type === EChatUserType.ADMIN) &&
						<button
							type='button'
							onClick={(e) => 
									{e.preventDefault(); chatSocket && controlChat(user, chatSocket);}}
							className={`${styles.button}`}
							style={{
								backgroundColor: 'lightsalmon',
							}}>
							{'채널 설정'} 
						</button>
					}
					<button
						type='button'
						onClick={(e) => 
							{e.preventDefault(); chatSocket && exitChat(user, chatSocket);}}
						className={`${styles.button}`}
						style={{
							backgroundColor: 'lightsalmon',
						}}>
						{'채널 나가기'} 
					</button>
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
					{/*menuModal &&
						<Modal onClose={}>
							<ChatCreate onClose={() => {}}></ChatCreate>
						</Modal>
				*/	}
				</li>
				{/*
					list.map(info => {
						return (
							<UserCard
								info={info}
								key={info.user_id}
								className={''}
							></UserCard>
						);
					})
				*/}
			</ul>
		</SideBar>
	);
}

function exitChat(user: IChatUser, socket: Socket) {
	console.log('exitChat request');
	socket.emit('leave-channel', {
		channelId: user.channel_id,
	});
}

function closeChat(user: IChatUser, socket: Socket) {
}

function controlChat(user: IChatUser, socket: Socket) {
}
