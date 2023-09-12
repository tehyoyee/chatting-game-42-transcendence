import React from 'react';
import NavBar from '@/components/structure/navbar';
import Logout from '@/components/user/logout';
// object outside bracket is export default one and objects inside bracket are declared with just export keyword
import titleStyles from '@/styles/title.module.css';

import styles from '@/styles/logout.module.css';


export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <h1 className={titleStyles.mainTitle}>Transcendence</h1>
      <Logout></Logout>
      <NavBar></NavBar>
      <div className="contentBox">
	{children}
      </div>
    </>
  );
}
