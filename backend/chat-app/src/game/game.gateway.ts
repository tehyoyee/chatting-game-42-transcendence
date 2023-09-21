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
	
	private readonly MAP_Y = 100;
	private readonly MAP_X = 100;
	private readonly SPEED = 5;
	private readonly paddleSize = 200;
	private readonly paddleGap = 10;
	private readonly DELAY = 3000;
	private readonly MAXPOINT = 5;

	constructor(
		private authService: AuthService,
		private userService: UserService,
		) {}
	
	userMap = [];
	userSocketMap = new Map<number, Socket>(); // userid, socketid
	// gameRoomMap = new Map<number, string>(); // userid, room
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
	async joinQueue(@ConnectedSocket() client: any, @MessageBody() gameMode: any) {
		const user = await this.socketToUser(client);
		if (gameMode === 'NORMAL') {
			this.gameNormalQueue.push(user.user_id);
			console.log(`added normalQueue user : ${user.username}`);
			if (this.gameNormalQueue.length >= 2) {
				const playerIdLeft = this.gameNormalQueue[0];
				const playerIdRight = this.gameNormalQueue[1];
				const playerSocketLeft = this.userSocketMap.get(playerIdLeft);
				const playerSocketRight = this.userSocketMap.get(playerIdRight);
				const newRoomName = playerSocketLeft.id + playerSocketRight.id;
				console.log("Matching Created !!!");
				console.log(`playerLeft: ${playerIdLeft}`);
				console.log(`playerRight: ${playerIdRight}`);
				console.log(`Game Room ${newRoomName} created !!`);
				playerSocketLeft.join(newRoomName);
				playerSocketRight.join(newRoomName);
				this.server.to(newRoomName).emit('gameStart');
				this.gameNormalQueue = this.gameNormalQueue.slice(2);
				this.runGame(newRoomName, playerSocketLeft, playerSocketRight, 0, 0);
			}
		}
	}

	async runGame(roomName: string, player1: Socket, player2: Socket, point1: number, point2: number) {
		const user1 = await this.socketToUser(player1);
		const user2 = await this.socketToUser(player2);

		// 게임 종료 조건
		if (point1 == this.MAXPOINT) {
			console.log(`${user1.username} winned !`);
			return;
		} else if (point2 == this.MAXPOINT) {
			console.log(`${user1.username} winned !`);
			return;
		}
		const ball = {
			x: this.MAP_X / 2,
			y: this.MAP_Y / 2,
			dx: this.SPEED * 0.5,
			dy: this.SPEED * 0.866,
			speed: this.SPEED
		}
		const paddle1 = {
			x: this.paddleGap,
			y: this.MAP_Y / 2
		}
		const paddle2 = {
			x: this.MAP_X - this.paddleGap,
			y: this.MAP_Y / 2
		}
		console.log(user1.nickname, user2.nickname);
		this.server.to(roomName).emit('gamingUser', {
			player1: user1.nickname,
			player2: user2.nickname
		})
		console.log(point1, point2);
		this.server.to(roomName).emit('gamingScore', {
			score1: point1,
			socre2: point2
		})

		var winFlag = 0
		const render = () => {
			// 키 입력
			// 패들 위치 변경


			// 아랫벽 맞음
			if (ball.dy > 0 && Math.round(ball.y + ball.dy) >= this.MAP_Y) {
				ball.dy = -ball.dy;
				ball.y += ball.dy;
			// 윗벽 맞음
			} else if (ball.dy < 0 && Math.round(ball.y + ball.dy) <= 0) {
				ball.dy = -ball.dy;
				ball.y += ball.dy;
			} else {
				ball.y += ball.dy;
			}
			// 왼쪽 맞음
			if (ball.dx < 0 && Math.round(ball.x + ball.dx) <= 0) {
				ball.dx = -ball.dx;
				ball.x += ball.dx;
			// 오른쪽맞음
			} else if (ball.dx > 0 && Math.round(ball.x + ball.dx) >= this.MAP_X) {
				ball.dx = -ball.dx;
				ball.x += ball.dx;
			} else {
				ball.x += ball.dx;
			}
			console.log(`ball x: ${ball.x} // y: ${ball.y}`);
			this.server.to(roomName).emit('gamingBall', {
				ballX: ball.x,
				ballY: ball.y
			});
			// 포인트 조건
			if (ball.x < 0) {
				winFlag = 2;
			} else if (ball.x > this.MAP_X) {
				winFlag = 1;
			}
			if (winFlag != 0) {
				clearInterval(id);
			}
			// 공 위치
			// this.server.to(roomName).emit('gameEvent', {
			// 	ball,
			// 	paddle1,
			// 	paddle2,
			// })
		};
		const id = setInterval(render, this.DELAY);
		render();
		if (winFlag == 1) {
			this.runGame(roomName, player1, player2, point1+1, point2);
		} else {
			this.runGame(roomName, player1, player2, point1, point2+1);
		}
	}


	@SubscribeMessage('exitQueue')
	async exitQueue(@ConnectedSocket() client: any) {
		const user = await this.socketToUser(client);

		console.log(`[Game] gameQueue : ${user.username} removed.`);
		for (let i = 0; i < this.gameNormalQueue.length; i++) {
			if (this.gameNormalQueue[i] === user.user_id) {
				this.gameNormalQueue.splice(i, 1);
			}
		}
		for (let i = 0; i < this.gameAdvancedQueue.length; i++) {
			if (this.gameAdvancedQueue[i] === user.user_id) {
				this.gameAdvancedQueue.splice(i, 1);
			}
		}
		console.log("AfterExitQueue", this.gameNormalQueue);
	}

	@SubscribeMessage('emitMessage')
	message() {
		console.log("broadcast");
		// this.server.emit('onMessage', "heres");
		this.server.to('asdf').emit('onMessage', "roomheres");
	}
  
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
				this.gameNormalQueue.splice(i, 1);
			}
		}
		for (let i = 0; i < this.gameAdvancedQueue.length; i++) {
			if (this.gameAdvancedQueue[i] === user.user_id) {
				this.gameAdvancedQueue.splice(i, 1);
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
