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
exports.Channel = void 0;
const typeorm_1 = require("typeorm");
const channel_type_enum_1 = require("../enum/channel_type.enum");
const message_entity_1 = require("./message.entity");
const user_channel_bridge_entity_1 = require("./user-channel-bridge.entity");
let Channel = class Channel extends typeorm_1.BaseEntity {
};
exports.Channel = Channel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Channel.prototype, "channel_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Channel.prototype, "channel_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Channel.prototype, "channel_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Channel.prototype, "salt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Channel.prototype, "channel_pwd", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => user_channel_bridge_entity_1.UserChannelBridge, details => details.channel, { eager: false }),
    __metadata("design:type", Array)
], Channel.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => message_entity_1.Message, messages => messages.channel, { eager: false }),
    __metadata("design:type", Array)
], Channel.prototype, "messages", void 0);
exports.Channel = Channel = __decorate([
    (0, typeorm_1.Entity)()
], Channel);
//# sourceMappingURL=channel.entity.js.map