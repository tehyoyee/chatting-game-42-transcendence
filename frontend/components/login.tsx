'use client'

import styles from '/styles/login.module.css';

async function request() {
  // const handleRequest = () => {
  // window.location.assign('http://localhost:3000/auth/42');
  // }
  // return fetch("http://localhost:3000/login", {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // })
  // .then(res => res.json())
  // .catch((reason) => {
  //     console.log(`token request for login fail: ${reason}`);
  //   });
}

export default function Login() {
  const handleRequest = async () => {
    window.location.assign('http://localhost:3000/auth/42');
  //    const token = await request();
//    setToken(token);
    // setToken("test123");
  };

  return (
    <div className="full-background centerItemFlex">
      <button type='submit' className={styles.loginButton}>Login</button>
      <button onClick={ handleRequest }> login with 42</button>
    </div>
  );
}
