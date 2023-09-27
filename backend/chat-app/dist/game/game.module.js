"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const auth_module_1 = require("../auth/auth.module");
const game_gateway_1 = require("./game.gateway");
const common_1 = require("@nestjs/common");
const user_module_1 = require("../user/user.module");
const auth_service_1 = require("../auth/auth.service");
const user_service_1 = require("../user/user.service");
const mail_service_1 = require("../auth/mail.service");
const mailer_1 = require("@nestjs-modules/mailer");
const axios_1 = require("@nestjs/axios");
const user_repository_1 = require("../user/user.repository");
const game_service_1 = require("./game.service");
const game_repository_1 = require("./game.repository");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            mailer_1.MailerModule,
            axios_1.HttpModule,
        ],
        providers: [
            game_gateway_1.GameGateway,
            game_service_1.GameService,
            auth_service_1.AuthService,
            user_service_1.UserService,
            mail_service_1.MailService,
            user_repository_1.UserRepository,
            game_repository_1.GameRepository,
        ],
    })
], GameModule);
//# sourceMappingURL=game.module.js.map