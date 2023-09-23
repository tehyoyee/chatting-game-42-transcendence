'use client'

import Link from 'next/link';
import { useState } from 'react';
import styles from '@/styles/navbar.module.css';
import useSocketContext from '@/lib/socket';
import usePlayerContext, { EPlayerState } from '../content/player_state';

enum NavBarPos {
  chat,
  social,
  game,
  profile,
}

// sessionStorage, localStorage to store status
// export default function NavBar({ status }: { status: NavBarPos }) {
export default function NavBar() {
  const [navState, setNavState] = useState(NavBarPos.profile); // when change this line, sync with root page
  const navBtn: string[] = ["chat", "social", "game", "profile"];
	const { chatSocket, gameSocket } = useSocketContext();
	const { playerState, setPlayerState, playerData } = usePlayerContext();

  function updateState(e: any) {
    // other option instead of indexOf and textContent?
    const state: NavBarPos = navBtn.indexOf(e.target.textContent);

		switch (playerState) {
			case EPlayerState.GAME_PLAYING:
				gameSocket?.emit('exitGame',);
				break;
			case EPlayerState.GAME_MATCHING:
				gameSocket?.emit('exitQueue',);
			break;
			case EPlayerState.CHAT_JOINING:
				chatSocket?.emit('close-channel-window', playerData.channel_id);
			break;
			default:
			break;
		}
		setPlayerState(EPlayerState.NORMAL);
    setNavState(state);
  }

  return (
    <div className={styles.navbar} onClick={updateState}>
      {navBtn.map((name: string) => {
        return (
          <Link
            key={name}
            id={`#${name}NavBtn`}
            className={`${styles.button} ${navBtn[navState] === name ? styles.current : styles.rest}`}
            href={`/${name}`}>{name}
          </Link>
        );
      })}
    </div>
  );
}
