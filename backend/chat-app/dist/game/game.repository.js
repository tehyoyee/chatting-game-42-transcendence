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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRepository = void 0;
const typeorm_1 = require("typeorm");
const game_history_entity_1 = require("./game.history.entity");
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../user/user.repository");
let GameRepository = class GameRepository extends typeorm_1.Repository {
    constructor(dataSource, userRepository) {
        super(game_history_entity_1.GameHistory, dataSource.createEntityManager());
        this.userRepository = userRepository;
    }
    async createGameHistory(user, winner_id, loser_id, winner_nickname, loser_nickname, score1, score2) {
        const newGameHistory = {
            player: user,
            winner_id: winner_id,
            loser_id: loser_id,
            winner_nickname: winner_nickname,
            loser_nickname: loser_nickname,
            score1: score1,
            score2: score2
        };
        const history = await this.save(newGameHistory);
        return history;
    }
};
exports.GameRepository = GameRepository;
exports.GameRepository = GameRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        user_repository_1.UserRepository])
], GameRepository);
//# sourceMappingURL=game.repository.js.map