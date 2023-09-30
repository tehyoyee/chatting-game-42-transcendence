'use client'

import useSocketContext from "@/lib/socket";
import React, { useEffect, useContext, createContext, useState } from "react";
import useAuthContext from "../user/auth";
import { EChatUserType, IChatMate, IChatUser } from "./chat/context";

export enum EPlayerState {
	CHAT = 0,
	CHAT_JOINING,
	SOCIAL,
	GAME,
	GAME_MATCHING,
	GAME_PLAYING,
	PROFILE,
};

export type TPlayerContext = {
	playerState: EPlayerState,
	setPlayerState: React.Dispatch<React.SetStateAction<EPlayerState>>,
	playerData: IChatUser,
	setPlayerData: React.Dispatch<React.SetStateAction<any>>,
};

const PlayerContext = createContext<TPlayerContext | null>(null);

export default function usePlayerContext() {
	const playerContext = useContext(PlayerContext);
	if (!playerContext) {
		throw new Error("usePlayerContext is null. it must be used within <PlayerContextProvider>");
	}
	return playerContext;
}

export function PlayerContextProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<EPlayerState>(EPlayerState.PROFILE);
	const [data, setData] = useState<IChatUser>({user_type: EChatUserType.MEMBER, channel_id: -1});
	const [prevState, setPrevState] = useState<EPlayerState>(state);
	const { chatSocket, gameSocket } = useSocketContext();
	const { updateLoginState } = useAuthContext();

	useEffect(() => {
		//console.log(`playerState [${prevState} -> ${state}], playerData=${JSON.stringify(data)}`);

		if (!gameSocket || !chatSocket) return;

		updateLoginState();
		switch (prevState) {
			case EPlayerState.GAME_PLAYING:
				gameSocket.emit('exitGame',);
				//console.log('exitGame');
				break;
			case EPlayerState.GAME_MATCHING:
				if (state === EPlayerState.GAME) break;
				gameSocket.emit('exitQueue',);
				//console.log('exitQueue');
				break;
			case EPlayerState.CHAT_JOINING:
				if (state === EPlayerState.CHAT) break;
				chatSocket.emit('close-channel-window', data.channel_id);
				//console.log('close-channel-window: ', data);
				break;
			default:
				break;
		}
		setPrevState(state);
	}, [state, chatSocket, gameSocket]);

	return (
		<PlayerContext.Provider value={{
			playerState: state, 
			setPlayerState: setState, 
			playerData: data, 
			setPlayerData: setData,
		}}>
			{ children }
		</PlayerContext.Provider>
	);
}
