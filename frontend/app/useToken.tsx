'use client'

import { useState } from 'react';

const storage = localStorage;

interface tokenObj {
  token: string;
}

export default function useToken() {
  const getToken = () => {
    return storage.getItem('token');
//    const tokenString = storage.getItem('token')
//    return tokenString ? JSON.parse(tokenString)?.token : null;
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken: string) => {
    storage.setItem('token', JSON.stringify(userToken));
    setToken(userToken);
  };
  return {
    setToken: saveToken,
    token,
  };
}
