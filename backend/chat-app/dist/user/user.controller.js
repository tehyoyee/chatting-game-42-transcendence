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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const platform_express_1 = require("@nestjs/platform-express");
const common_2 = require("@nestjs/common");
const fs_1 = require("fs");
const common_3 = require("@nestjs/common");
const g_debug = true;
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async getRanking() {
        return await this.userService.getRanking();
    }
    async getGameHistoryByUserId(id) {
        return await this.userService.getGameHistoryByUserId(id);
    }
    async getMyProfile(id, req) {
        console.log(req);
        return await this.userService.getMyProfile(id);
    }
    async getProfileByUserId(id) {
        if (g_debug)
            console.log('/profile/:id');
        return await this.userService.getProfileByUserId(id);
    }
    async getFile(res, id) {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new common_3.HttpException('User not Found', 400);
        try {
            const filePath = await this.userService.getAvatarByUserId(id);
            const file = (0, fs_1.createReadStream)(filePath);
            return new common_2.StreamableFile(file);
        }
        catch {
            throw new common_3.HttpException('File not Found', 404);
        }
    }
    async updateNickName(id, nickName) {
        if (g_debug)
            console.log('/updateName/:id/:nickName');
        await this.userService.updateNickName(id, nickName);
    }
    async updateAvatar(file, id) {
        const path = file.path.replace(__dirname + `/../../uploads`, '');
        await this.userService.updateAvatar(id, path);
        console.log(`/updateAvatar/:id path=${path}`);
        return {
            fileName: file.originalname,
            savedPath: path.replace(/\\/gi, '/'),
            size: file.size,
        };
    }
    async updateTwoFactor(id, twoFactor) {
        if (g_debug)
            console.log('/updateTFA/:id/:twoFactor');
        await this.userService.updateTwoFactor(id, twoFactor);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('/profile/ranking'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getRanking", null);
__decorate([
    (0, common_1.Get)('/profile/game/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getGameHistoryByUserId", null);
__decorate([
    (0, common_1.Get)('/profile'),
    __param(0, (0, common_1.Body)('user_id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Request]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)('/profile/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfileByUserId", null);
__decorate([
    (0, common_1.Get)('/profile/avatar/:id'),
    (0, common_1.Header)('Content-Type', 'image/png'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Response, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getFile", null);
__decorate([
    (0, common_1.Patch)('/updateName/:id/:nickName'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('nickName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateNickName", null);
__decorate([
    (0, common_1.Post)('/updateAvatar/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateAvatar", null);
__decorate([
    (0, common_1.Patch)('/updateTFA/:id/:twoFactor'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('twoFactor', common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Boolean]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateTwoFactor", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map