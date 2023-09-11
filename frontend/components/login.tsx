'use client'

import styles from '/styles/login.module.css';

const loginUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/auth/42`;
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
    <div className="full-background centerItemFlex">
      <button onClick={ () => {window.location.assign(authUrl)} } className={styles.loginButton}>login with 42</button>
    </div>
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
