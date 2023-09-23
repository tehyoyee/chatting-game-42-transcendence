'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from '@/styles/navbar.module.css';
import useSocketContext from '@/lib/socket';
import usePlayerContext, { EPlayerState } from '../content/player_state';

enum NavBarPos {
  chat = 0,
  social,
  game,
  profile,
};

const PlayerStateToNav: NavBarPos[] = [
	NavBarPos.chat,
	NavBarPos.chat,
	NavBarPos.social,
	NavBarPos.game,
	NavBarPos.game,
	NavBarPos.game,
	NavBarPos.profile,
];

const NavToPlayerState: EPlayerState[] = [
	EPlayerState.CHAT,
	EPlayerState.SOCIAL,
	EPlayerState.GAME,
	EPlayerState.PROFILE,
];

// sessionStorage, localStorage to store status
// export default function NavBar({ status }: { status: NavBarPos }) {
export default function NavBar() {
  const navBtn: string[] = ["chat", "social", "game", "profile"];
	const { playerState, setPlayerState } = usePlayerContext();

  function updateState(e: any) {
    // other option instead of indexOf and textContent?
    const state: NavBarPos = navBtn.indexOf(e.target.textContent);

		setPlayerState(NavToPlayerState[state]);
  }

  return (
    <div className={styles.navbar} onClick={updateState}>
      {navBtn.map((name: string) => {
        return (
          <Link
            key={name}
            id={`#${name}NavBtn`}
            className={`${styles.button} ${navBtn[PlayerStateToNav[playerState]] === name ? styles.current : styles.rest}`}
            href={`/${name}`}>{name}
          </Link>
        );
      })}
    </div>
  );
}
