'use client'

import { useState, useEffect, ReactNode } from 'react';
import useSocketContext from '@/lib/socket';
import useChatContext from './context';
import ChatList from './list';
import ChatRoom from './room';
import BackToTop from '@/components/content/backToTop';

export default function ChatLobby() {
	const { chatSocket } = useSocketContext();
	const { joined } = useChatContext();

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
		<BackToTop></BackToTop>
		</>
  );
}
