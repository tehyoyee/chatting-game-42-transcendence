import { useState, useEffect, ReactNode } from 'react';
import styles from "@/styles/chat.module.css";
import useSocketContext from '@/lib/socket';

import ChatMenu from './menu';

export default function ChatRoom() {
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

	useEffect(() => {
		const chatLogList = document.querySelector('#chatLogList') as HTMLDivElement;
		chatLogList && (chatLogList.scrollTop = chatLogList.scrollHeight);
	}, [chatLog]);

	const sendMsg = () => {
		const inputField = document.querySelector('#chatInputField') as HTMLInputElement;

		if (!inputField?.value || !chatLog) return;
		setChatLog([
			...chatLog,
			inputField.value
		]);
		inputField.focus();
		inputField.value = '';
	};
	
	return (
		<div className={styles.chatBox}>
			<div
				id="chatLogList"
				style={{
					height: '96%',
					overflowY: 'scroll',
				}}>
				<ul>
					{chatLog.map((log, key) => {
						return (
							<li key={key}>
								{`: ${log}`}
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
