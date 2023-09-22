import { useEffect } from 'react';
import { Socket } from 'socket.io-client';

import styles from '@/styles/chat.module.css';
import useSocketContext from '@/lib/socket';
import TextInputForm from '@/components/structure/textinput';
import useChatContext, { IChatUser, IChatMate, EChatUserType } from './context';

enum ControlType {
	Ban = 0,
	Kick,
	Mute,
	AddPwd,
	ModPwd,
	RemPwd,
	SetAdmin,
};

const controlTypeData: {event:string, field:string}[] = [
	{event: "ban-User", field: "banInput"},
	{event: "kick-user", field: "kickInput"},
	{event: "onMuteUser", field: "muteInput"},
	{event: "set-password", field: "pwdInput"},
	{event: "change-password", field: "pwdInput"},
	{event: "remove-password", field: "pwdInput"},
	{event: "set-admin", field: "setAdminInput"},
];

// TODO: 
// 1. user list on input text
// 2. get user list and print
export default function ChatControl({
	userList,
}: {
	userList: IChatMate[],
}) {
	const { user } = useChatContext();
	const { chatSocket } = useSocketContext();

	useEffect(() => {
	}, []);
	return (
		<div>
			<div 
				style={{
					border: "solid 1px black",
					padding: "3px",
				}}
				>
				{'user: '}
				<select>
					{
						userList.map((user, index) => {
							return (
								<option key={index}>
									{user.userNickName}
								</option>
							);
						})
					}
				</select>
			</div>
			<button
				type='button'
				onClick={(e) => {
					e.preventDefault(); chatSocket && request(ControlType.Ban, user, chatSocket)
				}} 
				className={`${styles.normalButton}`}
				id={`${controlTypeData[ControlType.Ban].field}`}>
				{'Ban'}
			</button>
			<button
				type='button'
				onClick={(e) => {
					e.preventDefault(); chatSocket && request(ControlType.Kick, user, chatSocket)
				}} 
				className={styles.normalButton}
				id={`${controlTypeData[ControlType.Kick].field}`}>
				{'Kick'}
			</button>
			<button
				type='button'
				onClick={(e) => {
					e.preventDefault(); chatSocket && request(ControlType.Mute, user, chatSocket)
				}} 
				className={styles.normalButton}
				id={`${controlTypeData[ControlType.Mute].field}`}>
				{'Mute'}
			</button>
			<br />
			<br />
			<TextInputForm
				tailMessage={'빈칸으로 제출시 비밀번호를 해제합니다.'}
				onSubmit={() => {chatSocket && handlePwd(user, chatSocket)}}
				id={`${controlTypeData[ControlType.AddPwd].field}`}
				>
				{'비밀번호 설정'}
			</TextInputForm>
		</div>
	);
}

function request(type: ControlType, user: IChatUser, socket: Socket) {
	const input = document.querySelector(`#${controlTypeData[type].field}`) as HTMLInputElement;
	const username = input;
	switch (type) {
		case ControlType.Ban:
		case ControlType.Kick:
		case ControlType.Mute:
			socket.emit(`${controlTypeData[type].event}`, {
				targetUserId: Number(input),
				channelId: user.channel_id,
			});
			break;
		case ControlType.AddPwd:
		case ControlType.ModPwd:
			socket.emit(`${controlTypeData[type].event}`, {
				channelId: user.channel_id,
				password: '0',
			});
			break;
		case ControlType.RemPwd:
			socket.emit(`${controlTypeData[type].event}`, {
				channelId: user.channel_id,
				password: '0',
			});
		case ControlType.SetAdmin:
			break;
	};
}

function handlePwd(user: IChatUser, socket: Socket) {
	const pwd = document.querySelector(`#${controlTypeData[ControlType.AddPwd].field}`) as HTMLInputElement;
	if (!pwd.value) {
		request(ControlType.RemPwd, user, socket);
		return;
	}
	request(ControlType.
}
/*
				<TextInputForm 
					onSubmit={() => {requestNameUpdate(uid)}}
					label="새 닉네임:"
					pattern="[a-zA-Z0-9]{4,16}"
					tailMassage="영어 소문자, 대문자, 숫자 4~16자리로 이뤄져야 합니다."
					>
				</TextInputForm>
				*/

/*
 * ban
 * kick
 * mute
 * setadmin for owner
 * set password
 * change password
 * remove password
 */
