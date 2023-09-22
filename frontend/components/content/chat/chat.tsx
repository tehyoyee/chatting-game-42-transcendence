'use client'

import { useState, useEffect, ReactNode } from 'react';
import useSocketContext from '@/lib/socket';
import ChatList from '@/components/content/chat/list';
import ChatRoom from '@/components/content/chat/room';

export default function ChatLobby() {
	const [joined, setJoined] = useState(false);
	const { chatSocket } = useSocketContext();

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
				<ChatList setJoined={setJoined}></ChatList>
			</>
			:
			<>
				<ChatRoom></ChatRoom>
			</>
		}
		</>
  );
}
