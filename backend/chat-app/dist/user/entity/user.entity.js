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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const user_status_enum_1 = require("../enum/user-status.enum");
const user_achievements_enum_1 = require("../enum/user-achievements.enum");
const user_channel_bridge_entity_1 = require("../../chat/entity/user-channel-bridge.entity");
const message_entity_1 = require("../../chat/entity/message.entity");
const relation_entity_1 = require("../../relation/entity/relation.entity");
const game_history_entity_1 = require("../../game/game.history.entity");
let User = class User extends typeorm_1.BaseEntity {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], User.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "two_factor", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: user_status_enum_1.UserStatus.OFFLINE }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'default_image' }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "win_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "lose_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1000 }),
    __metadata("design:type", Number)
], User.prototype, "point", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: user_achievements_enum_1.UserAchievement.A0 }),
    __metadata("design:type", String)
], User.prototype, "achievement", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], User.prototype, "auth_code", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => user_channel_bridge_entity_1.UserChannelBridge, join_channels => join_channels.user, { eager: false }),
    __metadata("design:type", Array)
], User.prototype, "join_channels", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => message_entity_1.Message, messages => messages.user, { eager: false }),
    __metadata("design:type", Array)
], User.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => relation_entity_1.Relation, senders => senders.sender, { eager: true }),
    __metadata("design:type", Array)
], User.prototype, "senders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => game_history_entity_1.GameHistory, gameHistory => gameHistory.player, { eager: true }),
    __metadata("design:type", Array)
], User.prototype, "gameHistories", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
//# sourceMappingURL=user.entity.js.map