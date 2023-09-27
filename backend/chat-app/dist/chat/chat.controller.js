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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const chat_gateway_1 = require("./chat.gateway");
const channel_type_enum_1 = require("./enum/channel_type.enum");
const user_service_1 = require("../user/user.service");
let ChatController = class ChatController {
    constructor(userServics, chatService, chatGateway) {
        this.userServics = userServics;
        this.chatService = chatService;
        this.chatGateway = chatGateway;
    }
    async getAllPublicChannel() {
        let channels = [];
        channels = await this.chatService.getAllGroupChannelsByChannelType(channel_type_enum_1.ChannelType.PUBLIC);
        return channels;
    }
    async getAllProtectedChannel() {
        let channels = [];
        channels = await this.chatService.getAllGroupChannelsByChannelType(channel_type_enum_1.ChannelType.PROTECTED);
        return channels;
    }
    async getJoinedGroupChannelsByUserId(id) {
        let channels = [];
        channels = await this.chatService.getJoinedGroupChannelsByUserId(id);
        return channels;
    }
    async getJoinedDmChannelsByUserId(id) {
        let channels = [];
        channels = await this.chatService.getJoinedDmChannelsByUserId(id);
        return channels;
    }
    async getChannelByChannelId(id) {
        return await this.chatService.getChannelById(id);
    }
    async getChannelByChannelName(name) {
        return await this.chatService.getChannelByName(name);
    }
    async getProfileByUserIdInChannel(id) {
        return await this.userServics.getProfileByUserId(id);
    }
    async getAllUsersInfoInChannel(uid, cid) {
        return await this.chatService.getAllUsersInChannelByChannelId(uid, cid);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('channel/all/public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAllPublicChannel", null);
__decorate([
    (0, common_1.Get)('channel/all/protected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAllProtectedChannel", null);
__decorate([
    (0, common_1.Get)('channel/joined/group/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getJoinedGroupChannelsByUserId", null);
__decorate([
    (0, common_1.Get)('channel/joined/dm/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getJoinedDmChannelsByUserId", null);
__decorate([
    (0, common_1.Get)('/channel/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChannelByChannelId", null);
__decorate([
    (0, common_1.Get)('/channel/:name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChannelByChannelName", null);
__decorate([
    (0, common_1.Get)('profile/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getProfileByUserIdInChannel", null);
__decorate([
    (0, common_1.Get)('users-in-channel/:uid/:cid'),
    __param(0, (0, common_1.Param)('uid', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('cid', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAllUsersInfoInChannel", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        chat_service_1.ChatService,
        chat_gateway_1.ChatGateway])
], ChatController);
//# sourceMappingURL=chat.controller.js.map