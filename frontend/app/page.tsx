'use client'

import { useRouter } from 'next/navigation';
import Login from '../components/login';
import Profile from '../components/profile';
import useToken from './useToken';

export default function Home() {
  const router = useRouter();
  const {token, setToken} = useToken();

  if (!token) {
    return <Login setToken={setToken}></Login>;
  }
  router.push('/content/game');
  return <Profile></Profile>;
}
