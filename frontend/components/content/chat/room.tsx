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
	channel_id: number,
	content: string,
};

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
		if (!chatSocket) return;
		chatSocket.off('got-mutted');
		chatSocket.on('got-mutted', (msg) => {
			addMsg("10초 동안 메세지를 보낼 수 없습니다.");
		});
		chatSocket.off('message');
		chatSocket.on('message', (data: TRecvMsg) => {
			console.log('message data');
			console.log(data);
			addMsg(`${data.user_nickname}: ${data.message}`)
		})
	}, [chatSocket]);

	useEffect(() => {
		logRef.current && (logRef.current.scrollTop = logRef.current.scrollHeight);
	}, [chatLog]);

	const sendMsg = () => {
		const inputField = inputRef.current;

		if (!inputField?.value || !chatLog || !chatSocket) return;

		const sendMsg: TSendMsg = {
			channel_id: user.channel_id,
			content: inputField.value,
		}
		chatSocket.emit('post-group-message', sendMsg);
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
				<button
					style={{
						padding: '5px',
						border: 'solid 1px black',
						backgroundColor: 'lightcyan',
					}}
					>Enter</button>
				<input 
					ref={inputRef}
					id="chatInputField"
					autoComplete='off'
					style={{
						width: '70%',
						height: '2rem',
					}}
					max={256}
					required
				/>
			</form>
		</div>
	);
}
