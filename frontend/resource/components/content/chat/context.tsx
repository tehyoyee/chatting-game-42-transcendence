'use client'

import { useState, useEffect, useContext, createContext } from 'react';
import { IProfileType } from '@/components/content/profile/profile';

export enum EUserStatus {
	ONLINE = "online",
	OFFLINE = "offline",
	PLAYING = "playing",
}

export enum EChatUserType {
	OWNER = "owner",
	ADMIN = "admin",
	MEMBER = "member",
}

export interface IChatUser {
	user_type: EChatUserType,
	channel_id: number,
};

export interface ISocial {
	userId: number,
	userNickName: string,
	isFriend: boolean,
	isBlocked: boolean,
	userStatus: EUserStatus,
}

export interface IChatMate {
	userId: number,
	userNickName: string,
	userType: string,
	isMuted: boolean,
	isFriend: boolean,
	isBlocked: boolean,
	userStatus: EUserStatus,
}

export type TChatContext = {
	user: IChatUser,
	setUser: React.Dispatch<React.SetStateAction<IChatUser>>,
	joined: boolean,
	setJoined: React.Dispatch<React.SetStateAction<boolean>>,
};

const ChatContext = createContext<TChatContext | null>(null);

export default function useChatContext(): TChatContext {
	const chatContext = useContext(ChatContext);
	if (!chatContext) {
		throw new Error("useChatContext is null. it must be used within <ChatContextProvider>");
	}
	return chatContext;
};

export function ChatContextProvider({ children }: { children: React.ReactNode }) {
	const [joined, setJoined] = useState(false);
	const [chatUser, setChatUser] = useState<IChatUser>({
		user_type: EChatUserType.OWNER, // NOTE
		channel_id: -1,
	});
	const chatContext: TChatContext = {
		user: chatUser,
		setUser: setChatUser,
		joined: joined,
		setJoined: setJoined,
	};
	return (
		<ChatContext.Provider value={chatContext}>
			{children}
		</ChatContext.Provider>
	);
}
