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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const common_2 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const g_debug = true;
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    signUp(code, res) {
        if (g_debug)
            console.log('/signup');
        return this.authService.signUp(code, res);
    }
    checkLoginState(req, res) {
        if (g_debug)
            console.log('/state');
        return this.authService.checkLoginState(req, res);
    }
    signOut(req, res) {
        if (g_debug)
            console.log('/signout');
        return this.authService.signOut(req, res);
    }
    authTwoFactor(body, inputCode, res) {
        if (g_debug)
            console.log('/twofactor');
        return this.authService.authTwoFactor(body, inputCode, res);
    }
    test() {
        console.log('authguard passed');
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('/signup'),
    __param(0, (0, common_2.Query)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Get)('/state'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "checkLoginState", null);
__decorate([
    (0, common_1.Get)('/signout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signOut", null);
__decorate([
    (0, common_1.Post)('/twofactor'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_2.Query)('inputCode')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "authTwoFactor", null);
__decorate([
    (0, common_1.Get)('/test'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "test", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map