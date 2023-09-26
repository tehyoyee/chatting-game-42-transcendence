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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../user/user.repository");
const game_repository_1 = require("./game.repository");
const user_service_1 = require("../user/user.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../user/entity/user.entity");
const logisticFunction = (p1, p2) => {
    return Math.round(25 - (50 / (1 + 10 ** (Math.abs(p1 - p2) / 400))));
};
let GameService = class GameService {
    constructor(userRepository, userService, gameRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.gameRepository = gameRepository;
    }
    async updateGameHistory(winId, loseId, point1, point2) {
        const winUser = await this.userService.getProfileByUserId(winId);
        const loseUser = await this.userService.getProfileByUserId(loseId);
        console.log(`updateGameHistory winId: ${winId} loseId: ${loseId}, point1:${point1} point2: ${point2}`);
        await this.userService.winGame(winUser.user_id);
        await this.userService.loseGame(loseUser.user_id);
        const surplus = logisticFunction(winUser.point, loseUser.point);
        if (winUser.point > loseUser.point) {
            await this.userService.updateGamePoint(winUser.user_id, 25 - surplus);
            await this.userService.updateGamePoint(loseUser.user_id, -25 + surplus);
        }
        else {
            await this.userService.updateGamePoint(winUser.user_id, 25 + surplus);
            await this.userService.updateGamePoint(loseUser.user_id, -(25 + surplus));
        }
        const newGameHistory1 = await this.gameRepository.createGameHistory(winUser, winUser.user_id, loseUser.user_id, winUser.nickname, loseUser.nickname, point1, point2);
        await this.userService.updateGameHistory(winUser.user_id, newGameHistory1);
        const newGameHistory2 = await this.gameRepository.createGameHistory(loseUser, winUser.user_id, loseUser.user_id, winUser.nickname, loseUser.nickname, point2, point1);
        await this.userService.updateGameHistory(loseUser.user_id, newGameHistory2);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        user_service_1.UserService,
        game_repository_1.GameRepository])
], GameService);
//# sourceMappingURL=game.service.js.map