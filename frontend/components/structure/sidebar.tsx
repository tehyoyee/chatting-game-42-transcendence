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

export default function SideBar(
  { 
    children,
    className = "",
    width = ""
  }: {
    children: ReactNode,
    className?: string,
    width?: string,
  }) {
  return (
    <div className={`${styles.sideBar} ${className}`}
      style={{
        width: `${width}`,
      }}>
      {children}
    </div>
  );
}
