'use client'

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthContext from "@/components/user/auth";
import Login from "@/components/user/login";

export default function Page() {
  const { loggedIn, updated } = useAuthContext();
  const router = useRouter();

  console.log(`rendering loginpage: updated=${updated} loggedIn=${loggedIn}`);
// TODO: buggy
  useEffect(() => {
//		if (called.current) return;
//		called.current = true
    if (loggedIn === true) {
      router.push('/');
    }
  }, [router, loggedIn]);
  return (
    <>
      { updated && !loggedIn && <Login></Login> }
    </>
  );
}
