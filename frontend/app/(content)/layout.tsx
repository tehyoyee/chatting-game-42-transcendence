import ComponentProtector from "@/components/user/protector";
import NavBar from '@/components/structure/navbar';
import Logout from '@/components/user/logout';

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
		<>
			<NavBar></NavBar>
			<Logout></Logout>
			<ComponentProtector>
				<div className="contentBox">
					{children}
				</div>
			</ComponentProtector>
		</>
  );
}
