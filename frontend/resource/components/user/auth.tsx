'use client'

import { useContext, useEffect, useState, useCallback, ReactNode, createContext } from 'react';

const stateUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/auth/state`;

type UserIdentifier = {
	username: string,
	id: number,
}

type AuthContextType = {
  loggedIn: boolean,
  user: UserIdentifier,
  updateLoginState: Function,
  updated: boolean,
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function useAuthContext() {
  const currentAuthContext = useContext(AuthContext);
  if (currentAuthContext == null) {
    throw new Error("AuthContext is null. it must be used within <AuthContextProvider>");
  }
  return currentAuthContext;
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [user, setUser] = useState({
		username: '',
		id: 0,
	});

  const updateLoginState = useCallback(async () => {
		let loggedInRet = false;
    await fetch(stateUrl, {
      method: 'GET',
      credentials: 'include',
			cache: 'no-cache',
    })
    .then(res => {
			if (!res.ok) throw new Error(`invalid response: ${res.status}`);
			return res.json()
		})
    .then(data => {
      //console.log('updateLoginState: ', data);
      setUpdated(true);
      setLoggedIn((loggedin) => data.loggedIn);
			loggedInRet = data.loggedIn;
      data.user && setUser(data.user);
    })
    .catch(reason => {
			setLoggedIn(false);
      console.log(`${stateUrl}: fecth failed: ${reason}`);
    });
		return loggedInRet;
  }, []);

  useEffect(() => {
    updateLoginState();
  }, [updateLoginState]);
  // does monitoring required?

  return (
    <AuthContext.Provider value={{ loggedIn, user, updateLoginState, updated }}>
      {children}
    </AuthContext.Provider>
  );
}

