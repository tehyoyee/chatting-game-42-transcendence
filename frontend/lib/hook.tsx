'use client'

import React, { useState, useEffect } from 'react';

export function useFetch<T>(path: string, init: T): [T, Function] {
	const [item, setItem] = useState(init);
	const [update, setUpdate] = useState({});

	useEffect(() => {
		(async() => {
			await fetch(path, {
				method: 'GET',
				credentials: 'include',
			})
			.then(res => {
				if (!res.ok) throw new Error("invalid response");
				return res.json()
			})
			.then(data => {setItem(data)})
			.catch(err => {
				setItem(init);
				console.log(`${path}: fetch failed: ${err}`);
			});
		})()
	}, [update]);
	function updateItem() {
		setUpdate({});
	};
	return [item, updateItem];
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
