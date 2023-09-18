// import { OnModuleInit } from "@nestjs/common";
// import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
// import { Server } from 'socket.io';
// import { Socket } from "socket.io-client";

// // @WebSocketGateway()
// @WebSocketGateway({ namespace: '/game'})
// export class GameGateway implements OnModuleInit {
	
// 	@WebSocketServer() // 소켓인스턴스를 준다
// 	server: Server;

// 	onModuleInit() {
// 		this.server.on('connection', (socket) => {
// 			console.log(`socket_id = ${socket.id}`);
// 			console.log('Connected');
// 		});
// 	}
	
// 	@SubscribeMessage('movePlayer')
// 	movePlayer(_: Socket, info: string) {
//     	console.log(_);
// 		console.log(info);
// 	}

// 	@SubscribeMessage('newMessage')
// 	onNewMessage(@MessageBody() body: any) {
// 		console.log(body);
// 		this.server.emit('onMessage', {
// 			msg: 'New Message',
// 			content: body,
// 		});
// 	}

// }
