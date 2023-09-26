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
exports.ChannelRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const channel_entity_1 = require("../entity/channel.entity");
const bcrypt = require("bcrypt");
const channel_type_enum_1 = require("../enum/channel_type.enum");
let ChannelRepository = class ChannelRepository extends typeorm_1.Repository {
    constructor(dataSource) {
        super(channel_entity_1.Channel, dataSource.createEntityManager());
    }
    async createGroupChannel(groupChannelDto) {
        const { channelName, channelType, password } = groupChannelDto;
        const newChannel = new channel_entity_1.Channel();
        newChannel.channel_name = channelName;
        newChannel.channel_type = channelType;
        if (channelType === channel_type_enum_1.ChannelType.PROTECTED && password) {
            newChannel.salt = await bcrypt.genSalt();
            newChannel.channel_pwd = await bcrypt.hash(password, newChannel.salt);
        }
        if (channelType === channel_type_enum_1.ChannelType.PUBLIC) {
            newChannel.salt = '';
            newChannel.channel_pwd = '';
        }
        await newChannel.save();
        return newChannel;
    }
    async createDmChannel(senderId, receiverId) {
        const newChannel = new channel_entity_1.Channel();
        newChannel.channel_name = 'user' + senderId.toString() + ":" + 'user' + receiverId.toString();
        newChannel.channel_type = channel_type_enum_1.ChannelType.DM;
        newChannel.salt = '';
        newChannel.channel_pwd = '';
        await newChannel.save();
        return newChannel;
    }
    async createPrivateChannel(channelName) {
        const newChannel = new channel_entity_1.Channel();
        newChannel.channel_name = channelName;
        newChannel.channel_type = channel_type_enum_1.ChannelType.PRIVATE;
        newChannel.salt = '';
        newChannel.channel_pwd = '';
        await newChannel.save();
        return newChannel;
    }
    async getChannelByName(channelName) {
        const found = await this.findOne({
            where: { channel_name: channelName },
        });
        return found;
    }
    async getChannelById(channelId) {
        const found = await this.findOne({
            where: { channel_id: channelId },
        });
        return found;
    }
    async getDmRoomByName(channelName) {
        const found = await this.findOne({
            where: { channel_name: channelName,
                channel_type: channel_type_enum_1.ChannelType.DM }
        });
        return found;
    }
    async deleteChannelByChannelId(channelId) {
        const result = await this.delete({ channel_id: channelId });
        if (result.affected !== 1) {
            throw new common_1.ServiceUnavailableException();
        }
    }
    async setPassword(channel, newPassword) {
        if (channel.channel_type === channel_type_enum_1.ChannelType.PUBLIC) {
            channel.channel_type = channel_type_enum_1.ChannelType.PROTECTED;
        }
        channel.salt = await bcrypt.genSalt();
        channel.channel_pwd = await bcrypt.hash(newPassword, channel.salt);
        await channel.save();
    }
    async unsetPassword(channel) {
        channel.channel_type = channel_type_enum_1.ChannelType.PUBLIC;
        channel.salt = '';
        channel.channel_pwd = '';
        await channel.save();
    }
};
exports.ChannelRepository = ChannelRepository;
exports.ChannelRepository = ChannelRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ChannelRepository);
//# sourceMappingURL=channel.repository.js.map