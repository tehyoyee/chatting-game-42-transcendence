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
	SetPwd,
	RemPwd,
	SetAdmin,
};

const controlTypeData: {event:string, field:string}[] = [
	{event: "ban-User", field: "banInput"},
	{event: "kick-user", field: "kickInput"},
	{event: "onMuteUser", field: "muteInput"},
	{event: "set-password", field: "pwdInput"},
	{event: "change-password", field: "pwdInput"},
	{event: "set-admin", field: "setAdminInput"},
];

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
				<select
					id="userInput">
					{
						userList.map((user, index) => {
							return (
								<option key={index} value={user.userId}>
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
					e.preventDefault(); chatSocket && requestUser(ControlType.Ban, user, chatSocket)
				}} 
				className={`${styles.normalButton}`}>
				{'밴'}
			</button>
			<button
				type='button'
				onClick={(e) => {
					e.preventDefault(); chatSocket && requestUser(ControlType.Kick, user, chatSocket)
				}} 
				className={styles.normalButton}>
				{'킥'}
			</button>
			<button
				type='button'
				onClick={(e) => {
					e.preventDefault(); chatSocket && requestUser(ControlType.Mute, user, chatSocket)
				}} 
				className={styles.normalButton}>
				{'뮤트'}
			</button>
			<button
				type='button'
				onClick={(e) => {
					e.preventDefault(); chatSocket && requestUser(ControlType.SetAdmin, user, chatSocket)
				}} 
				className={styles.normalButton}>
				{'운영자 권한 부여'}
			</button>
			<br />
			<br />
			<TextInputForm
				onSubmit={() => {chatSocket && setPwd(user, chatSocket)}}
				id={`${controlTypeData[ControlType.SetPwd].field}`}
				pattern={'[a-zA-Z0-9]{4,16}'}
				>
				{'비밀번호 설정'}
			</TextInputForm>
			<button 
				type='button' 
				className='normalButton'
				onClick={(e) => {
					e.preventDefault(); chatSocket && removePwd(user, chatSocket);
				}}>
				{'비밀번호 해제'}
			</button>
		</div>
	);
}

function requestUser(type: ControlType, user: IChatUser, socket: Socket) {
	const input = document.querySelector('select') as HTMLSelectElement;
	const userid = input.value;

	console.log(`userid = ${userid}`);
	socket.on('usermod-success', (msg) => {
		console.log(`usermod-success: ${msg}`);
		socket.off('usermod-success');
	});
	socket.on('usermod-fail', (msg) => {
		console.log(`usermod-fail: ${msg}`);
		socket.off('usermod-fail');
		alert('요청에 실패했습니다.');
	});
	socket.emit(`${controlTypeData[type].event}`, {
		targetUserId: userid,
		channelId: user.channel_id,
	});
}

function removePwd(user: IChatUser, socket: Socket) {
	socket.on('removepwd-success', (msg) => {
		console.log(`removepwd-success: ${msg}`);
		socket.off('removepwd-success');
	});
	socket.on('removepwd-fail', (msg) => {
		console.log(`removepwd-fail: ${msg}`);
		socket.off('removepwd-fail');
		alert('요청에 실패했습니다.');
	});
	socket.emit('remove-password', user.channel_id);
}

function setPwd(user: IChatUser, socket: Socket) {
	const input = document.querySelector(`#${controlTypeData[ControlType.SetPwd].field}`) as HTMLInputElement;
	socket.on('setpwd-success', (msg) => {
		console.log(`setpwd-success: ${msg}`);
		socket.off('setpwd-success');
	});
	socket.on('setpwd-fail', (msg) => {
		console.log(`setpwd-fail: ${msg}`);
		socket.off('setpwd-fail');
		alert('요청에 실패했습니다.');
	});
	if (!input?.value) return;
	socket.emit('set-password', {
		channelId: user.channel_id,
		password: input.value,
	});
}
/*
 * ban (banned)
 * kick (kicked)
 * mute (muted)
 * setadmin for owner (setadmin-ed)
 * set password (message)
 * change password (message)
 * remove password
 */
