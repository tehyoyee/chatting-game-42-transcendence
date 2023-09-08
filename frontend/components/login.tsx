'use client'

import React, { useState } from 'react';
import styles from '/styles/login.module.css';

type updateLoginType = React.Dispatch<React.SetStateAction<boolean>>;

function updateLogin(setLogin: updateLoginType) {
  setLogin(true);
  return undefined;
}

export default function Login() {
  const [login, setLogin] = useState(false);

  return (
    <form onSubmit={updateLogin(setLogin)}>
      <div className={styles.loginBox}>
      	<input type='text' id={styles.idField} placeholder="ID" className={styles.field}
      	  required-pattern="[a-zA-Z}" required />
      	<input type='text' id={styles.pwField} placeholder="Password" className={styles.field}
      	  required-pattern="[a-zA-Z0-9]" required />
      	<button type='submit' className={styles.loginButton}>Login</button>
      </div>
    </form>
  );
}
