import useChatContext, { IChatUser, IChatMate, EChatUserType } from './context';
import TextInputForm from '@/components/structure/textinput';

export default function ChatControl({
	userList,
}: {
	userList: IChatMate[],
}) {
	return (
		<div>
			<TextInputForm onSubmit={requestBan} id='banUser'>{'Ban User'}</TextInputForm>
			<TextInputForm onSubmit={requestKick} id='kickUser'>{'Kick User'}</TextInputForm>
			<TextInputForm onSubmit={requestMute} id='muteUser'>{'Mute User'}</TextInputForm>

		</div>
	);
}

function requestBan() {
	const input = document.querySelector('#banUser');
}

function requestKick() {
	const input = document.querySelector('#kickUser');
}

function requestMute() {
	const input = document.querySelector('#muteUser');
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
 */
