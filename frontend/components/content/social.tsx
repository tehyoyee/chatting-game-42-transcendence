import { useEffect } from "react";
import usePlayerContext, { EPlayerState } from "./player_state";
import { IChatMate, EChatUserType } from '../content/chat/context';
import UserList from "@/components/structure/userList";
import { useFetch } from "@/lib/hook";
import useAuthContext from "@/components/user/auth";

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const relationUrl = `${serverUrl}/relation`;

export default function Social() {
	const { setPlayerState } = usePlayerContext();
	const { user } = useAuthContext();

	const [friendList, updateFriendList] = useFetch<IChatMate[]>(`${relationUrl}/social/friends/${user.id}`, [], async (path) => {
		return fetch(path, {
			method: "GET",
			credentials: "include",
		})
		.then(res => {
				if (!res.ok) throw new Error(`invalid response: ${res.status}`);
				return res.json();
		});
	});
	const [blocksList, updateBlocksList] = useFetch<IChatMate[]>(`${relationUrl}/social/blocks/${user.id}`, [], (path) => {
		return fetch(path, {
			method: "GET",
			credentials: "include",
		})
		.then(res => {
				if (!res.ok) throw new Error(`invalid response: ${res.status}`);
				return res.json();
		});
	});

	useEffect(() => {
		setPlayerState(EPlayerState.SOCIAL);
		updateBlocksList();
		updateFriendList();
	}, []);

	useEffect(() => {
		console.log('blocksList: ', blocksList);
		console.log('friendList: ', friendList);
	}, [blocksList, friendList]);

  return (
		<div
			style={{
				display: "grid",
			}}>
			<div>
				<p>친구 목록</p>
				<UserList userList={friendList} updateUserList={updateFriendList}></UserList>
			</div>
			<div>
				<p>차단 목록</p>
				<UserList userList={blocksList} updateUserList={updateBlocksList}></UserList>
			</div>
		</div>
  );
}
