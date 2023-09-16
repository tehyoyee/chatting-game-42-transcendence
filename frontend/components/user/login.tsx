'use client'

import styles from '/styles/login.module.css';

const authUrl = `${process.env.NEXT_PUBLIC_AUTH_URL}`;

/*
 * fetch auth server url and redirect page to the url.
 */
export default function Login() {
/*  const handleRequest = async () => {
    fetch(loginUrl, {
      method: 'GET',
      headers: {
  Origin: `${process.env.NEXT_PUBLIC_APP_FRONT_URL}`,
      },
    })
    .then(res => {
      console.log(res);
      console.log(res.headers);
      window.location.assign(`${data.url}`);
    })
    .catch(reason => {
      console.log(`${loginUrl}: fetch failed: ${reason}`);
    });
  }; */


  return (
    <>
      <hr></hr>
    <div className="full-background centerItemFlex">
      <button onClick={ () => {window.location.assign(authUrl)} } className={styles.loginButton}>login with 42</button>
    </div>
    </>
  );
}

/*
 *
authorization process for frontend

AuthContext context at root

Component AuthContextProvider with children parameter
  manages states and function necessary for authorization.
  - loggedIn state
  - user state
  - updateLoginState async function that fetch login state from backend.
  - useEffect that monitors updateLoginState and execute updateLoginState.
  - return with JSX that passes loggedIn, user, updateLoginState to AuthContext and wraps children.

Component Login
  receive auth server URL from backend and push url to browser.
  it will redirect to callback URI unless received URL fails.

Component Callback
  callback URI routes to here.
  handles rest of auth process with authorization code given as query string.
  send auth code to backend and receive cookie as encoded access token(or user specific information?).

*/



// 'use client';

// import { useState, useCallback } from 'react';
// import Tfa from './tfa'; // TFA 컴포넌트

// export default function Login() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isTfaOk, setTfaOk] = useState(false);

//   const handleLogin = useCallback(() => {
//     // 로그인 요청을 서버로 보내고 성공 여부를 판단
//     // 로그인에 성공하면 setIsLoggedIn(true) 호출
//     // 이후 TFA 인증 단계로 이동
//     setIsLoggedIn(true);
//   }, []);

//   return (
//     <div>
//       {!isLoggedIn ? (
//         <div className="full-background centerItemFlex">
//           <button onClick={handleLogin} className="full-background centerItemFlex">login with 42</button>
//         </div>
//       ) : !isTfaOk ?(
//         <Tfa />
//       ) : 
//       }
//     </div>
//   );
// }