'use client'

import styles from '/styles/login.module.css'

export default function Login() {
	const handleSubmit = (e): SubmitEvent => {
		const a: SubmitEvent = SubmitEvent();
		return a;
	};

	return (
	<div>
		<form onSubmit={handleSubmit}>
			<div className={styles.loginBox}>
				<input type='text' id={styles.idField} placeholder="ID" className={styles.field}
					required-pattern="[a-zA-Z}" required />
				<input type='text' id={styles.pwField} placeholder="Password" className={styles.field}
					required-pattern="[a-zA-Z0-9]" required />
				<button type='submit' className={styles.loginButton}>Login</button>
			</div>
		</form>
	</div>
	);
}
