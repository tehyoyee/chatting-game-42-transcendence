import { useState, useEffect } from 'react';
import styles from '@/styles/chat_manage.module.css';
import useSocketContext from '@/lib/socket';
import useChatContext from './context';

enum Type {
	Public = 0,
	Private,
	Protected,
};

const TypeToString: string[] = [
	"public",
	"private",
	"protected",
];

const evt_create_normal = "create-group-channel";
const evt_create_dm = "create-dm-channel";

export function ChatCreate({ onClose }: { onClose: Function }) {
	const { user, setUser, setJoined } = useChatContext();
	const [chatType, setChatType] = useState<Type>(Type.Public);
	const { chatSocket } = useSocketContext();

	// NOTE: is it necessary to check socket established?
	useEffect(() => {
		if (!chatSocket) return;
			chatSocket.off('creation-success');
			chatSocket.off('creation-fail');
			chatSocket.on('creation-success', (data) => {
				console.log(`생성 성공: ${JSON.stringify(data)}`)
				onClose();
				setUser(data);
				setJoined(true);
			});
			chatSocket.on('creation-fail', (data) => {alert(`생성 실패: ${JSON.stringify(data)}`);});
	}, [chatSocket]);

	function handleTypeChange(e: any) {
		switch (Number(e.target.value)) {
			case Type.Public:
				setChatType(Type.Public);
				break;
			case Type.Private:
				setChatType(Type.Private);
				break;
			case Type.Protected:
				setChatType(Type.Protected);
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
				console.log(TypeToString[chatType]);
				chatSocket.emit(evt_create_normal, {
					channelName: name,
					channelType: TypeToString[chatType],
				});
				break;
			case Type.Private:
				chatSocket.emit(evt_create_dm, {
					channelName: name,
					channelType: TypeToString[chatType],
				});
				break;
			case Type.Protected:
				chatSocket.emit(evt_create_normal, {
					channelName: name,
					channelType: TypeToString[chatType],
					password: password,
				});
				break;
		}
		console.log(`${chatType}: chat creation request`);
		if (!chatSocket) return;
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
						<input type='radio' id='password' name='type' value={Type.Protected}/>
						<label htmlFor='password'>With Password</label>
					</div>
				</fieldset>
				{
					(chatType == Type.Protected) &&
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
