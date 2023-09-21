'use client'

import { useState, useEffect, ReactNode } from 'react';
import useSocketContext from '@/lib/socket';
import styles from "@/styles/chat.module.css";
import SideBar from "@/components/structure/sidebar";
import Modal from '@/components/structure/modal';
import { ChatMenu } from '@/components/content/chat_manage';
import { logoutFunction } from '../user/logout';

// test interface
type ChatRoom = {
  id: number,
  name: string,
};

type ChatRooms = {
  curRoomId: number, // -1 for not joining
  chatRoomArr: ChatRoom[],
};

const chatReqUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/channel/list/all`; // path to fetch chat info

export default function Chat() {
	const { chatSocket } = useSocketContext();
	const [chatRooms, setChatRooms] = useState<ChatRooms>({
		curRoomId: -1,
		chatRoomArr: [],
	});
	const [curRoomId, setCurRoomId] = useState<number>(chatRooms?.curRoomId);
	const [menuModal, setMenuModal] = useState<boolean>(false);

	useEffect(() => {
		if (!chatSocket) {
			// TODO: check it works
		}
	}, []);

  const joined = chatRooms.chatRoomArr.find(data => data.id === curRoomId);
  const list = chatRooms.chatRoomArr.filter(data => data.id !== curRoomId);
  joined && list.unshift(joined);

	// NOTE: typing issue
	const toggleChat = (event: any) => {
		const target = event.target;
		const clickedId = Number(target.getAttribute("data-key"));
		if (curRoomId == clickedId) {
			setCurRoomId(0);
		} else {
			target && setCurRoomId(clickedId);
		}
	};

	function ChatRoomBtn({ info, className }: { info: ChatRoom, className: string }) {
		return (
			<li>
				<button
					onClick={(event) => {event.preventDefault(); toggleChat(event)}}
					className={`${styles.button} ${className}`}
					data-key={info.id}
					style={{
				}}>
					{`${info.name}`}
				</button>
			</li>
		);
	}

  return (
		<>
      <SideBar 
        className={"full-background-color"}>
        <ul>
          <li>
            <button
							type='button'
							onClick={(e) => {e.preventDefault(); setMenuModal(true);}}
              className={`${styles.button}`}
              style={{
                backgroundColor: 'lightgreen',
              }}>
							{curRoomId === 0 ? ' ' : '채널 만들기'} 
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
									key={info.id}
									className={curRoomId == info.id ? `${styles.curButton}` : ""}
								></ChatRoomBtn>
							);
						})
					}
        </ul>
      </SideBar>
			{joined && <ChatBox></ChatBox>}
    </>
  );
}

function ChatBox() {
	const { chatSocket } = useSocketContext();
	const [chatLog, setChatLog] = useState<string[]>([]);

	useEffect(() => {
		const chatLogList = document.querySelector('#chatLogList') as HTMLDivElement;
		chatLogList && (chatLogList.scrollTop = chatLogList.scrollHeight);
	}, [chatLog]);

	const sendMsg = () => {
		const inputField = document.querySelector('#chatInputField') as HTMLInputElement;

		if (!inputField?.value || !chatLog) return;
		setChatLog([
			...chatLog,
			inputField.value
		]);
		inputField.focus();
		inputField.value = '';
	};
	
	return (
		<div className={styles.chatBox}>
			<div
				id="chatLogList"
				style={{
					height: '96%',
					overflowY: 'scroll',
				}}>
				<ul>
					{chatLog.map((log, key) => {
						return (
							<li key={key}>
								{`: ${log}`}
							</li>
						);
					})}
				</ul>
			</div>
			<form 
				className={styles.chatBar}
				id={"chat_form"} 
				onSubmit={e => {e.preventDefault(); sendMsg()}}>
				<button
					style={{
						padding: '5px',
						border: 'solid 1px black',
						backgroundColor: 'lightcyan',
					}}
					>Enter</button>
				<input 
					id="chatInputField"
					autoComplete='off'
					style={{
						width: '85%',
						height: '2rem',
					}}
					max={256}
					required
				/>
			</form>
		</div>
	);
}
