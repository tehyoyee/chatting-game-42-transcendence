'use client'

import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/user/auth';
import Login from '@/components/user/login';

export default function Home() {
  const router = useRouter();
  const { loggedIn } = useAuthContext();

  if (loggedIn !== true) {
    return <Login></Login>;
  }
  router.push('/content/game');
}
