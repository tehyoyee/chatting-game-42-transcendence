'use client'

import styles from '/styles/login.module.css';

async function request() {
  return fetch("http://localhost:3000/login", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(res => res.json())
  .catch((reason) => {
      console.log(`token request for login fail: ${reason}`);
    });
}

export default function Login({ setToken }: { setToken: Function }) {
  const handleRequest = async () => {
//    const token = await request();
//    setToken(token);
    setToken("test123");
  };

  return (
    <div className="full-background centerItemFlex">
      <form onSubmit={handleRequest}>
       <button type='submit' className={styles.loginButton}>Login</button>
      </form>
    </div>
  );
}
