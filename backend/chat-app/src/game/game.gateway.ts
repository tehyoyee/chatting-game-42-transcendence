import { OnModuleInit } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Server } from 'socket.io';
import { Socket } from "socket.io-client";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/user.service";
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

// @WebSocketGateway()
@WebSocketGateway({ namespace: '/game'})
export class GameGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
	
	constructor(
		private authService: AuthService,
		private userService: UserService,
		) {}
	
	gameSocketMap = new Map<number, number>(); // userid, socketid
	gameRoomMap = new Map<number, string>(); // userid, room
	gameQueue = [];

	@WebSocketServer() // 소켓인스턴스를 준다
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log(`socket_id = ${socket.id}`);
			console.log('Connected');
		});
	}

	// accessToken: any;
	// currentUser: User;
  
	// private async definePlayer(client: Socket) {
	// 	try {
	// 		// this.accessToken = client.handshake.query.token;
	// 		this.accessToken = await this.authService.verifyToken(this.accessToken);
	// 		this.currentUser = null;
	// 		this.currentUser = await this.userService.getProfileByUserId(this.accessToken.id);
			
	// 		if (!this.currentUser) {
	// 		  return this.disconnect(client);
	// 		}
		
	// 	} catch (error) {
	// 		return this.disconnect(client);
	//   	}
	// }
  
	// private disconnect(socket: Socket) {
	// 	socket.disconnect();
	// }
  

	// private async getSocketId(id: number): Promise<Socket> {
	//   	// for (let user of this.connectedUsers) {
	// 	// 	let decoded = user.handshake.query.token;
	// 	// 	decoded = await this.authService.verifyToken(decoded);
			
	// 	// 	if (decoded.id === id)
	// 	// 		return user;
	//   	// 	}
  
	//   		return null;
	// }
  
  
	// async handleConnection(client: Socket) {
	// 	await this.definePlayer(client);
  
	// 	if (this.currentUser) {
	// 		// client.data.currentUser = this.currentUser;
	// 		// this.connectedUsers.push(client);
	// 	}
	// }
  
	// handleDisconnect(client: any) {
	// 	// this.connectedUsers = this.connectedUsers.filter(user => user.id !== client.id);
	// }
	
	// @SubscribeMessage('gamequeue')
	// movePlayer(_: Socket, info: string) {
    // 	console.log(_);
	// 	console.log(info);
	// }

	// @SubscribeMessage('newMessage')
	// onNewMessage(@MessageBody() body: any) {
	// 	console.log(body);
	// 	this.server.emit('onMessage', {
	// 		msg: 'New Message',
	// 		content: body,
	// 	});
	// }

}
