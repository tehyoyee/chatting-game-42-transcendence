'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthContext from "@/components/user/auth";
import Login from "@/components/user/login";

export default function Page() {
  const { loggedIn, updated, updateLoginState } = useAuthContext();
  const router = useRouter();

  console.log(`rendering loginpage: updated=${updated} loggedIn=${loggedIn}`);
// TODO: buggy
  useEffect(() => {
		updateLoginState();
  }, []);

	useEffect(() => {
		if (loggedIn === true) {
			router.push('/profile');
		}
	}, [loggedIn]);
  return (
    <>
      { updated && !loggedIn && <Login></Login> }
    </>
  );
}
/*
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthContext from "@/components/user/auth";

export default function Page() {
  const { updateLoginState, loggedIn } = useAuthContext();
  const router = useRouter();

	useEffect(() => {
    updateLoginState();
	}, []);

  useEffect(() => {
		if (loggedIn === true) {
			router.push("/profile");
		} else {
			router.push("/login");
		}
  }, [loggedIn]);
  return <>' '</>;
}
*/
