import React from 'react';
// object outside bracket is export default one and objects inside bracket are declared with just export keyword
import titleStyles from '/styles/title.module.css';

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <h1 className={titleStyles.mainTitle}>Transcendence</h1>
    </>
  );
}
