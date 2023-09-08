import React from 'react';
import NavBar from '../../components/navbar';
// object outside bracket is export default one and objects inside bracket are declared with just export keyword
import SideBar from '../../components/sidebar';

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavBar></NavBar>
      <SideBar state={{ pos: 0 }}> </SideBar>
      <SideBar state={{ pos: 1 }}> </SideBar>
      <section>
	{children}
      </section>
    </>
  );
}
