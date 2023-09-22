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
	AddAdmin,
};

const controlTypeData: {event:string, field:string}[] = [
	{event: "ban-User", field: "banInput"},
	{event: "kick-user", field: "kickInput"},
	{event: "onMuteUser", field: "muteInput"},
	{event: "set-password", field: "setPwdInput"},
	{event: "change-password", field: "modPwdInput"},
	{event: "remove-password", field: "remPwdInput"},
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
		<form>
			<div 
				style={{
					border: "solid 1px black",
					padding: "3px",
				}}
				>
				{'user: '}
				<select>
					{
						userList.map((user) => {
							return (
								<option>
									{user.userNickName}
								</option>
							);
						})
					}
				</select>
			</div>
			<br />
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
		</form>
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
		case ControlType.RemPwd:
			break;
	};
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
