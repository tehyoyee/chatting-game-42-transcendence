import { useEffect } from "react";
import usePlayerContext, { EPlayerState } from "./player_state";
import { IChatMate, EChatUserType, ISocial } from '../content/chat/context';
import UserList from "@/components/structure/userList";
import { useFetch } from "@/lib/hook";
import useAuthContext from "@/components/user/auth";
import useSocketContext from "@/lib/socket";
import BackToTop from '@/components/content/backToTop';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const relationUrl = `${serverUrl}/relation`;

const friendFetcher = async (path: string) => {
	return fetch(path, {
		method: "GET",
		credentials: "include",
	})
	.then(res => {
			if (!res.ok) throw new Error(`invalid response: ${res.status}`);
			return res.json();
	});
};

const blockFetcher = (path: string) => {
	return fetch(path, {
		method: "GET",
		credentials: "include",
	})
	.then(res => {
			if (!res.ok) throw new Error(`invalid response: ${res.status}`);
			return res.json();
	});
};

export default function Social() {
	const { setPlayerState } = usePlayerContext();
	const { user } = useAuthContext();
	const { chatSocket, gameSocket } = useSocketContext();

	const [friendList, updateFriendList] = useFetch<ISocial[]>(`${relationUrl}/social/friends/${user.id}`, [], friendFetcher);
	const [blocksList, updateBlocksList] = useFetch<ISocial[]>(`${relationUrl}/social/blocks/${user.id}`, [], blockFetcher);

	function updateUserList() {
		updateBlocksList();
		updateFriendList();
	}

	useEffect(() => {
		if (!chatSocket || !gameSocket) return;
		chatSocket.on('refreshStatus', () => {
			updateUserList();
		});
		gameSocket?.on('refreshGameStatus', () => {
			updateUserList();
		});
		return () => {
			chatSocket.off('refreshStatus');
			gameSocket.off('refreshGameStatus');
		}
	}, []);

	useEffect(() => {
		setPlayerState(EPlayerState.SOCIAL);
		updateUserList();
	}, []);

	useEffect(() => {
		console.log('blocksList: ', blocksList);
		console.log('friendList: ', friendList);
	}, [blocksList, friendList]);

  return (
		<div
			style={{
				display: "flex",
				textAlign: "center",
			}}>
			<div style={{margin: "0px 0px 0px 60px",}}>
				<p style={{fontSize: '20px'}}>친구 목록</p>
				<UserList userList={friendList} updateUserList={updateFriendList}></UserList>
			</div>
			<div style={{margin: "0px 0px 0px 210px", }}>
				<p style={{fontSize: '20px',}}>차단 목록</p>
				<UserList userList={blocksList} updateUserList={updateBlocksList}></UserList>
			</div>
			<BackToTop></BackToTop>
		</div>

  );
}
