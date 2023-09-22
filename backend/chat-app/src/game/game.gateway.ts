import { OnModuleInit } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/user.service";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Message } from "src/chat/entity/message.entity";
import { GameService } from "./game.service";
import { KeyStatus } from "./game.keystatus.enum";

// @WebSocketGateway()
@WebSocketGateway({ namespace: '/game'})
export class GameGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
	
	private readonly MAP_Y = 1400;
	private readonly MAP_X = 2000;
	private readonly SPEED = 5;
	private readonly paddleSpeed = 20;
	private readonly PADDLE_SIZE = 300;
	private readonly paddleGap = 20;
	private readonly DELAY = 16;
	private readonly MAXPOINT = 5;

	constructor(
		private authService: AuthService,
		private userService: UserService,
		private gameService: GameService,
		) {}
	
	userMap = [];
	userSocketMap = new Map<number, Socket>(); // userid, socketid
	gameRoomMap = new Map<number, string>(); // userid, room
	gameNormalQueue: number[] = [];
	gameAdvancedQueue: number[] = [];
	userKeyMap = new Map<number, string>();	// user_id, keyStatus

	@WebSocketServer() // 소켓인스턴스를 준다
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log(`socket_id = ${socket.id}`);
			console.log('Connected');
		});
	}

	@SubscribeMessage('joinQueue')
	async joinQueue(@ConnectedSocket() client: any, @MessageBody() gameMode: string) {
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
				console.log("Normal Match Created !!!");
				console.log(`playerLeft: ${playerIdLeft}`);
				console.log(`playerRight: ${playerIdRight}`);
				console.log(`Game Room ${newRoomName} created !!`);
				playerSocketLeft.join(newRoomName);
				playerSocketRight.join(newRoomName);
				this.gameRoomMap.set(playerIdLeft, newRoomName);
				this.gameRoomMap.set(playerIdRight, newRoomName);
				this.server.to(newRoomName).emit('gameStart', {
					roomName: newRoomName
				});
				this.gameNormalQueue = this.gameNormalQueue.slice(2);
				setTimeout(() => this.runGame(gameMode, newRoomName, playerSocketLeft, playerSocketRight, 0, 0), 3000);
			}
		} else if (gameMode === 'ADVANCED') {
			this.gameAdvancedQueue.push(user.user_id);
			console.log(`added normalQueue user : ${user.username}`);
			if (this.gameAdvancedQueue.length >= 2) {
				const playerIdLeft = this.gameAdvancedQueue[0];
				const playerIdRight = this.gameAdvancedQueue[1];
				const playerSocketLeft = this.userSocketMap.get(playerIdLeft);
				const playerSocketRight = this.userSocketMap.get(playerIdRight);
				const newRoomName = playerSocketLeft.id + playerSocketRight.id;
				console.log("Advanced Match Created !!!");
				console.log(`playerLeft: ${playerIdLeft}`);
				console.log(`playerRight: ${playerIdRight}`);
				console.log(`Game Room ${newRoomName} created !!`);
				playerSocketLeft.join(newRoomName);
				playerSocketRight.join(newRoomName);
				this.gameRoomMap.set(playerIdLeft, newRoomName);
				this.gameRoomMap.set(playerIdRight, newRoomName);
				this.server.to(newRoomName).emit('gameStart', {
					roomName: newRoomName
				});
				this.gameNormalQueue = this.gameNormalQueue.slice(2);
				setTimeout(() => this.runGame(gameMode, newRoomName, playerSocketLeft, playerSocketRight, 0, 0), 3000);
			}
		}
	}

	async runGame(gameMode: string, roomName: string, player1: Socket, player2: Socket, point1: number, point2: number) {
		const user1 = await this.socketToUser(player1);
		const user2 = await this.socketToUser(player2);

		// 게임 종료 조건
		if (point1 == this.MAXPOINT) {
			console.log(`${user1.username} winned !`);
			this.gameService.updateGameHistory(user1.user_id, user2.user_id);
			this.server.to(roomName).emit('gameEnd');
			player1.leave(roomName);
			player2.leave(roomName);
			this.gameRoomMap.delete(user1.user_id);
			this.gameRoomMap.delete(user2.user_id);
			return;
		} else if (point2 == this.MAXPOINT) {
			console.log(`${user1.username} winned !`);
			this.gameService.updateGameHistory(user2.user_id, user1.user_id);
			this.server.to(roomName).emit('gameEnd');
			player1.leave(roomName);
			player2.leave(roomName);
			this.gameRoomMap.delete(user1.user_id);
			this.gameRoomMap.delete(user2.user_id);
			return;
		}

		const ball = {
			x: this.MAP_X / 2,
			y: this.MAP_Y / 2,
			dx: this.SPEED * 0.866,
			dy: this.SPEED * 0.5,
		};
		if (gameMode === 'ADVANCED') {
			ball.dx += this.SPEED * ((point1 + point2) / this.MAXPOINT);
			ball.dy += this.SPEED * ((point1 + point2) / this.MAXPOINT);
		}
		if (Math.random() >= 0.5) {
			ball.dx = -ball.dx;
		}
		const paddle1 = {
			x: this.paddleGap,
			y: this.MAP_Y / 2
		};
		const paddle2 = {
			x: this.MAP_X - this.paddleGap,
			y: this.MAP_Y / 2
		};

		var winFlag = 0;

		const render = () => {
			// Update Paddle Position
			const user1paddleDir = this.userKeyMap.get(user1.user_id);
			console.log('user1 Paddle DIR : ', user1paddleDir);
			const user2paddleDir = this.userKeyMap.get(user2.user_id);
			console.log('user2 Paddle DIR : ', user2paddleDir);

			if (user1paddleDir === KeyStatus.UP) {
				if (paddle1.y - this.paddleSpeed >= 0) {
					paddle1.y -= this.paddleSpeed;
				}
			} else if (user1paddleDir === KeyStatus.DOWN) {
				if (paddle1.y + this.paddleSpeed <= this.MAP_Y - this.PADDLE_SIZE) {
					paddle1.y += this.paddleSpeed;
				}
			}
			if (user2paddleDir === KeyStatus.UP) {
				if (paddle1.y - this.paddleSpeed >= 0) {
					paddle2.y -= this.paddleSpeed;
				}
			} else if (user2paddleDir === KeyStatus.DOWN) {
				if (paddle1.y + this.paddleSpeed <= this.MAP_Y - this.PADDLE_SIZE) {
					paddle2.y += this.paddleSpeed;
				}
			}

			// Ball Reflection at Bottom
			if (ball.dy > 0 && ball.y + ball.dy >= this.MAP_Y) {
				ball.dy = -ball.dy;
				ball.y += ball.dy;
			// Ball Reflection at Top
			} else if (ball.dy < 0 && ball.y + ball.dy <= 0) {
				ball.dy = -ball.dy;
				ball.y += ball.dy;
			} else {	// Ball Elsewhere
				ball.y += ball.dy;
				ball.x += ball.dx;
			}
			
			// Left Paddle Reflection from 1, 4 quadrant
			if (ball.dx < 0 && ball.x + ball.dx <= paddle1.x && paddle1.x < ball.x) {
				if (paddle1.y <= (ball.y + (ball.y + ball.dy)) / 2 && (ball.y + (ball.y + ball.dy)) / 2 <= paddle1.y + this.PADDLE_SIZE) {
					ball.dx = -ball.dx;
					ball.x += ball.dx;
				}
			// Right Paddle Reflection from 2, 3 quadrant
			} else if (ball.dx > 0 && ball.x <= paddle2.x && paddle2.x < ball.x + ball.dx) {
				if (paddle2.y <= (ball.y + (ball.y + ball.dy)) / 2 && (ball.y + (ball.y + ball.dy)) / 2 <= paddle2.y + this.PADDLE_SIZE) {
					ball.dx = -ball.dx;
					ball.x += ball.dx;
				}
			}
			console.log(`Paddle1 : { ${paddle1.x}, ${paddle1.y} }`);
			console.log(`Paddle2 : { ${paddle2.x}, ${paddle2.y} }`);
			console.log(`ball x: ${ball.x} // y: ${ball.y}`);
			/**
			 * Gaming Info to Front-end
			 */
			this.server.to(roomName).emit('gamingInfo', {
				canvasX: this.MAP_X,
				canvasY: this.MAP_Y,
				player1: user1.nickname,
				player2: user2.nickname,
				score1: point1,
				socre2: point2,
				ballX: ball.x,
				ballY: ball.y,
				paddle1X: paddle1.x,
				paddle1Y: paddle1.y,
				paddle2X: paddle2.x,
				paddle2Y: paddle2.y,
			});
			/**
			 * Earning Point Condition
			 */
			if (ball.x < 0) {
				winFlag = 2;
			} else if (ball.x > this.MAP_X) {
				winFlag = 1;
			}
			if (winFlag != 0) {
				console.log('clear Interval');
				clearInterval(id);
				if (winFlag == 1) {
					this.runGame(gameMode, roomName, player1, player2, point1+1, point2);
				} else {
					this.runGame(gameMode, roomName, player1, player2, point1, point2+1);
				}
			}
		};
		const id = setInterval(render, this.DELAY);
		render();
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
	}

	@SubscribeMessage('keyW')
	async updateKeyStatusW (@ConnectedSocket() client: any, @MessageBody() newStatus: string) {
		const user = await this.socketToUser(client);
		if (newStatus === KeyStatus.UP) {
			this.userKeyMap.set(user.user_id, KeyStatus.NONE);
		} else if (newStatus === KeyStatus.DOWN) {
			this.userKeyMap.set(user.user_id, KeyStatus.UP);
		}
	}

	@SubscribeMessage('keyS')
	async updateKeyStatusS (@ConnectedSocket() client: any, @MessageBody() newStatus: string) {
		const user = await this.socketToUser(client);		
		if (newStatus === KeyStatus.UP) {
			this.userKeyMap.set(user.user_id, KeyStatus.NONE);
		} else if (newStatus === KeyStatus.DOWN) {
			this.userKeyMap.set(user.user_id, KeyStatus.DOWN);
		}
	}

	async handleConnection(client: Socket) {
		const user = await this.socketToUser(client);
		if (!user) {
			console.log('asdf');
		}
		this.userSocketMap.set(user.user_id, client);
		this.userKeyMap.set(user.user_id, KeyStatus.NONE);
	}
  
	async handleDisconnect(client: any) {
		console.log(`[Game] ${client.id} has left.`);
		const user = await this.socketToUser(client);
		if (user) {
			this.userSocketMap.delete(user.user_id);
		}
		this.userSocketMap.delete(user.user_id);
		this.userKeyMap.delete(user.user_id);

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
