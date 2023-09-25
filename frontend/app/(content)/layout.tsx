import ComponentProtector from "@/components/user/protector";
import NavBar from '@/components/structure/navbar';
import Logout from '@/components/user/logout';
import { SocketContextProvider } from '@/lib/socket';
import { PlayerContextProvider } from '@/components/content/player_state';
import { ChatContextProvider } from '@/components/content/chat/context';

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
			<ComponentProtector>
				<SocketContextProvider>
					<PlayerContextProvider>
						<ChatContextProvider>
							<NavBar></NavBar>
							<Logout></Logout>
							<div className="contentBox">
								{children}
							</div>
						</ChatContextProvider>
					</PlayerContextProvider>
				</SocketContextProvider>
			</ComponentProtector>
    </>
  );
}
