import chatStyles from '@/styles/chat.module.css';
import styles from '@/styles/social.module.css';
import { IChatMate, EChatUserType } from "@/components/content/chat/context";

export default function UserCard({
	user,
}: {
	user: IChatMate,
}) {
	let color;
	switch (user.userType) {
		case EChatUserType.OWNER:
			color = "lightpink";
			break;
		case EChatUserType.ADMIN:
			color = "lightcoral";
			break;
		default:
			color = "lightgray";
	}
	return (
		<button
			className={`${chatStyles.button} ${styles.playerCard}`}
			style={{
			backgroundColor: color,
			}}>
			{user.userNickName}
		</button>
	);
}
