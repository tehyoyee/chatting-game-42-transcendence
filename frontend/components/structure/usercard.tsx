import chatStyles from '@/styles/chat.module.css';
import styles from '@/styles/social.module.css';
import { IChatMate } from "@/components/content/chat/context";

export default function UserCard({
	user,
}: {
	user: IChatMate,
}) {
	return (
		<button
			className={`${chatStyles.button} ${styles.playerCard}`}
			style={{
			backgroundColor: "lightgray",
			}}>
			{user.userNickName}
		</button>
	);
}
