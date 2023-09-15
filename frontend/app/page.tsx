'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';
import { useTfaContext } from './context/tfaContextProvider';

export default function Page() {
  const { loggedIn } = useAuthContext();
  // const {tfaOk, setTfa}: any = useTfaContext();
  const router = useRouter();

  useEffect(() => {
    if (loggedIn === true) {
      router.push('/profile'); // when change this line, sync with navbar component
    } else {
      router.push('/login');
    }
  }, [loggedIn, router]);
  return <></>;
}
