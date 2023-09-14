'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';
import { useTfaContext } from './context/tfaContextProvider';

export default function Page() {
  const { loggedIn, user,  } = useAuthContext();
  // const {tfaOk, setTfa}: any = useTfaContext();
  const router = useRouter();

  useEffect(() => {
    if (loggedIn === true) {
      router.push('/chat');
    } else {
      
      router.push('/login');
    }
  }, [loggedIn]);
  return <></>;
}
