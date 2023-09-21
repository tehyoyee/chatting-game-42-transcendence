import { useState, useEffect, ReactNode, SetStateAction } from 'react';
import Image from 'next/image'; 
import styles from "@/styles/chat.module.css";
import SideBar from "@/components/structure/sidebar";
import Modal from '@/components/structure/modal';
import { ChatMenu } from '@/components/content/chat_manage';
import useSocketContext from '@/lib/socket';
import { useFetch } from '@/lib/hook';

enum ChatType {
	public = 'public',
	protected = 'protected',
	private = 'private',
}

// test interface
interface IChatRoom {
  channel_id: number,
  channel_name: string,
	channel_type: string,
};

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const chatUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/chat`;
const pubChatReqUrl = `${chatUrl}/channel/all/public`; // path to fetch chat info
const protChatReqUrl = `${chatUrl}/channel/all/protected`; // path to fetch chat info


export default function ChatList({
	setJoined
}: {
	setJoined: React.Dispatch<SetStateAction<boolean>>
}) {
	const {chatSocket} = useSocketContext();
	const [menuModal, setMenuModal] = useState<boolean>(false);
	const [pubChatList, updatePub] = useFetch<IChatRoom[]>(pubChatReqUrl, []);
	const [protChatList, updateProt] = useFetch<IChatRoom[]>(protChatReqUrl, []);
  const list = protChatList.concat(pubChatList);

	useEffect(() => {
		updateProt({});
		updatePub({});
	}, [menuModal])

	function joinChat() {
	};

	function ChatRoomBtn({ info, className }: { info: IChatRoom, className: string }) {
		return (
			<li>
				<button
					onClick={(event) => {event.preventDefault(); joinChat()}}
					className={`${styles.button} ${className}`}
					data-key={info.channel_id}
					style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
					{`${info.channel_name}`}
					{
						info.channel_type == ChatType.protected &&
						<>
							<Image 
								src="/lock.png"
								height={20} 
								width={20}
								alt="protected channel"
							></Image>
						</>
					}
				</button>
			</li>
		);
	}
	return (
      <SideBar 
        className={"full-background-color overflow-y-scroll overflow-x-hidden"}>
        <ul>
          <li>
            <button
							type='button'
							onClick={(e) => {e.preventDefault(); setMenuModal(true);}}
              className={`${styles.button}`}
              style={{
                backgroundColor: 'lightgreen',
              }}>
							{'채널 만들기'} 
            </button>
						{menuModal &&
							<Modal onClose={setMenuModal}>
								<ChatMenu></ChatMenu>
							</Modal>
						}
          </li>
					{
						list.map(info => {
							return (
								<ChatRoomBtn
									info={info}
									key={info.channel_id}
									className={''}
								></ChatRoomBtn>
							);
						})
					}
        </ul>
      </SideBar>
	);
}
