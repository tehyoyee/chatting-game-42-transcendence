"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const auth_service_1 = require("../auth/auth.service");
const user_service_1 = require("../user/user.service");
const websockets_2 = require("@nestjs/websockets");
const game_service_1 = require("./game.service");
const game_keystatus_enum_1 = require("./game.keystatus.enum");
const ws_exception_filter_1 = require("../exception/ws.exception.filter");
const user_status_enum_1 = require("../user/enum/user-status.enum");
let GameGateway = class GameGateway {
    constructor(authService, userService, gameService) {
        this.authService = authService;
        this.userService = userService;
        this.gameService = gameService;
        this.MAP_X = 1800;
        this.MAP_Y = 1300;
        this.SPEED = 16;
        this.paddleSpeed = 20;
        this.PADDLE_SIZE = 150;
        this.paddleGap = 20;
        this.DELAY = 20;
        this.MAXPOINT = 5;
        this.userSocketMap = new Map();
        this.gameRoomMap = new Map();
        this.gameNormalQueue = [];
        this.gameAdvancedQueue = [];
        this.userKeyMap = new Map();
    }
    onModuleInit() {
        this.server.on('connection', async (socket) => {
            console.log(`[Game] GameSocket_id: ${socket.id} connected.`);
        });
    }
    async joinQueue(client, gameMode) {
        const user = await this.socketToUser(client);
        if (!user) {
            return;
        }
        if (gameMode === 'NORMAL') {
            this.gameNormalQueue.push(user.user_id);
            console.log(`[Game] added normalQueue user : ${user.username}`);
            if (this.gameNormalQueue.length >= 2) {
                const playerIdLeft = this.gameNormalQueue[0];
                const playerIdRight = this.gameNormalQueue[1];
                this.gameNormalQueue = this.gameNormalQueue.slice(2);
                const playerSocketLeft = this.userSocketMap.get(playerIdLeft);
                const playerSocketRight = this.userSocketMap.get(playerIdRight);
                const user1 = await this.socketToUser(playerSocketLeft);
                const user2 = await this.socketToUser(playerSocketRight);
                if (!user1 || !user2) {
                    return;
                }
                const newRoomName = playerSocketLeft.id + playerSocketRight.id;
                console.log(`[Game] playerLeft: ${playerIdLeft}`);
                console.log(`[Game] playerRight: ${playerIdRight}`);
                playerSocketLeft.join(newRoomName);
                playerSocketRight.join(newRoomName);
                console.log(`[Game] Game Room ${newRoomName} created !!`);
                this.gameRoomMap.set(playerIdLeft, newRoomName);
                this.gameRoomMap.set(playerIdRight, newRoomName);
                await this.userService.updateStatus(playerIdLeft, user_status_enum_1.UserStatus.PLAYING);
                await this.userService.updateStatus(playerIdRight, user_status_enum_1.UserStatus.PLAYING);
                this.server.emit('refreshGameStatus', playerIdLeft);
                this.server.emit('refreshGameStatus', playerIdRight);
                this.server.to(newRoomName).emit('gameStart', {
                    leftUserName: user1.nickname,
                    rightUserName: user2.nickname,
                    leftUserId: playerIdLeft,
                    rightUserId: playerIdRight,
                });
                console.log("[Game] Normal Match Created !!!");
                setTimeout(async () => await this.runGame(gameMode, newRoomName, playerSocketLeft, playerSocketRight, 0, 0), 3000);
            }
        }
        else if (gameMode === 'ADVANCED') {
            this.gameAdvancedQueue.push(user.user_id);
            console.log(`added advancedQueue user : ${user.username}`);
            if (this.gameAdvancedQueue.length >= 2) {
                const playerIdLeft = this.gameAdvancedQueue[0];
                const playerIdRight = this.gameAdvancedQueue[1];
                this.gameAdvancedQueue = this.gameAdvancedQueue.slice(2);
                const playerSocketLeft = this.userSocketMap.get(playerIdLeft);
                const playerSocketRight = this.userSocketMap.get(playerIdRight);
                const user1 = await this.socketToUser(playerSocketLeft);
                const user2 = await this.socketToUser(playerSocketRight);
                if (!user1 || !user2) {
                    return;
                }
                const newRoomName = playerSocketLeft.id + playerSocketRight.id;
                console.log(`[Game] playerLeft: ${playerIdLeft}`);
                console.log(`[Game] playerRight: ${playerIdRight}`);
                playerSocketLeft.join(newRoomName);
                playerSocketRight.join(newRoomName);
                this.gameRoomMap.set(playerIdLeft, newRoomName);
                this.gameRoomMap.set(playerIdRight, newRoomName);
                await this.userService.updateStatus(playerIdLeft, user_status_enum_1.UserStatus.PLAYING);
                await this.userService.updateStatus(playerIdRight, user_status_enum_1.UserStatus.PLAYING);
                this.server.emit('refreshGameStatus', playerIdLeft);
                this.server.emit('refreshGameStatus', playerIdRight);
                console.log(`[Game] Game Room ${newRoomName} created !!`);
                this.server.to(newRoomName).emit('gameStart', {
                    leftUserName: user1.nickname,
                    rightUserName: user2.nickname,
                    leftUserId: playerIdLeft,
                    rightUserId: playerIdRight,
                });
                console.log("[Game] Advanced Match Created !!!");
                setTimeout(async () => await this.runGame(gameMode, newRoomName, playerSocketLeft, playerSocketRight, 0, 0), 3000);
            }
        }
    }
    async runGame(gameMode, roomName, player1, player2, point1, point2) {
        const user1 = await this.socketToUser(player1);
        const user2 = await this.socketToUser(player2);
        if (!user1 && !user2) {
            return;
        }
        if (!this.gameRoomMap.has(user1.user_id) && !this.gameRoomMap.has(user2.user_id)) {
            await this.userService.updateStatus(user1.user_id, user_status_enum_1.UserStatus.ONLINE);
            await this.userService.updateStatus(user2.user_id, user_status_enum_1.UserStatus.ONLINE);
            this.server.emit('refreshGameStatus', user1.user_id);
            this.server.emit('refreshGameStatus', user2.user_id);
            return;
        }
        if (!this.gameRoomMap.has(user1.user_id)) {
            console.log(`[Game] ${user2.nickname} winned !`);
            await this.gameService.updateGameHistory(user2.user_id, user1.user_id, point1, point2);
            this.server.to(roomName).emit('endGame', {
                canvasX: this.MAP_X,
                canvasY: this.MAP_Y,
                player1: user1.nickname,
                player2: user2.nickname,
                score1: point1,
                score2: point2,
                winner: user1.nickname
            });
            player2.leave(roomName);
            console.log(`[Game] ${user2.nickname} has left the game.`);
            this.gameRoomMap.delete(user2.user_id);
            console.log(`[Game] room ${roomName} removed.`);
            await this.userService.updateStatus(user1.user_id, user_status_enum_1.UserStatus.ONLINE);
            await this.userService.updateStatus(user2.user_id, user_status_enum_1.UserStatus.ONLINE);
            this.server.emit('refreshGameStatus', user1.user_id);
            this.server.emit('refreshGameStatus', user2.user_id);
            return;
        }
        else if (!this.gameRoomMap.has(user2.user_id)) {
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
            console.log(`[Game] ${user1.nickname} has left the game.`);
            this.gameRoomMap.delete(user1.user_id);
            console.log(`[Game] room ${roomName} removed.`);
            await this.userService.updateStatus(user1.user_id, user_status_enum_1.UserStatus.ONLINE);
            await this.userService.updateStatus(user2.user_id, user_status_enum_1.UserStatus.ONLINE);
            this.server.emit('refreshGameStatus', user1.user_id);
            this.server.emit('refreshGameStatus', user2.user_id);
            return;
        }
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
            console.log(`[Game] ${user1.nickname} and ${user2.nickname} has left the game.`);
            this.gameRoomMap.delete(user1.user_id);
            this.gameRoomMap.delete(user2.user_id);
            console.log(`[Game] room ${roomName} removed.`);
            await this.userService.updateStatus(user1.user_id, user_status_enum_1.UserStatus.ONLINE);
            await this.userService.updateStatus(user2.user_id, user_status_enum_1.UserStatus.ONLINE);
            this.server.emit('refreshGameStatus', user1.user_id);
            this.server.emit('refreshGameStatus', user2.user_id);
            return;
        }
        else if (point2 == this.MAXPOINT) {
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
            console.log(`[Game] ${user1.nickname} and ${user2.nickname} has left the game.`);
            this.gameRoomMap.delete(user1.user_id);
            this.gameRoomMap.delete(user2.user_id);
            console.log(`[Game] room ${roomName} removed.`);
            await this.userService.updateStatus(user1.user_id, user_status_enum_1.UserStatus.ONLINE);
            await this.userService.updateStatus(user2.user_id, user_status_enum_1.UserStatus.ONLINE);
            this.server.emit('refreshGameStatus', user1.user_id);
            this.server.emit('refreshGameStatus', user2.user_id);
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
            y: (this.MAP_Y - this.PADDLE_SIZE) / 2
        };
        const paddle2 = {
            x: this.MAP_X - 2 * this.paddleGap,
            y: (this.MAP_Y - this.PADDLE_SIZE) / 2
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
            const user1paddleDir = this.userKeyMap.get(user1.user_id);
            const user2paddleDir = this.userKeyMap.get(user2.user_id);
            if (user1paddleDir === game_keystatus_enum_1.KeyStatus.UP) {
                if (paddle1.y - this.paddleSpeed >= 0) {
                    paddle1.y -= this.paddleSpeed;
                }
            }
            else if (user1paddleDir === game_keystatus_enum_1.KeyStatus.DOWN) {
                if (paddle1.y + this.paddleSpeed <= this.MAP_Y - this.PADDLE_SIZE) {
                    paddle1.y += this.paddleSpeed;
                }
            }
            if (user2paddleDir === game_keystatus_enum_1.KeyStatus.UP) {
                if (paddle2.y - this.paddleSpeed >= 0) {
                    paddle2.y -= this.paddleSpeed;
                }
            }
            else if (user2paddleDir === game_keystatus_enum_1.KeyStatus.DOWN) {
                if (paddle2.y + this.paddleSpeed <= this.MAP_Y - this.PADDLE_SIZE) {
                    paddle2.y += this.paddleSpeed;
                }
            }
            if (ball.dy > 0 && ball.y + ball.dy >= this.MAP_Y) {
                ball.dy = -ball.dy;
                ball.y += ball.dy;
            }
            else if (ball.dy < 0 && ball.y + ball.dy <= 0) {
                ball.dy = -ball.dy;
                ball.y += ball.dy;
            }
            else {
                ball.y += ball.dy;
                ball.x += ball.dx;
            }
            if (ball.dx < 0 && ball.x + ball.dx <= paddle1.x && paddle1.x < ball.x) {
                if (paddle1.y <= (ball.y + (ball.y + ball.dy)) / 2 && (ball.y + (ball.y + ball.dy)) / 2 <= paddle1.y + this.PADDLE_SIZE) {
                    ball.dx = -ball.dx;
                    ball.x += ball.dx;
                }
            }
            else if (ball.dx > 0 && ball.x <= paddle2.x && paddle2.x < ball.x + ball.dx) {
                if (paddle2.y <= (ball.y + (ball.y + ball.dy)) / 2 && (ball.y + (ball.y + ball.dy)) / 2 <= paddle2.y + this.PADDLE_SIZE) {
                    ball.dx = -ball.dx;
                    ball.x += ball.dx;
                }
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
            if (ball.x < 0) {
                winFlag = 2;
            }
            else if (ball.x > this.MAP_X) {
                winFlag = 1;
            }
            if (winFlag != 0 || !this.gameRoomMap.has(user1.user_id) || !this.gameRoomMap.has(user2.user_id)) {
                clearInterval(id);
                if (winFlag == 1) {
                    await this.runGame(gameMode, roomName, player1, player2, point1 + 1, point2);
                }
                else {
                    await this.runGame(gameMode, roomName, player1, player2, point1, point2 + 1);
                }
            }
        };
        const id = setInterval(render, this.DELAY);
        await render();
    }
    async inviteGame(hostSocket, invitation) {
        const hostUser = await this.socketToUser(hostSocket);
        const targetUserSocket = this.userSocketMap.get(invitation.targetUserId);
        this.server.to(targetUserSocket.id).emit('getInvited', {
            hostId: hostUser.user_id,
            hostNickname: hostUser.nickname,
            gameMode: invitation.gameMode
        });
    }
    async launchGame(playerRightSocket, invitation) {
        const playerIdLeft = Number(this.getKeyByValue(this.userSocketMap, invitation.hostId));
        const playerLeft = await this.userService.getProfileByUserId(playerIdLeft);
        const playerRight = await this.socketToUser(playerRightSocket);
        if (!playerLeft || !playerRight) {
            return;
        }
        const playerLeftSocket = this.userSocketMap.get(playerIdLeft);
        const newRoomName = playerLeftSocket.id + playerRightSocket.id;
        console.log(`[Game] ${invitation.gameMode} match created by invitation.`);
        console.log(`[Game] playerLeft: ${playerLeft}`);
        console.log(`[Game] playerRight: ${playerRight}`);
        playerLeftSocket.join(newRoomName);
        playerRightSocket.join(newRoomName);
        this.gameRoomMap.set(playerLeft.user_id, newRoomName);
        this.gameRoomMap.set(playerRight.user_id, newRoomName);
        console.log(`[Game] Game room ${newRoomName} created.`);
        this.server.to(newRoomName).emit('gameStart', {
            leftUserName: playerLeft.nickname,
            rightUserName: playerRight.nickname,
            leftUserId: playerIdLeft,
            rightUserId: playerRight.user_id,
        });
        console.log(`[Game] ${invitation.gameMode} match created.`);
        setTimeout(async () => await this.runGame(invitation.gameMode, newRoomName, playerLeftSocket, playerRightSocket, 0, 0), 3000);
    }
    async exitQueue(client) {
        const user = await this.socketToUser(client);
        if (!user) {
            this.server.to(client).emit("[Game] to front Event: 'forceLogout'");
        }
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
    async exitGame(client) {
        const loser = await this.socketToUser(client);
        const explodedRoomName = this.gameRoomMap.get(loser.user_id);
        if (!explodedRoomName) {
            return;
        }
        this.gameRoomMap.delete(loser.user_id);
        console.log(`[Game] ${loser.username} has left the game. he/she's loser.`);
    }
    async updateKeyStatusW(client, newStatus) {
        const user = await this.socketToUser(client);
        if (newStatus === game_keystatus_enum_1.KeyStatus.UP) {
            this.userKeyMap.set(user.user_id, game_keystatus_enum_1.KeyStatus.NONE);
        }
        else if (newStatus === game_keystatus_enum_1.KeyStatus.DOWN) {
            this.userKeyMap.set(user.user_id, game_keystatus_enum_1.KeyStatus.UP);
        }
    }
    async updateKeyStatusS(client, newStatus) {
        const user = await this.socketToUser(client);
        if (newStatus === game_keystatus_enum_1.KeyStatus.UP) {
            this.userKeyMap.set(user.user_id, game_keystatus_enum_1.KeyStatus.NONE);
        }
        else if (newStatus === game_keystatus_enum_1.KeyStatus.DOWN) {
            this.userKeyMap.set(user.user_id, game_keystatus_enum_1.KeyStatus.DOWN);
        }
    }
    async handleConnection(client) {
        const user = await this.socketToUser(client);
        if (!user) {
            this.server.to(client.id).emit("forceLogout");
        }
        const token = client.handshake.query.token;
        console.log('when login status userMap', this.userSocketMap);
        if (this.userSocketMap.has(user.user_id)) {
            console.log('forcelogout');
            this.server.to(client.id).emit('forceLogout');
        }
        else {
            await this.userService.updateStatus(user.user_id, user_status_enum_1.UserStatus.ONLINE);
            this.userSocketMap.set(user.user_id, client);
            this.userKeyMap.set(user.user_id, game_keystatus_enum_1.KeyStatus.NONE);
        }
    }
    async handleDisconnect(client) {
        console.log(`[Game] ${client.id} has left.`);
        const user = await this.socketToUser(client);
        if (user && this.userSocketMap.has(user.user_id)) {
            if (this.userSocketMap.get(user.user_id).id === client.id) {
                this.userSocketMap.delete(user.user_id);
                this.gameRoomMap.delete(user.user_id);
                this.userKeyMap.delete(user.user_id);
                await this.userService.updateStatus(user.user_id, user_status_enum_1.UserStatus.OFFLINE);
                this.server.emit('refresh');
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
                await this.userService.updateStatus(user.user_id, user_status_enum_1.UserStatus.OFFLINE);
            }
        }
        else if (!user) {
            const userId = Number(this.getKeyByValue(this.userSocketMap, client));
            if (userId) {
                this.userSocketMap.delete(userId);
                this.gameRoomMap.delete(userId);
                this.userKeyMap.delete(userId);
                await this.userService.updateStatus(userId, user_status_enum_1.UserStatus.OFFLINE);
                this.server.emit('refresh');
                for (let i = 0; i < this.gameNormalQueue.length; i++) {
                    if (this.gameNormalQueue[i] === userId) {
                        this.gameNormalQueue.splice(i, 1);
                    }
                }
                for (let i = 0; i < this.gameAdvancedQueue.length; i++) {
                    if (this.gameAdvancedQueue[i] === userId) {
                        this.gameAdvancedQueue.splice(i, 1);
                    }
                }
                await this.userService.updateStatus(userId, user_status_enum_1.UserStatus.OFFLINE);
            }
        }
    }
    async socketToUser(client) {
        const token = client.handshake.query.token;
        if (!token) {
            return null;
        }
        const decoded = await this.authService.verifyTokenSocket(token);
        if (!decoded) {
            return null;
        }
        const user = await this.userService.getProfileByUserId(decoded.id);
        return user;
    }
    getKeyByValue(map, value) {
        return Object.keys(map).find(key => map[key] === value);
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinQueue'),
    __param(0, (0, websockets_2.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "joinQueue", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('inviteGame'),
    __param(0, (0, websockets_2.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "inviteGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('acceptGame'),
    __param(0, (0, websockets_2.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "launchGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('exitQueue'),
    __param(0, (0, websockets_2.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "exitQueue", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('exitGame'),
    __param(0, (0, websockets_2.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "exitGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('keyW'),
    __param(0, (0, websockets_2.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "updateKeyStatusW", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('keyS'),
    __param(0, (0, websockets_2.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "updateKeyStatusS", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/game' }),
    (0, common_1.UseFilters)(ws_exception_filter_1.WebsocketExceptionsFilter),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService,
        game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map