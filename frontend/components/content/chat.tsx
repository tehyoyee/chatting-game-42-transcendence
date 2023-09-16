'use client'

import { useState, useEffect, ReactNode } from 'react';
import SideBar from "@/components/structure/sidebar";
import styles from "@/styles/chat.module.css";
import { useFetch } from "@/lib/hook";

// test interface
interface ChatRoom {
  id: number,
  name: string,
};

interface ChatRooms {
  curRoomId: number, // -1 for not joining
  chatRoomArr: ChatRoom[],
};

const chatReqUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/channel/list/all`; // path to fetch chat info

export default function Chat() {
  const test: ChatRooms = {
    curRoomId: 2,
    chatRoomArr: [
      { id: 1, name: "abc" },
      { id: 2, name: "XYZ" },
      { id: 3, name: "ijk" },
    ]
  };
// socketIO must be used
//  const [chatRooms, setChatRooms] = useFetch(chatReqUrl, test);
	const chatRooms = test;
	const [curRoomId, setCurRoomId] = useState(chatRooms?.curRoomId);

  const joined = chatRooms?.chatRoomArr.find(data => data.id === curRoomId);
  const list = chatRooms?.chatRoomArr.filter(data => data.id !== curRoomId);
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
    <div>
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
    </div>
  );
}

function ChatBox() {
	useEffect(() => {
		const form = document.querySelector('#chat_form') as HTMLFormElement;
		const input = document.querySelector('#chat_input') as HTMLInputElement;

		form?.addEventListener('submit', (event) => {
			event.preventDefault();
			if (input.value) {
				console.log(input.value);
				input.value = "";
			}
			// socketio
		});
	}, []);
	
	return (
		<>
			<ul>
			</ul>
			<form id={"chat_form"}>
				<input id={"chat_input"}/><button>Enter</button>
			</form>
		</>
	);
}
