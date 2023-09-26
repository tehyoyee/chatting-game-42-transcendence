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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("./user.repository");
const user_achievements_enum_1 = require("./enum/user-achievements.enum");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger('UserService');
    }
    async createUser(createUserDto) {
        return await this.userRepository.createUser(createUserDto);
    }
    async getMyProfile(id) {
        return await this.userRepository.getMyProfile(id);
    }
    async getProfileByUserName(nickname) {
        return await this.userRepository.getProfileByUserName(nickname);
    }
    async getProfileByUserId(id) {
        return await this.userRepository.getProfileByUserId(id);
    }
    async getProfileByNickName(username) {
        return await this.userRepository.getProfileByNickName(username);
    }
    async getRanking() {
        const ranking = await this.userRepository
            .createQueryBuilder('user')
            .select('RANK () OVER (ORDER BY point DESC) as "rank", user.nickname, user.point')
            .getRawMany();
        return ranking;
    }
    async getTwoFactorByUserId(id) {
        return await this.userRepository.getTwoFactorByUserId(id);
    }
    async getEmailByUserId(id) {
        return await this.userRepository.getEmailByUserId(id);
    }
    async updateNickName(id, nickName) {
        const found = await this.userRepository.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        if (nickName && found.nickname !== nickName) {
            const duplicate = await this.getProfileByNickName(nickName);
            if (duplicate)
                throw new common_1.HttpException('Duplicate Nickname', common_1.HttpStatus.FORBIDDEN);
            await this.userRepository.updateNickName(found, nickName);
        }
        return found;
    }
    async getAvatarByUserId(id) {
        return await this.userRepository.getAvatarByUserId(id);
    }
    async getCurrentUserStatusByUserId(userId) {
        return await this.userRepository.getCurrentUserStatusByUserId(userId);
    }
    async updateAvatar(id, filePath) {
        const found = await this.userRepository.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        await this.userRepository.updateAvatar(found, filePath);
    }
    async updateTwoFactor(id, twoFactor) {
        const found = await this.userRepository.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        if (found.two_factor !== twoFactor)
            await this.userRepository.updateTwoFactor(found, twoFactor);
        return found;
    }
    async updateStatus(id, status) {
        return await this.userRepository.updateStatus(id, status);
    }
    async updateAchievement(id, achievement) {
        return await this.userRepository.updateAchievement(id, achievement);
    }
    async getGameHistoryByUserId(id) {
        return await this.userRepository.getGameHistoryByUserId(id);
    }
    async updateGameHistory(id, gameHistory) {
        await this.userRepository.updateGameHistory(id, gameHistory);
    }
    async updateGamePoint(id, value) {
        await this.userRepository.updateGamePoint(id, value);
    }
    async winGame(id) {
        await this.userRepository.winGame(id);
        const user = await this.getProfileByUserId(id);
        if (!user) {
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        }
        const changed = await this.checkAchievementLevelChanged(user);
        if (changed) {
            await this.updateAchievement(id, changed);
        }
        return user;
    }
    async loseGame(id) {
        return await this.userRepository.loseGame(id);
    }
    async checkAchievementLevelChanged(user) {
        if (user.win_count >= 5 && user.achievement < user_achievements_enum_1.UserAchievement.A5)
            return user_achievements_enum_1.UserAchievement.A5;
        else if (user.win_count >= 3 && user.achievement < user_achievements_enum_1.UserAchievement.A3)
            return user_achievements_enum_1.UserAchievement.A3;
        else if (user.win_count >= 1 && user.achievement < user_achievements_enum_1.UserAchievement.A1)
            return user_achievements_enum_1.UserAchievement.A1;
        return null;
    }
    async updateAuthCodeByUserId(id, authCode) {
        return await this.userRepository.updateAuthCodeByUserId(id, authCode);
    }
    async getAuthCodeByUserId(id) {
        return await this.userRepository.getAuthCodeByUserId(id);
    }
    async updateTwoFactorCode(id, newCode) {
        return await this.userRepository.updateTwoFactorCode(id, newCode);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], UserService);
//# sourceMappingURL=user.service.js.map