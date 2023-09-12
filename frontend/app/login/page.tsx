'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/user/auth";
import Login from "@/components/user/login";

export default function Page() {
	const { loggedIn, updated } = useAuthContext();
	const router = useRouter();

	console.log("rendering loginpage");
	useEffect(() => {
		if (loggedIn === true) {
			router.push('/');
		}
	}, [loggedIn]);
  return (
    <>
			{ updated && !loggedIn && <Login></Login> }
    </>
  );
}
