import { OnModuleInit } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Server } from 'socket.io';
import { Socket } from "socket.io-client";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/user.service";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Message } from "src/chat/entity/message.entity";

// @WebSocketGateway()
@WebSocketGateway({ namespace: '/game'})
export class GameGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
	
	constructor(
		private authService: AuthService,
		private userService: UserService,
		) {}
	
	userMap = [];
	gameSocketMap = new Map<number, number>(); // userid, socketid
	gameRoomMap = new Map<number, string>(); // userid, room
	gameNormalQueue: string[] = [];
	gameAdvancedQueue: string[] = [];

	@WebSocketServer() // 소켓인스턴스를 준다
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log(`socket_id = ${socket.id}`);
			// socket.join('asdf');
			console.log('Connected');
		});
	}
	// async joinQueue(@MessageBody() body: any) {

	@SubscribeMessage('joinQueue')
	joinQueue(@ConnectedSocket() clientSocket: any, @MessageBody() body: any) {
		// clientSocket.join('asdf');
		// console.log(body);
		// console.log(body.type);
		// console.log(clientSocket);
		if (body.type === 'normal') {
			this.gameNormalQueue.push(body.clientSocket);
			console.log(`added normalQueue user : ${body.clientSocket}`);
			if (this.gameNormalQueue.length % 2 === 0) {
				clientSocket.join('asdf');
				console.log(`${this.gameNormalQueue[0]} and ${this.gameNormalQueue[1]} matched`);
				this.gameNormalQueue = this.gameNormalQueue.slice(2);
			}
			console.log('AFter they joined', this.gameNormalQueue);
		}
		// console.log("asdf");
	}

	@SubscribeMessage('emitMessage')
	message() {
		console.log("broadcast");
		// this.server.emit('onMessage', "heres");
		this.server.to('asdf').emit('onMessage', "roomheres");
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
  
  
	async handleConnection(client: Socket) {
	// 	await this.definePlayer(client);
  
	// 	if (this.currentUser) {
	// 		// client.data.currentUser = this.currentUser;
	// 		// this.connectedUsers.push(client);
	// 	}
	}
  
	handleDisconnect(client: any) {
		console.log(client);
		console.log(`${client} has left.`);
	// 	// this.connectedUsers = this.connectedUsers.filter(user => user.id !== client.id);
	}
	
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
