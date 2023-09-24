import { OnModuleInit, UseFilters } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway, BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/user.service";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { GameService } from "./game.service";
import { KeyStatus } from "./game.keystatus.enum";
import { WebsocketExceptionsFilter } from "src/exception/ws.exception.filter";

@WebSocketGateway({ namespace: '/game'})
@UseFilters(WebsocketExceptionsFilter)
export class GameGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
	
	private readonly MAP_X = 1800;
	private readonly MAP_Y = 1300;
	private readonly SPEED = 16;
	private readonly paddleSpeed = 20;
	private readonly PADDLE_SIZE = 150;
	private readonly paddleGap = 20;
	private readonly DELAY = 20;
	private readonly MAXPOINT = 5;

	constructor(
		private authService: AuthService,
		private userService: UserService,
		private gameService: GameService,
	) {}
	
	userSocketMap = new Map<number, Socket>(); // userid, socketid
	gameRoomMap = new Map<number, string>(); // userid, room
	gameNormalQueue: number[] = [];
	gameAdvancedQueue: number[] = [];
	userKeyMap = new Map<number, string>();	// user_id, keyStatus

	@WebSocketServer() // 소켓인스턴스를 준다
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log(`[Game] GameSocket_id: ${socket.id} connected.`);
		});
	}

	@SubscribeMessage('joinQueue')
	async joinQueue(@ConnectedSocket() client: any, @MessageBody() gameMode: string) {
		const user = await this.socketToUser(client);
		if (gameMode === 'NORMAL') {
			this.gameNormalQueue.push(user.user_id);
			console.log(`[Game] added normalQueue user : ${user.username}`);
			if (this.gameNormalQueue.length >= 2) {
				const playerIdLeft = this.gameNormalQueue[0];
				const playerIdRight = this.gameNormalQueue[1];
				const playerSocketLeft = this.userSocketMap.get(playerIdLeft);
				const playerSocketRight = this.userSocketMap.get(playerIdRight);
				const newRoomName = playerSocketLeft.id + playerSocketRight.id;
				console.log(`[Game] playerLeft: ${playerIdLeft}`);
				console.log(`[Game] playerRight: ${playerIdRight}`);
				playerSocketLeft.join(newRoomName);
				playerSocketRight.join(newRoomName);
				console.log(`[Game] Game Room ${newRoomName} created !!`);
				this.gameRoomMap.set(playerIdLeft, newRoomName);
				this.gameRoomMap.set(playerIdRight, newRoomName);
				this.server.to(newRoomName).emit('gameStart', {
					roomName: newRoomName
				});
				this.gameNormalQueue = this.gameNormalQueue.slice(2);
				console.log("[Game] Normal Match Created !!!");
				setTimeout(async () => await this.runGame(gameMode, newRoomName, playerSocketLeft, playerSocketRight, 0, 0), 3000);
			}
		} else if (gameMode === 'ADVANCED') {
			this.gameAdvancedQueue.push(user.user_id);
			console.log(`added advancedQueue user : ${user.username}`);
			if (this.gameAdvancedQueue.length >= 2) {
				const playerIdLeft = this.gameAdvancedQueue[0];
				const playerIdRight = this.gameAdvancedQueue[1];
				const playerSocketLeft = this.userSocketMap.get(playerIdLeft);
				const playerSocketRight = this.userSocketMap.get(playerIdRight);
				const newRoomName = playerSocketLeft.id + playerSocketRight.id;
				console.log(`[Game] playerLeft: ${playerIdLeft}`);
				console.log(`[Game] playerRight: ${playerIdRight}`);
				playerSocketLeft.join(newRoomName);
				playerSocketRight.join(newRoomName);
				this.gameRoomMap.set(playerIdLeft, newRoomName);
				this.gameRoomMap.set(playerIdRight, newRoomName);
				console.log(`[Game] Game Room ${newRoomName} created !!`);
				this.server.to(newRoomName).emit('gameStart', {
					roomName: newRoomName
				});
				this.gameAdvancedQueue = this.gameAdvancedQueue.slice(2);
				console.log("[Game] Advanced Match Created !!!");
				setTimeout(async () => await this.runGame(gameMode, newRoomName, playerSocketLeft, playerSocketRight, 0, 0), 3000);
			}
		}
	}

	async runGame(gameMode: string, roomName: string, player1: Socket, player2: Socket, point1: number, point2: number) {
		const user1 = await this.socketToUser(player1);
		const user2 = await this.socketToUser(player2);
		// 게임 종료 조건
		if (point1 == this.MAXPOINT) {
			console.log(`[Game] ${user1.nickname} winned !`);
			await this.gameService.updateGameHistory(user1.user_id, user2.user_id, point1, point2);
			this.server.to(roomName).emit('endGame', {
				canvasX: this.MAP_X,
				canvasY: this.MAP_Y,
				player1: user1.nickname,
				player2: user2.nickname,
				score1: point1,
				score2: point2,
				winner: user1.nickname
			});
			player1.leave(roomName);
			player2.leave(roomName);
			console.log(`[Game] ${user1.nickname} and ${user2.nickname} left the game.`);
			this.gameRoomMap.delete(user1.user_id);
			this.gameRoomMap.delete(user2.user_id);
			console.log(`[Game] room ${roomName} removed.`);
			return;
		} else if (point2 == this.MAXPOINT) {
			console.log(`[Game] ${user1.username} winned !`);
			await this.gameService.updateGameHistory(user2.user_id, user1.user_id, point2, point1);
			this.server.to(roomName).emit('endGame', {
				canvasX: this.MAP_X,
				canvasY: this.MAP_Y,
				player1: user1.nickname,
				player2: user2.nickname,
				score1: point1,
				score2: point2,
				winner: user2.nickname
			});
			player1.leave(roomName);
			player2.leave(roomName);
			console.log(`[Game] ${user1.nickname} and ${user2.nickname} left the game.`);
			this.gameRoomMap.delete(user1.user_id);
			this.gameRoomMap.delete(user2.user_id);
			console.log(`[Game] room ${roomName} removed.`);
			return;
		}

		const ball = {
			x: this.MAP_X / 2,
			y: this.MAP_Y / 2,
			dx: this.SPEED * 0.866,
			dy: this.SPEED * 0.5,
		};
		const paddle1 = {
			x: this.paddleGap,
			y: (this.MAP_Y + this.PADDLE_SIZE) / 2
		};
		const paddle2 = {
			x: this.MAP_X - this.paddleGap,
			y: (this.MAP_Y + this.PADDLE_SIZE) / 2
		};

		if (gameMode === 'ADVANCED') {
			ball.dx += this.SPEED * ((point1 + point2) * 1.5 / this.MAXPOINT);
			ball.dy += this.SPEED * ((point1 + point2) * 1.5 / this.MAXPOINT);
		}
		if (Math.random() >= 0.5) {
			ball.dx = -ball.dx;
		}

		var winFlag = 0;

		const render = async () => {
			// Update Paddle Position
			const user1paddleDir = this.userKeyMap.get(user1.user_id);
			const user2paddleDir = this.userKeyMap.get(user2.user_id);

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
				if (paddle2.y - this.paddleSpeed >= 0) {
					paddle2.y -= this.paddleSpeed;
				}
			} else if (user2paddleDir === KeyStatus.DOWN) {
				if (paddle2.y + this.paddleSpeed <= this.MAP_Y - this.PADDLE_SIZE) {
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
			/**
			 * Gaming Info to Front-end
			 */
			if (!this.gameRoomMap.has(user1.user_id)) {
				this.server.to(roomName).emit('endGame', {
					canvasX: this.MAP_X,
					canvasY: this.MAP_Y,
					player1: user1.nickname,
					player2: user2.nickname,
					score1: point1,
					score2: point2,
					winner: user2.nickname
				});
				player2.leave(roomName);
				await this.gameService.updateGameHistory(user1.user_id, user2.user_id, point1, point2);
				return;
			} else if (!this.gameRoomMap.has(user2.user_id)) {
				this.server.to(roomName).emit('endGame', {
					canvasX: this.MAP_X,
					canvasY: this.MAP_Y,
					player1: user1.nickname,
					player2: user2.nickname,
					score1: point1,
					score2: point2,
					winner: user1.nickname
				});
				player1.leave(roomName);
				await this.gameService.updateGameHistory(user2.user_id, user1.user_id, point2, point1);
				return;
			}

			this.server.to(roomName).emit('gamingInfo', {
				canvasX: this.MAP_X,
				canvasY: this.MAP_Y,
				player1: user1.nickname,
				player2: user2.nickname,
				score1: point1,
				score2: point2,
				ballX: ball.x,
				ballY: ball.y,
				paddle1X: paddle1.x,
				paddle1Y: paddle1.y,
				paddle2X: paddle2.x,
				paddle2Y: paddle2.y,
				paddleX: this.paddleGap,
				paddleY: this.PADDLE_SIZE
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
				clearInterval(id);
				if (winFlag == 1) {
					this.runGame(gameMode, roomName, player1, player2, point1+1, point2);
				} else {
					this.runGame(gameMode, roomName, player1, player2, point1, point2+1);
				}
			}
		};
		const id = setInterval(render, this.DELAY);
		await render();
	}

	@SubscribeMessage('launchGame')
	async launchGame(@MessageBody() invitation: any) {
		const playerLeft: User = await this.socketToUser(invitation.hostUserSocket);
		const playerRight: User = await this.socketToUser(invitation.clientUserSocket);
		const newRoomName: string = invitation.hostUserSocket.id + invitation.clientUserSocket.id;
		console.log(`[Game] ${invitation.gameMode} match created by invitation.`);
		console.log(`[Game] playerLeft: ${playerLeft}`);
		console.log(`[Game] playerRight: ${playerRight}`);
		invitation.hostUserSocket.join(newRoomName);
		invitation.clientUserSocket.join(newRoomName);
		this.gameRoomMap.set(playerLeft.user_id, newRoomName);
		this.gameRoomMap.set(playerRight.user_id, newRoomName);
		console.log(`[Game] Game room ${newRoomName} created.`);
		this.server.to(newRoomName).emit('gameStart', {
			roomName: newRoomName
		});
		console.log(`[Game] ${invitation.gameMode} match created.`);
		setTimeout(async () => await this.runGame(invitation.gameMode, newRoomName, invitation.hostUserSocket, invitation.clientUserSocket, 0, 0), 3000);
	}

	@SubscribeMessage('exitQueue')
	async exitQueue(@ConnectedSocket() client: any) {
		const user = await this.socketToUser(client);

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
		console.log(`[Game] ${user.username} left the game matching queue.`);
	}

	@SubscribeMessage('exitGame')
	async exitGame(@ConnectedSocket() client: any) {
		const loser = await this.socketToUser(client);
		const explodedRoomName = this.gameRoomMap.get(loser.user_id);
		if (!explodedRoomName) {
			return ;
		}
		this.gameRoomMap.delete(loser.user_id);
		console.log(`[Game] ${loser.username} has left the game. he/she's loser.`);
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
		console.log(user.gameHistories);
		this.userSocketMap.set(user.user_id, client);
		this.userKeyMap.set(user.user_id, KeyStatus.NONE);
	}
  
	async handleDisconnect(client: any) {
		console.log(`[Game] ${client.id} has left.`);
		const user = await this.socketToUser(client);
		this.userSocketMap.delete(user.user_id);
		this.gameRoomMap.delete(user.user_id);
		this.userKeyMap.delete(user.user_id);

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
			this.server.to(client.id).emit('forceLogout');	
		try {
			const decoded = await this.authService.verifyToken(token);
			const user: User = await this.userService.getProfileByUserId(decoded.id);
			return user;
		}
		catch (error) {
			this.server.to(client.id).emit('forceLogout');
			return undefined;
		}
	}

	getKeyByValue(map, value) {
		return Object.keys(map).find(key => map[key] === value);
	}
}
