import React from 'react';
// object outside bracket is export default one and objects inside bracket are declared with just export keyword

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  );
}
