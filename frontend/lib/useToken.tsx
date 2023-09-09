'use client'

import { useState, useEffect } from 'react';

export default function useToken() {
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    saveToken(getToken());
  }, []);

  const saveToken = (userToken: string | null) => {
    if (userToken !== null) {
      localStorage.setItem('token', JSON.stringify(userToken));
    }
    setToken(userToken);
  };
  return {
    setToken: saveToken,
    token,
  };
}
