'use client'

import React, { useEffect, useContext, createContext, useState } from "react";

export enum EPlayerState {
	NORMAL,
	GAME_MATCHING,
	GAME_PLAYING,
	CHAT_JOINING,
};

export type TPlayerContext = {
	playerState: EPlayerState,
	setPlayerState: React.Dispatch<React.SetStateAction<EPlayerState>>,
	playerData: any,
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
	const [state, setState] = useState<EPlayerState>(EPlayerState.NORMAL);
	const [data, setData] = useState<any>(null);

	useEffect(() => {
		console.log(`playerState=${state}, playerData=${JSON.stringify(data)}`);
	}, [state, data]);
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
