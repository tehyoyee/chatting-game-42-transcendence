'use client'

import React, { useState, useEffect } from 'react';

export function useFetch<T>(path: string, init: T): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [item, setItem] = useState(init);

	useEffect(() => {
		(async() => {
			await fetch(path, {
				method: 'GET',
				credentials: 'include',
			})
			.then(res => res.json())
			.then(data => {setItem(data)})
			.catch(err => {
				console.log(`${path}: fetch failed: ${err}`);
			});
		})()
	}, [item]);
	return [item, setItem];
}

export function useToken() {
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
