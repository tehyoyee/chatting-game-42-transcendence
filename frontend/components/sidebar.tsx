'use client'

import React, { ReactNode } from 'react';

export enum SideBarPos {
  left = 0,
  right = 1,
};

export interface SideBarState {
  pos: SideBarPos;
};

export default function SideBar({ state, children }: { state: SideBarState, children: ReactNode }) {
  const sideBarPosName = ["sideBarLeft", "sideBarRight"];
  return (
    <div className={`sideBar ${sideBarPosName[state.pos]}`}>
      <p>sidebar{state.pos}</p>
      {children}
    </div>
  );
}
