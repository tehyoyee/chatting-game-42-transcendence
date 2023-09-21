import { useState, useEffect } from 'react';
import styles from '@/styles/chat_manage.module.css';
import useSocketContext from '@/lib/socket';

enum Type {
	Public = 1,
	Private,
	Password,
};

const evt_create_normal = "create-group-channel";
const evt_create_dm = "create-dm-channel";

export function ChatMenu() {
	const [chatType, setChatType] = useState<Type>(Type.Public);
	const { chatSocket } = useSocketContext();

	// NOTE: is it necessary to check socket established?
	useEffect(() => {
		if (!chatSocket) {
		}
	}, []);

	function handleTypeChange(e: any) {
		switch (Number(e.target.value)) {
			case Type.Public:
				setChatType(Type.Public);
				break;
			case Type.Private:
				setChatType(Type.Private);
				break;
			case Type.Password:
				setChatType(Type.Password);
				break;
		}
	}

	function handleCreation() {
		const nameElem = document.querySelector('#chatNameField') as HTMLInputElement;
		const passwordElem = document.querySelector('#chatPwd') as HTMLInputElement;
		const name = nameElem.value;
		const password = passwordElem?.value;

		if (!chatSocket) {
			console.error("chatsocket error");
			return;
		}
		switch (chatType) {
			case Type.Public:
			case Type.Private:
				chatSocket.emit(evt_create_normal, {
					channelName: name,
					channelType: chatType,
				});
				break;
			case Type.Password:
				chatSocket.emit(evt_create_normal, {
					channelName: name,
					channelType: chatType,
					password: password,
				});
				break;
		}
		console.log(`${chatType}: chat creation request`);
		if (!chatSocket) return;
		chatSocket.on('join', () => {});
		chatSocket.on('creation_fail', () => {});

//		chatSocket.emit(evt_create_normal, formData);
	}

	return (
		<div className={styles.chatMenu}>
			<form id='chatCreateForm' onSubmit={e => {e.preventDefault(); handleCreation();}}>
				<label 
					htmlFor="nameField">채팅방 이름</label>
				<input 
					id='chatNameField'
					name='name'
					style={{
						margin: "6px",
						border: "solid 1px black",
					}}
					type="text"
					pattern="[a-zA-Z0-9]{2,16}"
					required
				/>
				<fieldset onChange={handleTypeChange}>
					<legend>채팅방 종류</legend>
					<div>
						<input type='radio' id='public' name='type' value={Type.Public} defaultChecked/>
						<label htmlFor='public'>Public</label>
					</div>

					<div>
						<input type='radio' id='private' name='type' value={Type.Private}/>
						<label htmlFor='private'>Private</label>
					</div>

					<div>
						<input type='radio' id='password' name='type' value={Type.Password}/>
						<label htmlFor='password'>With Password</label>
					</div>
				</fieldset>
				{
					(chatType == Type.Password) &&
						<>
							<label 
								htmlFor="nameField">비밀번호
							</label>
							<input 
								id='chatPwd'
								name='pwd'
								style={{
									margin: "6px",
									border: "solid 1px black",
									marginBottom: "16px", /* to align bottom button */
								}}
								type="text"
								pattern="[a-zA-Z0-9]{4,16}"
								required
							/>
						</> ||
						<>
						{/*to align bottom button*/}
							<br />
							<br />
						</>
				}
				<button
					id='chatCreateButton'
					type='submit'
					style={{
						position: "relative",
						top: "200px",
						padding: "2px",
						border: "solid 1px black",
						backgroundColor: "lightgray",
						borderRadius: "0.3rem",
					}}
					>생성하기</button>
			</form>
		</div>
	);
}
/*
 * options for chat room creation
 *
 * 1. public, private or password
 * 1-2. if password, get password
 * 1-3. if private, ?
 * 2. room name
 * 2-1. if name is duplicate, prompt retry
 *
 */
