'use client'

import { useContext, useEffect, useState, useCallback, ReactNode, createContext } from 'react';

const loggedInUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/auth/login_state`;

interface IAuthContext {
  loggedIn: boolean,
  user: any,
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
    fetch(loggedInUrl, {
      method: 'GET',
    })
    .then(res => res.json())
    .then(data => {
      data.user && setUser(data.user);
      setLoggedIn(data.loggedIn);
    })
    .catch(reason => {
      console.log(`${loggedInUrl}: fecth failed: ${reason}`);
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

