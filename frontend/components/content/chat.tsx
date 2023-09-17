'use client'

import { useState, useEffect, ReactNode } from 'react';
import SideBar from "@/components/structure/sidebar";
import styles from "@/styles/chat.module.css";
import { useFetch } from "@/lib/hook";
import useSocketContext from '@/lib/socket';

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
	const [chatRooms, setChatRooms] = useState<ChatRooms>({
		curRoomId: -1,
		chatRoomArr: [],
	});
	/*
  const test: ChatRooms = {
    curRoomId: 2,
    chatRoomArr: [
      { id: 1, name: "abc" },
      { id: 2, name: "XYZ" },
      { id: 3, name: "ijk" },
    ]
  };
	*/
	useEffect(() => {
// fetch channel list and update state
//  const [chatRooms, setChatRooms] = useFetch(chatReqUrl, test);
	}, []);
	const [curRoomId, setCurRoomId] = useState(chatRooms?.curRoomId);

  const joined = chatRooms.chatRoomArr.find(data => data.id === curRoomId);
  const list = chatRooms.chatRoomArr.filter(data => data.id !== curRoomId);
  joined && list.unshift(joined);

	// MouseEvent<HTMLButtonElement, MouseEvent> does not work
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
              className={`${styles.button}`}
              style={{
                backgroundColor: 'crimson',
              }}>
							{curRoomId === 0 ? ' ' : 'quit'} 
            </button>
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
			<ChatBox></ChatBox>
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
