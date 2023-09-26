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
exports.MessageRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const message_entity_1 = require("../entity/message.entity");
let MessageRepository = class MessageRepository extends typeorm_1.Repository {
    constructor(dataSource) {
        super(message_entity_1.Message, dataSource.createEntityManager());
    }
    async createGroupMessage(sender, channel, content) {
        const newMessage = new message_entity_1.Message();
        newMessage.content = content;
        newMessage.user = sender;
        newMessage.channel = channel;
        await newMessage.save();
        return newMessage;
    }
    async createDM(sender, channel, content) {
        const newDM = new message_entity_1.Message();
        newDM.content = content;
        newDM.user = sender;
        newDM.channel = channel;
        await newDM.save();
        return newDM;
    }
    async deleteMessagesByChannelId(channelId) {
        await this.delete({ channel_id: channelId });
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], MessageRepository);
//# sourceMappingURL=message.repository.js.map