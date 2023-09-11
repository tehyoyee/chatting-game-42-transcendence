'use client'

import React, { ReactNode } from 'react';
import styles from '@/styles/sidebar.module.css';

export enum SideBarPos {
  left = 0,
  right = 1,
};

export interface SideBarState {
  pos: SideBarPos;
};

export default function SideBar({ state, children }: { state: SideBarState, children: ReactNode }) {
  const sideBarPosName = [styles.sideBarLeft, styles.sideBarRight];
  return (
    <div className={`${styles.sideBar} ${sideBarPosName[state.pos]}`}>
      <p>sidebar{state.pos}</p>
      {children}
    </div>
  );
}
