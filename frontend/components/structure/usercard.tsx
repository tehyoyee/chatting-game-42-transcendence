import { IChatMate } from "@/components/content/chat/context";

export default function UserCard({
	user,
}: {
	user: IChatMate,
}) {
	return (
		<div style={{
			}}>
			{user.user_nickname}
		</div>
	);
}
