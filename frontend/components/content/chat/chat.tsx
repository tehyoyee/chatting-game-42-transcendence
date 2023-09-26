'use client'

import { useState, useEffect, ReactNode } from 'react';
import useSocketContext from '@/lib/socket';
import useChatContext from './context';
import ChatList from './list';
import ChatRoom from './room';
import { useRouter } from 'next/navigation';

export default function ChatLobby() {
	const { gameSocket, chatSocket } = useSocketContext();
	const { joined } = useChatContext();
	const router = useRouter();

	chatSocket?.on('get-user-channel', () => {});

	useEffect(() => {
		if (!gameSocket) return;
		gameSocket?.on("gameStart", (obj) => {
      router.push("/game/play");
		});
		return () => {
			gameSocket?.off();
		};
	}, [gameSocket]);

	useEffect(() => {
		if (!chatSocket) {
			// TODO: check it works?
		}
	}, []);
  return (
		<>
		{
			!joined ?
			<>
				<ChatList></ChatList>
			</>
			:
			<>
				<ChatRoom></ChatRoom>
			</>
		}
		</>
  );
}
