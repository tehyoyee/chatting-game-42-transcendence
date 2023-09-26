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
exports.UserChannelBridge = void 0;
const typeorm_1 = require("typeorm");
const user_type_enum_1 = require("../enum/user_type.enum");
const user_entity_1 = require("../../user/entity/user.entity");
const channel_entity_1 = require("./channel.entity");
let UserChannelBridge = class UserChannelBridge extends typeorm_1.BaseEntity {
};
exports.UserChannelBridge = UserChannelBridge;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], UserChannelBridge.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], UserChannelBridge.prototype, "channel_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserChannelBridge.prototype, "user_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserChannelBridge.prototype, "is_banned", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserChannelBridge.prototype, "is_muted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => user_entity_1.User, user => user.join_channels, { eager: false }),
    __metadata("design:type", user_entity_1.User)
], UserChannelBridge.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => channel_entity_1.Channel, channel => channel.details, { eager: true }),
    __metadata("design:type", channel_entity_1.Channel)
], UserChannelBridge.prototype, "channel", void 0);
exports.UserChannelBridge = UserChannelBridge = __decorate([
    (0, typeorm_1.Entity)()
], UserChannelBridge);
//# sourceMappingURL=user-channel-bridge.entity.js.map