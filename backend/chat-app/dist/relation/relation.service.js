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
exports.RelationService = void 0;
const common_1 = require("@nestjs/common");
const relation_repository_1 = require("./relation.repository");
const relation_type_enum_1 = require("./enum/relation-type.enum");
const user_service_1 = require("../user/user.service");
let RelationService = class RelationService {
    constructor(userService, relationRepository) {
        this.userService = userService;
        this.relationRepository = relationRepository;
        this.logger = new common_1.Logger('RelationService');
    }
    async addFriend(sender, receiverId) {
        if (sender.user_id === receiverId) {
            throw new common_1.HttpException('Cannot Set To Yourself', common_1.HttpStatus.CONFLICT);
        }
        if (await this.checkFriended(sender.user_id, receiverId)) {
            throw new common_1.HttpException('Friended Already', common_1.HttpStatus.CONFLICT);
        }
        if (await this.checkBlocked(sender.user_id, receiverId)) {
            this.logger.debug('Block To Friend');
        }
        return await this.relationRepository.addRelation(sender, receiverId, relation_type_enum_1.RelationType.FRIEND);
    }
    async addBlock(sender, receiverId) {
        if (sender.user_id === receiverId) {
            throw new common_1.HttpException('Cannot Set To Yourself', common_1.HttpStatus.CONFLICT);
        }
        if (await this.checkBlocked(sender.user_id, receiverId)) {
            throw new common_1.HttpException('Blocked Already', common_1.HttpStatus.CONFLICT);
        }
        if (await this.checkFriended(sender.user_id, receiverId)) {
            this.logger.debug('Friend To Block');
        }
        return await this.relationRepository.addRelation(sender, receiverId, relation_type_enum_1.RelationType.BLOCK);
    }
    async unFriend(senderId, receiverId) {
        const relation = await this.getRelationByIds(senderId, receiverId);
        if (!relation || (relation && relation.relation_type !== relation_type_enum_1.RelationType.FRIEND)) {
            throw new common_1.HttpException('Not Friended Before', common_1.HttpStatus.CONFLICT);
        }
        await this.relationRepository.deleteRelation(relation.relation_id);
    }
    async unBlock(senderId, receiverId) {
        const relation = await this.getRelationByIds(senderId, receiverId);
        if (!relation || (relation && relation.relation_type !== relation_type_enum_1.RelationType.BLOCK)) {
            throw new common_1.HttpException('Not Blocked Before', common_1.HttpStatus.CONFLICT);
        }
        await this.relationRepository.deleteRelation(relation.relation_id);
    }
    async getRelationByIds(senderId, receiverId) {
        return await this.relationRepository.getRelationByIds(senderId, receiverId);
    }
    async checkFriended(senderId, receiverId) {
        const friended = await this.getRelationByIds(senderId, receiverId);
        if (friended && friended.relation_type === relation_type_enum_1.RelationType.FRIEND) {
            return true;
        }
        return false;
    }
    async checkBlocked(senderId, receiverId) {
        const blocked = await this.getRelationByIds(senderId, receiverId);
        if (blocked && blocked.relation_type === relation_type_enum_1.RelationType.BLOCK) {
            return true;
        }
        return false;
    }
    async getFriendsOfUser(userId) {
        let friends = [];
        const relationType = relation_type_enum_1.RelationType.FRIEND;
        const relations = await this.relationRepository
            .createQueryBuilder('r')
            .where('r.sender_id = :userId', { userId })
            .andWhere('r.relation_type = :relationType', { relationType })
            .select(['r.receiver_id'])
            .getMany();
        for (let r of relations) {
            const user = await this.userService.getProfileByUserId(r.receiver_id);
            const currentStatus = await this.userService.getCurrentUserStatusByUserId(r.receiver_id);
            friends.push({
                userId: user.user_id,
                userNickName: user.nickname,
                isFriend: true,
                isBlocked: false,
                userStatus: currentStatus,
            });
        }
        return friends;
    }
    async getBlocksOfUser(userId) {
        let blocks = [];
        const relationType = relation_type_enum_1.RelationType.BLOCK;
        const relations = await this.relationRepository
            .createQueryBuilder('r')
            .where('r.sender_id = :userId', { userId })
            .andWhere('r.relation_type = :relationType', { relationType })
            .select(['r.receiver_id'])
            .getMany();
        for (let r of relations) {
            const user = await this.userService.getProfileByUserId(r.receiver_id);
            const currentStatus = await this.userService.getCurrentUserStatusByUserId(r.receiver_id);
            blocks.push({
                userId: user.user_id,
                userNickName: user.nickname,
                isFriend: false,
                isBlocked: true,
                userStatus: currentStatus,
            });
        }
        return blocks;
    }
    async getEveryoneWhoBlockedMe(myId) {
        let whoBlockedMe = [];
        const relationType = relation_type_enum_1.RelationType.BLOCK;
        const relations = await this.relationRepository
            .createQueryBuilder('r')
            .where('r.receiver_id = :myId', { myId })
            .andWhere('r.relation_type = :relationType', { relationType })
            .select(['r.sender_id'])
            .getMany();
        for (let r of relations) {
            let b_id = { userId: r.sender_id };
            whoBlockedMe.push(b_id);
        }
        return whoBlockedMe;
    }
    async getEveryoneWhoFriendedMe(myId) {
        let whoFriendedMe = [];
        const relationType = relation_type_enum_1.RelationType.FRIEND;
        const relations = await this.relationRepository
            .createQueryBuilder('r')
            .where('r.receiver_id = :myId', { myId })
            .andWhere('r.relation_type = :relationType', { relationType })
            .select(['r.sender_id'])
            .getMany();
        for (let r of relations) {
            let f_id = { userId: r.sender_id };
            whoFriendedMe.push(f_id);
        }
        return whoFriendedMe;
    }
};
exports.RelationService = RelationService;
exports.RelationService = RelationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        relation_repository_1.RelationRepository])
], RelationService);
//# sourceMappingURL=relation.service.js.map