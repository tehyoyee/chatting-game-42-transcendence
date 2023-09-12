'use client'

import { useContext, useEffect, useState, useCallback, ReactNode, createContext } from 'react';

const stateUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/auth/state`;

interface IAuthContext {
  loggedIn: boolean,
  user: Object,
  updateLoginState: Function,
};

const AuthContext = createContext<IAuthContext | null>(null);

export function useAuthContext() {
  const currentAuthContext = useContext(AuthContext);
  if (currentAuthContext == null) {
    throw new Error("AuthContext is null. it must be used within <AuthContext.Provider>");
  }
  return currentAuthContext;
}

export default function AuthContextProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  const updateLoginState = useCallback(async () => {
    await fetch(stateUrl, {
      method: 'GET',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
			console.log(data);
      setLoggedIn(data.loggedIn);
      data.user && setUser(data.user);
    })
    .catch(reason => {
      console.log(`${stateUrl}: fecth failed: ${reason}`);
    });
  }, []);

  useEffect(() => {
    updateLoginState();
  }, [updateLoginState]);
  // does monitoring required?

  return (
    <AuthContext.Provider value={{ loggedIn, user, updateLoginState }}>
      {children}
    </AuthContext.Provider>
  );
}

