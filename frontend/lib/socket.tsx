'use client'

import { ReactNode, useState, useEffect, useContext, createContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import useAuthContext from '@/components/user/auth';
import { TGameUsers } from '@/components/content/matching';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const chatUrl = `${serverUrl}/chat`;
const gameUrl = `${serverUrl}/game`;

type SocketContextType = {
	chatSocket: Socket | null,
	gameSocket: Socket | null,
};

type TGameInvite = {
	hostId: number,
	hostNickname: string,
	gameMode: string,
};

export const SocketContext = createContext<SocketContextType | null>(null);

export default function useSocketContext() {
	const socketContext = useContext(SocketContext);
	
	if (socketContext == null) {
		throw new Error("SocketContext is null. It must be used within <SocketContext.Provider> ");
	}
	return socketContext;
}

export function SocketContextProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { updateLoginState } = useAuthContext();
	const [socketContext, setSocketContext] = useState<SocketContextType>({
		chatSocket: null,
		gameSocket: null,
	});

	function initChatSocket(socket: Socket) {
		socket.on('connect', () => {
			console.log("chatsocket connected");
		});
		socket.on('disconnect', () => {
			console.log("chatsocket disconnected");
			router.push('/');
		});
		socket.on('forceLogout', async () => {
			console.log('chatSocket forceLogout');
			sessionStorage.removeItem('tfa');
			document.cookie = 'token' + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			await updateLoginState();
			router.push('/');
		});
	}

	function initGameSocket(socket: Socket) {
		socket.on('connect', () => {
			console.log("gamesocket connected");
		});
		socket.on('forceLogout', async () => {
			console.log('gameSocket forceLogout');
			sessionStorage.removeItem('tfa');
			document.cookie = 'token' + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			await updateLoginState();
			router.push('/');
		});
		socket.on('disconnect', () => {
			console.log("gamesocket disconnected");
			router.push('/');
		});
		socket.on('gotInvited', (data: TGameInvite) => {
			console.log('gotInvited');
			if (!confirm(`${data.hostNickname} 님이 ${data.gameMode}에 초대하셨습니다. 수락하시겠습니까?`)) {
//				socket.emit('declineGame', data.user_id);
				return;
			}
			socket.emit('acceptGame', {
				hostId: data.hostId,
				gameMode: data.gameMode,
			});
		});

		socket.on("gameStart", (obj: TGameUsers) => {
			router.push(`/game/matching?gameStart=true&leftUserName=${obj.leftUserName}&leftUserId=${obj.leftUserId}&rightUserName=${obj.rightUserName}&rightUserId=${obj.rightUserId}`);
		});
	}

	useEffect(() => {
		const userToken = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
		const socketOpt = {
			withCredentials: true,
			query: {
				token: userToken,
			},
		}
		console.log("socket connection request");
		const chatSocket = io(chatUrl, socketOpt);
		const gameSocket = io(gameUrl, socketOpt);

		initChatSocket(chatSocket);
		initGameSocket(gameSocket);

		setSocketContext({
			chatSocket: chatSocket,
			gameSocket: gameSocket,
		});
		return () => {
			chatSocket.close();
			gameSocket.close();
			console.log("socket closed");
		}
	}, []);

	return (
	<>
		<SocketContext.Provider value={socketContext}>
			{children}
		</SocketContext.Provider>
	</>
	);
}
