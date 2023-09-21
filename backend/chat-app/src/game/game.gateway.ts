import { OnModuleInit } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
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
	userSocketMap = new Map<number, Socket>(); // userid, socketid
	gameRoomMap = new Map<number, string>(); // userid, room
	gameNormalQueue: number[] = [];
	gameAdvancedQueue: number[] = [];

	@WebSocketServer() // 소켓인스턴스를 준다
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log(`socket_id = ${socket.id}`);
			console.log('Connected');
		});
	}
	// async joinQueue(@MessageBody() body: any) {

	@SubscribeMessage('joinQueue')
	async joinQueue(@ConnectedSocket() client: any, @MessageBody() body: any) {
		const user = await this.socketToUser(client);
		console.log(body);
		if (body === 'NORMAL') {
			this.gameNormalQueue.push(user.user_id);
			console.log(`added normalQueue user : ${user.username}`);
			if (this.gameNormalQueue.length >= 2) {
				const playerIdLeft = this.gameNormalQueue[0];
				const playerIdRight = this.gameNormalQueue[1];
				const playerSocketLeft = this.userSocketMap.get(playerIdLeft);
				const playerSocketRight = this.userSocketMap.get(playerIdRight);
				console.log(`playerLeft: ${playerIdLeft}`);
				console.log(`playerRight: ${playerIdRight}`);
				console.log("Matching Created !!!");
				this.gameNormalQueue = this.gameNormalQueue.slice(2);

			}
		}
	

		// 		client.join('asdf');
		// 		console.log(`${this.gameNormalQueue[0]} and ${this.gameNormalQueue[1]} matched`);
		// 	}
		// } else if (body.type === 'ADVANCED') {
		// 	this.gameAdvancedQueue.push(body.client.id);
		// }
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
		const user = await this.socketToUser(client);
		this.userSocketMap.set(user.user_id, client);
	}
  
	async handleDisconnect(client: any) {
		console.log(`[Game] ${client.id} has left.`);
		const user = await this.socketToUser(client);
		this.userSocketMap.delete(user.user_id);

		console.log(`[Game] userlist : ${user.username} removed.`);
		for (let i = 0; i < this.gameNormalQueue.length; i++) {
			if (this.gameNormalQueue[i] === user.user_id) {
				delete this.gameNormalQueue[i];
				break;
			}
		}
		for (let i = 0; i < this.gameAdvancedQueue.length; i++) {
			if (this.gameAdvancedQueue[i] === user.user_id) {
				delete this.gameAdvancedQueue[i];
				break;
			}
		}
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
	private async socketToUser(client: Socket): Promise<User> {
		const token: any = client.handshake.query.token;
		if (!token)
		  return null;
	  
		try {
		  const decoded = await this.authService.verifyToken(token);
		  const user: User = await this.userService.getProfileByUserId(decoded.id);
		  return user;
		}
		catch (error) {
			console.log("error");
			return undefined;
		}
	}
}
