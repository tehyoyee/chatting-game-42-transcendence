'use client'

import Profile from '@/components/content/profile/profile';
import useAuthContext from '@/components/user/auth';

export default function Page() {
	const { user } = useAuthContext();
  return (
  <>
    <Profile uid={user.id} isMyProfile={true}></Profile>
  </>
  );
}
