import ComponentProtector from "@/components/user/protector";
import NavBar from '@/components/structure/navbar';
import Logout from '@/components/user/logout';
import { SocketContextProvider } from '@/lib/socket';
import { PlayerContextProvider } from '@/components/content/player_state';
import { ChatContextProvider } from '@/components/content/chat/context';
import dynamic from 'next/dynamic'
 
// Client Components:
const ComponentProtector_ = dynamic(() => import('@/components/user/protector'))
 
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
			<SocketContextProvider>
				<PlayerContextProvider>
					<ChatContextProvider>
						<ComponentProtector_>
						<NavBar></NavBar>
						<Logout></Logout>
						<div className="contentBox">
							{children}
						</div>
						</ComponentProtector_>
					</ChatContextProvider>
				</PlayerContextProvider>
			</SocketContextProvider>
    </>
  );
}
