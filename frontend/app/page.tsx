'use client'

import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';
import Login from '@/components/user/login';

export default function Home() {
  const router = useRouter();
  const authContext = useAuthContext();

  if (authContext?.loggedIn !== true) {
    return <Login></Login>;
  }
  router.push('/content/game');
}
