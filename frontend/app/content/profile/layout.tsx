import styles from '/styles/profile.module.css';

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className={`centerContentBox ${styles.profile}`}>
	{children}
      </div>
    </>
  );
}
