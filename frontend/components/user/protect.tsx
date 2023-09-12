'use client'

import { ReactNode } from 'react';
import { useAuthContext } from '@/components/user/auth';

export default function ProtectComponent({ children }: { children: ReactNode }) {
  const { loggedIn } = useAuthContext();
  return (
    <>
      {children}
    </>
  );
}
