import React, { useState, useEffect } from 'react';

import { Socket } from 'socket.io-client';
import styles from '@/styles/chat.module.css';

import useSocketContext from '@/lib/socket';
import { useFetch } from '@/lib/hook';

import Modal from '@/components/structure/modal';
import SideBar from '@/components/structure/sidebar';
import useChatContext, { IChatUser, IChatMate, EChatUserType, TChatContext } from './context';
import ChatControl from './control';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`
const chatInfoReqUrl = `${serverUrl}/`;

export default function ChatMenu() {
	const {chatSocket} = useSocketContext();
	const chatContext = useChatContext();
	const { user, setUser, joined, setJoined } = chatContext;
	const [userList, updateUserList] = useFetch<IChatMate[]>(chatInfoReqUrl, []);
	const [controlModal, setControlModal] = useState<boolean>(false);
	const list: IChatMate[] = userList;

	useEffect(() => {
		if (!chatSocket) return;
		chatSocket.off('join');
		chatSocket.on('join', (msg) => {
			console.log(`join: ${msg}`)
			updateUserList();
		});
		socketInit(chatSocket, chatContext);
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
									{e.preventDefault(); setControlModal(true);}}
							className={`${styles.button}`}
							style={{
								backgroundColor: 'lightsalmon',
							}}>
							{'채널 설정'} 
						</button>
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
	if (!confirm("채널에서 나가시겠습니까?")) return;
	console.log('exitChat request');
	socket.emit('leave-channel', user.channel_id);
}

function closeChat(user: IChatUser, socket: Socket) {
	console.log('closeChat request');
	socket.emit('close-channel-window', user.channel_id);
}

function socketInit(chatSocket: Socket, chatContext: TChatContext) {
	const { user, setUser, joined, setJoined } = chatContext;

	chatSocket.off('leave-fail')
	chatSocket.off('leave-success')
	chatSocket.on('leave-fail', (msg) => {console.log(`leave-fail error: ${msg}`)})
	chatSocket.on('leave-success', (msg) => {
		console.log(`leave-success: ${msg}`)
		setJoined(false);
		setUser({
			...user,
			channel_id: -1,
		});
	});

	chatSocket.off('close-fail')
	chatSocket.off('close-success')
	chatSocket.on('close-fail', (msg) => {console.log(`close-fail error: ${msg}`)})
	chatSocket.on('close-success', (msg) => {
		console.log(`close-success: ${msg}`)
		setJoined(false);
		setUser({
			...user,
			channel_id: -1,
		});
	});
}
