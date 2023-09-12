'use client'

import { useState, useEffect, ReactNode } from 'react';
import SideBar from "@/components/structure/sidebar";
import styles from "@/styles/chat.module.css";
import { useFetch } from "@/lib/hook";

// test interface
interface ChatRoom {
	id: number,
	name: string,
	curUser: number,
	maxUser: number,
};

interface ChatRooms {
	curRoomId: number,
	chatRoomArr: ChatRoom[],
};

const chatReqUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/`; // path to fetch chat info

export default function Chat() {
	const test: ChatRooms = {
		curRoomId: 2,
		chatRoomArr: [
			{ id: 0, name: "abc", curUser: 0, maxUser: 1 },
			{ id: 1, name: "XYZ", curUser: 2, maxUser: 4 },
			{ id: 2, name: "ijk", curUser: 99, maxUser: 9 },
		]
	};
	const [chatRooms, setChatRooms] = useFetch(chatReqUrl, test);

	const joined = chatRooms?.chatRoomArr.find(data => data.id === chatRooms.curRoomId);
	const list = chatRooms?.chatRoomArr.filter(data => data.id !== chatRooms.curRoomId);
	joined && list.unshift(joined);

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
							some button
						</button>
					</li>
					{
						list.map(info => {
							return (
								<ChatRoomBtn
									info={info}
									key={info.id}
									className={chatRooms.curRoomId == info.id ? `${styles.curButton}` : ""}
								></ChatRoomBtn>
							);
						})
					}
				</ul>
			</SideBar>
		</div>
  );
}

function ChatRoomBtn({ info, className }: { info: ChatRoom, className: string }) {
	return (
		<li>
			<button className={`${styles.button} ${className}`} style={{
			}}>
				{`${info.name}  ${info.curUser}/${info.maxUser}`}
			</button>
		</li>
	);
}
