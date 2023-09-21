'use client'

import { ReactNode, useState, useEffect, useContext, createContext } from 'react';
import { io, Socket } from 'socket.io-client';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const chatUrl = `${serverUrl}/chat`;
const gameUrl = `${serverUrl}/game`;

type SocketContextType = {
	chatSocket: Socket | null,
	gameSocket: Socket | null,
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
	const [socketContext, setSocketContext] = useState<SocketContextType>({
		chatSocket: null,
		gameSocket: null,
	});

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

function initChatSocket(socket: Socket) {
	socket.on('connect', () => {
		console.log("chatsocket connected");
	});
}

function initGameSocket(socket: Socket) {
	socket.on('connect', () => {
		console.log("gamesocket connected");
	});
}
