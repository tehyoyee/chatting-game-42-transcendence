import Image from 'next/image';
import User from './user';

// component parameter explained
// ({ props, children })
export default function Profile({ user }: { user: User }) {
  return (
    <>
      <h2>{`${user.name} Profile`}</h2>
      <Image src="next.svg" alt={`${user.name}'s profile image`} 
	width={128} height={128} />
      <p>
	{"abc"}
      </p>
    </>
  );
}
