'use client'

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';

export default function ComponentProtector({ children }: { children: ReactNode }) {
  const { loggedIn } = useAuthContext();
	const router = useRouter();

	useEffect(() => {
		if (loggedIn == false) {
			router.push('/');
		}
	}, []);

  return ((loggedIn && <>{children}</>) || <></>);
}
