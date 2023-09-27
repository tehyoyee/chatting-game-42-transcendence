'use client'

import Profile from '@/components/content/profile/profile';
import useAuthContext from '@/components/user/auth';
import dynamic from 'next/dynamic'
 
// Client Components:
const ProfileComponent = dynamic(() => import('@/components/content/profile/profile'), { ssr: false })
 
export default function Page() {
	const { user } = useAuthContext();
  return (
  <>
    <ProfileComponent uid={user.id} isMyProfile={true}></ProfileComponent>
  </>
  );
}
