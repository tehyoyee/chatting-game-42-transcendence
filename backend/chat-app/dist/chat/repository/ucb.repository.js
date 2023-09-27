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
exports.UcbRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const user_channel_bridge_entity_1 = require("../entity/user-channel-bridge.entity");
let UcbRepository = class UcbRepository extends typeorm_1.Repository {
    constructor(dataSource) {
        super(user_channel_bridge_entity_1.UserChannelBridge, dataSource.createEntityManager());
        this.logger = new common_1.Logger('UcbRepository');
    }
    async getUcbByIds(userId, channelId) {
        const found = await this.findOne({
            where: { user_id: userId,
                channel_id: channelId }
        });
        return found;
    }
    async createUCBridge(user, channel, userType) {
        const found = await this.getUcbByIds(user.user_id, channel.channel_id);
        if (!found) {
            const newBridge = new user_channel_bridge_entity_1.UserChannelBridge();
            newBridge.user_id = user.user_id;
            newBridge.channel_id = channel.channel_id;
            newBridge.user_type = userType;
            newBridge.user = user;
            newBridge.channel = channel;
            await newBridge.save();
        }
    }
    async deleteUCBridge(userId, channelId) {
        await this.delete({ channel_id: channelId, user_id: userId });
    }
    async updateUserTypeOfUCBridge(targetUserId, channelId, newType) {
        const found = await this.getUcbByIds(targetUserId, channelId);
        if (found) {
            found.user_type = newType;
            await found.save();
        }
        else {
            this.logger.debug('Unexist Bridge');
            throw new common_1.HttpException('Unexist Bridge', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async updateBanStatus(bridge, newBanStatus) {
        bridge.is_banned = newBanStatus;
        await bridge.save();
        return bridge;
    }
    async updateMuteStatus(bridge, newMuteStatus) {
        bridge.is_muted = newMuteStatus;
        await bridge.save();
        return bridge;
    }
};
exports.UcbRepository = UcbRepository;
exports.UcbRepository = UcbRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], UcbRepository);
//# sourceMappingURL=ucb.repository.js.map