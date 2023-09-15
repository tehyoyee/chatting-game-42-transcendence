'use client'

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';

export default function ComponentProtector({ children }: { children: ReactNode }) {
	// TODO: logout redirection?
  const { loggedIn, updateLoginState } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
		(async() => {
			await updateLoginState();
			if (loggedIn == false) {
				router.push('/');
			}
		})()
  }, []);

  return ((loggedIn && <>{children}</>) || <></>);
}
