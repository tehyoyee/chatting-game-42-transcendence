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
exports.RelationController = void 0;
const common_1 = require("@nestjs/common");
const relation_service_1 = require("./relation.service");
const relation_dto_1 = require("./dto/relation-dto");
const user_service_1 = require("../user/user.service");
let RelationController = class RelationController {
    constructor(relationService, userService) {
        this.relationService = relationService;
        this.userService = userService;
    }
    async addFriend(relationDto) {
        const sender = await this.userService.getProfileByUserId(relationDto.senderId);
        return await this.relationService.addFriend(sender, relationDto.receiverId);
    }
    async addBlock(relationDto) {
        const sender = await this.userService.getProfileByUserId(relationDto.senderId);
        return await this.relationService.addBlock(sender, relationDto.receiverId);
    }
    async unFriend(relationDto) {
        try {
            const sender = await this.userService.getProfileByUserId(relationDto.senderId);
            await this.relationService.unFriend(relationDto.senderId, relationDto.receiverId);
        }
        catch (exception) {
            return { state: false };
        }
        return { state: true };
    }
    async unBlock(relationDto) {
        try {
            const sender = await this.userService.getProfileByUserId(relationDto.senderId);
            await this.relationService.unBlock(relationDto.senderId, relationDto.receiverId);
        }
        catch (exception) {
            return { state: false };
        }
        return { state: true };
    }
    async getFriendsStatusOfUser(userId) {
        return await this.relationService.getFriendsOfUser(userId);
    }
    async getBlocksStatusOfUser(userId) {
        return await this.relationService.getBlocksOfUser(userId);
    }
};
exports.RelationController = RelationController;
__decorate([
    (0, common_1.Post)('add/friend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [relation_dto_1.RelationDto]),
    __metadata("design:returntype", Promise)
], RelationController.prototype, "addFriend", null);
__decorate([
    (0, common_1.Post)('add/block'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [relation_dto_1.RelationDto]),
    __metadata("design:returntype", Promise)
], RelationController.prototype, "addBlock", null);
__decorate([
    (0, common_1.Delete)('remove/friend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [relation_dto_1.RelationDto]),
    __metadata("design:returntype", Promise)
], RelationController.prototype, "unFriend", null);
__decorate([
    (0, common_1.Delete)('remove/block'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [relation_dto_1.RelationDto]),
    __metadata("design:returntype", Promise)
], RelationController.prototype, "unBlock", null);
__decorate([
    (0, common_1.Get)('social/friends/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RelationController.prototype, "getFriendsStatusOfUser", null);
__decorate([
    (0, common_1.Get)('social/blocks/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RelationController.prototype, "getBlocksStatusOfUser", null);
exports.RelationController = RelationController = __decorate([
    (0, common_1.Controller)('relation'),
    __metadata("design:paramtypes", [relation_service_1.RelationService,
        user_service_1.UserService])
], RelationController);
//# sourceMappingURL=relation.controller.js.map