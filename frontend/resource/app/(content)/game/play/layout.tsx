export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
			style={{
				overflow: 'visible',
			}}
			>
      {children}
    </div>
  );
}
