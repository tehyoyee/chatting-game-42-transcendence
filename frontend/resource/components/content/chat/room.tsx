import { useState, useEffect, useRef, ReactNode } from 'react';
import styles from "@/styles/chat.module.css";
import useSocketContext from '@/lib/socket';

import ChatMenu from './menu';
import usePlayerContext, { EPlayerState } from '../player_state';
import useChatContext from './context';

type TRecvMsg = {
	message: string,
	user_id: number,
	user_nickname: string,
};

type TSendMsg = {
	token: string | undefined,
	channel_id: number,
	content: string,
};

type TPrevMsg = {
	writerId: number,
	writerNickname: string,
	content: string,
}

export default function ChatRoom() {
	const { setPlayerState } = usePlayerContext();
	useEffect(() => {
		setPlayerState(EPlayerState.CHAT_JOINING);
	}, []);
	return (
		<>
			<ChatMenu></ChatMenu>
			<ChatBox></ChatBox>
		</>
	);
}

function ChatBox() {
	const { chatSocket } = useSocketContext();
	const [chatLog, setChatLog] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const logRef = useRef<HTMLDivElement | null>(null);
	const { user } = useChatContext();

	const addMsg = (msg: string) => {
		setChatLog((chatLog) => {
			return [
				...chatLog,
				msg,
		]});
	};

	useEffect(() => {
		console.log('chatlog flush');
		setChatLog([]);
	}, [user]);

	useEffect(() => {
		if (!chatSocket) return;
		chatSocket.off('got-mutted');
		chatSocket.on('got-mutted', (msg) => {
			addMsg("10초 동안 메세지를 보낼 수 없습니다.");
		});
		chatSocket.off('message');
		chatSocket.on('message', (data: TRecvMsg) => {
			addMsg(`${data.user_nickname}: ${data.message}`)
		})
		chatSocket.off('messages');
		chatSocket.on('messages', (data: TPrevMsg[]) => {
			console.log('messages: ', data);
			data.map(msg => {
				addMsg(`${msg.writerNickname}: ${msg.content}`)
			});
		})
	}, [chatSocket]);

	useEffect(() => {
		logRef.current && (logRef.current.scrollTop = logRef.current.scrollHeight);
	}, [chatLog]);

	const sendMsg = () => {
		const inputField = inputRef.current;

		if (!inputField?.value || !chatLog || !chatSocket) return;

		const sendmsg: TSendMsg = {
			token: document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1],
			channel_id: user.channel_id,
			content: inputField.value,
		}
		chatSocket.emit('post-group-message', sendmsg);
		inputField.focus();
		inputField.value = '';
	};
	
	return (
		<div className={styles.chatBox}>
			<div
				ref={logRef}
				id="chatLogList"
				style={{
					height: '96%',
					overflowY: 'scroll',
				}}>
				<ul>
					{chatLog.map((log, key) => {
						return (
							<li key={key}>
								{log}
							</li>
						);
					})}
				</ul>
			</div>
			<form 
				className={styles.chatBar}
				id={"chat_form"} 
				onSubmit={e => {e.preventDefault(); sendMsg()}}>
				<input 
					ref={inputRef}
					id="chatInputField"
					autoComplete='off'
					style={{
						translate: '-10px',
						borderRadius: '5px',
						width: '70%',
						height: '2.15rem',
						border: '1px solid #000000',
						outline: 'none',
					}}
					max={256}
					required
				/>
				<button
					style={{
						translate: '-10px',
						padding: '5px',
						borderRadius: '5px',
						border: 'solid 1px black',
						backgroundColor: 'rgb(200, 239, 255)',
					}}
					>Enter</button>
			</form>
		</div>
	);
}
