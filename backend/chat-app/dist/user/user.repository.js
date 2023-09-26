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
exports.UserRepository = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entity/user.entity");
const common_1 = require("@nestjs/common");
let UserRepository = class UserRepository extends typeorm_1.Repository {
    constructor(dataSource) {
        super(user_entity_1.User, dataSource.createEntityManager());
    }
    async createUser(createUserDto) {
        const newUser = await this.create({
            user_id: createUserDto.user_id,
            username: createUserDto.username,
            nickname: createUserDto.nickname,
            email: createUserDto.email,
            avatar: createUserDto.avatar,
        });
        await this.save(newUser);
        return newUser;
    }
    async getMyProfile(id) {
        const currentUser = await this.getProfileByUserId(id);
        if (!currentUser)
            throw new common_1.NotFoundException(`유저 ${id}는 없습니다.`);
        return currentUser;
    }
    async getProfileByUserName(username) {
        const found = await this.findOne({
            where: { username: username }
        });
        return found;
    }
    async getProfileByUserId(id) {
        const found = await this.findOne({
            where: { user_id: id }
        });
        return found;
    }
    async getProfileByNickName(nickname) {
        const found = await this.findOne({
            where: { nickname: nickname }
        });
        return found;
    }
    async getTwoFactorByUserId(id) {
        const found = await this.findOne({
            where: { user_id: id }
        });
        return found.two_factor;
    }
    async getEmailByUserId(id) {
        const found = await this.findOne({
            where: { user_id: id }
        });
        return found.email;
    }
    async updateTwoFactor(user, newTwoFactor) {
        user.two_factor = newTwoFactor;
        await this.save(user);
    }
    async getAvatarByUserId(id) {
        const found = await this.findOne({
            where: { user_id: id }
        });
        return found.avatar;
    }
    async updateAvatar(user, newAvatar) {
        user.avatar = newAvatar;
        await this.save(user);
    }
    async updateNickName(user, newNickname) {
        user.nickname = newNickname;
        await this.save(user);
    }
    async updateStatus(id, newStatus) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        found.status = newStatus;
        return await this.save(found);
    }
    async updateAchievement(id, newAchievement) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        found.achievement = newAchievement;
        return await this.save(found);
    }
    async getGameHistoryByUserId(id) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        return found.gameHistories;
    }
    async getCurrentUserStatusByUserId(userId) {
        const found = await this.getProfileByUserId(userId);
        return found.status;
    }
    async updateGameHistory(id, gameHistory) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        found.gameHistories.push(gameHistory);
        this.save(found);
    }
    async updateGamePoint(id, value) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        found.point += value;
        await this.save(found);
    }
    async winGame(id) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        found.win_count++;
        return await this.save(found);
    }
    async loseGame(id) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        found.lose_count++;
        return await this.save(found);
    }
    async updateAuthCodeByUserId(id, authCode) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        found.auth_code = authCode;
        return;
    }
    async getAuthCodeByUserId(id) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        return found.auth_code;
    }
    async updateTwoFactorCode(id, newCode) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_1.HttpException('Unexist UserId', common_1.HttpStatus.NOT_FOUND);
        found.auth_code = newCode;
        await this.save(found);
        return;
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], UserRepository);
//# sourceMappingURL=user.repository.js.map