import ComponentProtector from "@/components/user/protector";
import NavBar from '@/components/structure/navbar';
import Logout from '@/components/user/logout';
import { SocketContextProvider } from '@/lib/socket';

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
				<SocketContextProvider>
					<div className="contentBox">
						{children}
					</div>
				</SocketContextProvider>
			</ComponentProtector>
    </>
  );
}
