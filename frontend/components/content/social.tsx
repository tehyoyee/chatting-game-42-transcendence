import { useEffect } from "react";
import usePlayerContext, { EPlayerState } from "./player_state";
import { IChatMate, EChatUserType } from '../content/chat/context';
import UserList from "@/components/structure/userList";
import { useFetch } from "@/lib/hook";
import useAuthContext from "@/components/user/auth";

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;

export default function Social() {
	const { setPlayerState } = usePlayerContext();
	const { user } = useAuthContext();

	const [friendList, updateFriendList] = useFetch<IChatMate[]>(`${serverUrl}/social/friends/${user.id}`, [], /*TODO: fetcher*/);
	const [blocksList, updateBlocksList] = useFetch<IChatMate[]>(`${serverUrl}/social/blocks/${user.id}`, [], /*TODO: fetcher*/);

	useEffect(() => {
		setPlayerState(EPlayerState.SOCIAL);
	}, []);

  return (
		<>
			<p>친구 목록</p>
			<UserList users={friendList}></UserList>
			<p>차단 목록</p>
			<UserList users={blocksList}></UserList>
		</>
  );
}
