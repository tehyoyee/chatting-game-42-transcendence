'use client'

import { ReactNode } from 'react';
import styles from '@/styles/title.module.css';

export default function Title({ props, children }: { props: any, children: ReactNode }) {
  return <h1 className={styles.title}>{children}</h1>;
}
