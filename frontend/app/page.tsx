'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';

export default function Page() {
  const { loggedIn } = useAuthContext();
	const router = useRouter();

	useEffect(() => {
		if (loggedIn === true) {
			router.push('/game');
		} else {
			router.push('/login');
		}
	}, [loggedIn]);
	return <></>;
}
