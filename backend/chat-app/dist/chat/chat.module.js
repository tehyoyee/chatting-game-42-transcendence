"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const chat_controller_1 = require("./chat.controller");
const chat_gateway_1 = require("./chat.gateway");
const typeorm_1 = require("@nestjs/typeorm");
const channel_entity_1 = require("./entity/channel.entity");
const message_entity_1 = require("./entity/message.entity");
const user_channel_bridge_entity_1 = require("./entity/user-channel-bridge.entity");
const user_module_1 = require("../user/user.module");
const channel_repository_1 = require("./repository/channel.repository");
const message_repository_1 = require("./repository/message.repository");
const ucb_repository_1 = require("./repository/ucb.repository");
const auth_module_1 = require("../auth/auth.module");
const user_service_1 = require("../user/user.service");
const auth_service_1 = require("../auth/auth.service");
const axios_1 = require("@nestjs/axios");
const mail_service_1 = require("../auth/mail.service");
const mailer_1 = require("@nestjs-modules/mailer");
const relation_module_1 = require("../relation/relation.module");
const relation_service_1 = require("../relation/relation.service");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([channel_entity_1.Channel, message_entity_1.Message, user_channel_bridge_entity_1.UserChannelBridge]),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            axios_1.HttpModule,
            mailer_1.MailerModule,
            relation_module_1.RelationModule
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_gateway_1.ChatGateway, user_service_1.UserService, auth_service_1.AuthService, mail_service_1.MailService, chat_service_1.ChatService, relation_service_1.RelationService, channel_repository_1.ChannelRepository, message_repository_1.MessageRepository, ucb_repository_1.UcbRepository],
        exports: [chat_service_1.ChatService, channel_repository_1.ChannelRepository, message_repository_1.MessageRepository, ucb_repository_1.UcbRepository]
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map