import styles from '@/styles/chat_manage.module.css';
import useSocketContext from '@/lib/socket';

export function ChatMenu() {
	return (
		<div className={styles.chatMenu}>
			<form>

				<fieldset>
					<legend>채팅방 종류</legend>
					<div>
						<input type='radio' id='public' name='type' value='public'/>
						<label htmlFor='public'>Public</label>
					</div>

					<div>
						<input type='radio' id='private' name='type' value='private'/>
						<label htmlFor='private'>Private</label>
					</div>

					<div>
						<input type='radio' id='password' name='type' value='password'/>
						<label htmlFor='password'>With Password</label>
					</div>
				</fieldset>
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
