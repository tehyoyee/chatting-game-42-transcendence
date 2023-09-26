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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const channel_repository_1 = require("./repository/channel.repository");
const message_repository_1 = require("./repository/message.repository");
const ucb_repository_1 = require("./repository/ucb.repository");
const user_type_enum_1 = require("./enum/user_type.enum");
const user_service_1 = require("../user/user.service");
const auth_service_1 = require("../auth/auth.service");
const bcrypt = require("bcrypt");
const channel_type_enum_1 = require("./enum/channel_type.enum");
const relation_service_1 = require("../relation/relation.service");
let ChatService = class ChatService {
    constructor(channelRepository, messageRepository, ucbRepository, userService, relationService, authService) {
        this.channelRepository = channelRepository;
        this.messageRepository = messageRepository;
        this.ucbRepository = ucbRepository;
        this.userService = userService;
        this.relationService = relationService;
        this.authService = authService;
    }
    async createGroupChannelAndBridge(user, groupChannelDto) {
        const newChannel = await this.channelRepository.createGroupChannel(groupChannelDto);
        await this.createUCBridge(user, newChannel, user_type_enum_1.UserType.OWNER);
        return newChannel;
    }
    async createDmChannelAndBridges(sender, senderId, receiverId) {
        const newChannel = await this.channelRepository.createDmChannel(senderId, receiverId);
        const receiver = await this.userService.getProfileByUserId(receiverId);
        await this.createUCBridge(sender, newChannel, user_type_enum_1.UserType.MEMBER);
        await this.createUCBridge(receiver, newChannel, user_type_enum_1.UserType.MEMBER);
        return newChannel;
    }
    async createUCBridge(user, channel, userType) {
        await this.ucbRepository.createUCBridge(user, channel, userType);
    }
    async getAllGroupChannelsByChannelType(channelType) {
        let channels = [];
        const channel = await this.channelRepository
            .createQueryBuilder('c')
            .select(['c.channel_id', 'c.channel_name', 'c.channel_type'])
            .where('c.channel_type = :channelType', { channelType })
            .orderBy('c.channel_id');
        channels = await channel.getMany();
        return channels;
    }
    async getJoinedGroupChannelsByUserId(userId) {
        const isBanned = false;
        const channelIds = await this.ucbRepository
            .createQueryBuilder('b')
            .where('b.user_id = :userId', { userId })
            .andWhere('b.is_banned = :isBanned', { isBanned })
            .select(['b.channel_id'])
            .getMany();
        let joinedChannels = [];
        for (let c of channelIds) {
            let tmp = await this.channelRepository.getChannelById(c.channel_id);
            if (tmp.channel_type === channel_type_enum_1.ChannelType.PUBLIC || tmp.channel_type === channel_type_enum_1.ChannelType.PROTECTED) {
                joinedChannels.push(tmp);
            }
        }
        return joinedChannels;
    }
    async getJoinedDmChannelsByUserId(userId) {
        const channels = await this.ucbRepository
            .createQueryBuilder('b')
            .where('b.user_id = :userId', { userId })
            .select(['b.channel_id'])
            .getMany();
        let joinedChannels = [];
        for (let c of channels) {
            let tmp = await this.channelRepository.getChannelById(c.channel_id);
            if (tmp.channel_type === channel_type_enum_1.ChannelType.DM) {
                joinedChannels.push(tmp);
            }
        }
        return joinedChannels;
    }
    async createGroupMessage(sender, channel, content) {
        return await this.messageRepository.createGroupMessage(sender, channel, content);
    }
    async createDM(sender, channel, content) {
        return await this.messageRepository.createDM(sender, channel, content);
    }
    async getAllMessagesExceptBlockByChannelId(userId, channelId) {
        let previousMessages = [];
        const rows = await this.messageRepository
            .createQueryBuilder('m')
            .where('m.channel_id = :channelId', { channelId })
            .select(['m.user_id', 'm.content'])
            .orderBy('m.created_at', 'ASC')
            .getMany();
        for (let r of rows) {
            const user = await this.userService.getProfileByUserId(r.user_id);
            let message = { writerId: r.user_id,
                writerNickname: user.nickname,
                content: r.content };
            previousMessages.push(message);
        }
        let i = 0;
        while (i < previousMessages.length) {
            if (await this.relationService.checkBlocked(userId, previousMessages[i].writerId)) {
                previousMessages.splice(i, 1);
            }
            else {
                i++;
            }
        }
        return previousMessages;
    }
    async deleteUCBridge(userId, channelId) {
        return await this.ucbRepository.deleteUCBridge(userId, channelId);
    }
    async deleteChannelIfEmpty(channelId) {
        const channels = await this.ucbRepository
            .createQueryBuilder('b')
            .where('b.channel_id = :channelId', { channelId })
            .select(['b.channel_id', 'b.user_id', 'b.is_banned'])
            .getMany();
        if (channels.length === 0) {
            await this.deleteMessagesByChannelId(channelId);
            await this.channelRepository.deleteChannelByChannelId(channelId);
            return;
        }
        for (let c of channels) {
            if (!c.is_banned) {
                return;
            }
        }
        let bannedUsersId = [];
        for (let c of channels) {
            bannedUsersId.push(c.user_id);
        }
        for (let bId of bannedUsersId) {
            await this.deleteUCBridge(bId, channelId);
        }
        await this.deleteMessagesByChannelId(channelId);
        await this.channelRepository.deleteChannelByChannelId(channelId);
    }
    async deleteDmChannel(channelId) {
        return await this.channelRepository.deleteChannelByChannelId(channelId);
    }
    async deleteMessagesByChannelId(channelId) {
        await this.messageRepository.deleteMessagesByChannelId(channelId);
    }
    async updateUserTypeOfUCBridge(targetUserId, channelId, newType) {
        await this.ucbRepository.updateUserTypeOfUCBridge(targetUserId, channelId, newType);
    }
    async checkChannelPassword(channel, inputPwd) {
        if (await bcrypt.compare(inputPwd, channel.channel_pwd))
            return true;
        return false;
    }
    async checkDmRoomExists(senderId, receiverId) {
        let channelName = 'user' + senderId + ":" + 'user' + receiverId;
        const found1 = await this.channelRepository.getDmRoomByName(channelName);
        if (found1)
            return found1;
        channelName = 'user' + receiverId + ":" + 'user' + senderId;
        const found2 = await this.channelRepository.getDmRoomByName(channelName);
        if (found2)
            return found2;
        return null;
    }
    async isOwnerOfChannel(userId, channelId) {
        const found = await this.ucbRepository.getUcbByIds(userId, channelId);
        if (!found)
            throw new common_1.HttpException('Unexist Bridge', common_1.HttpStatus.NOT_FOUND);
        if (found.user_type === user_type_enum_1.UserType.OWNER)
            return true;
        return null;
    }
    async isAdminOfChannel(userId, channelId) {
        const found = await this.ucbRepository.getUcbByIds(userId, channelId);
        if (!found)
            throw new common_1.HttpException('Unexist Bridge', common_1.HttpStatus.NOT_FOUND);
        if (found.user_type === user_type_enum_1.UserType.ADMIN)
            return true;
        return null;
    }
    async checkUserInThisChannel(userId, channelId) {
        return await this.ucbRepository.getUcbByIds(userId, channelId);
    }
    async updatePassword(channel, newPassword) {
        await this.channelRepository.setPassword(channel, newPassword);
    }
    async removePassword(channel) {
        await this.channelRepository.unsetPassword(channel);
    }
    async updateBanStatus(bridge, newBanStatus) {
        return await this.ucbRepository.updateBanStatus(bridge, newBanStatus);
    }
    async updateMuteStatus(bridge, newMuteStatus) {
        return await this.ucbRepository.updateMuteStatus(bridge, newMuteStatus);
    }
    async getChannelByName(channelName) {
        return await this.channelRepository.getChannelByName(channelName);
    }
    async getChannelById(id) {
        return await this.channelRepository.getChannelById(id);
    }
    async getAllUsersInChannelByChannelId(newUserId, channelId) {
        let inners = [];
        const isBanned = false;
        const bridges = await this.ucbRepository
            .createQueryBuilder('b')
            .where('b.channel_id = :channelId', { channelId })
            .andWhere('b.is_banned = :isBanned', { isBanned })
            .select(['b.user_id', 'b.user_type', 'b.is_muted'])
            .getMany();
        for (let b of bridges) {
            const oldUser = await this.userService.getProfileByUserId(b.user_id);
            const newUser = await this.userService.getProfileByUserId(newUserId);
            const is_friend = await this.relationService.checkFriended(newUser.user_id, oldUser.user_id);
            const is_blocked = await this.relationService.checkBlocked(newUser.user_id, oldUser.user_id);
            const oldUserStatus = await this.userService.getCurrentUserStatusByUserId(b.user_id);
            let inner = { userId: b.user_id,
                userNickName: oldUser.nickname,
                userType: b.user_type,
                isMuted: b.is_muted,
                isFriend: is_friend,
                isBlocked: is_blocked,
                userStatus: oldUserStatus };
            inners.push(inner);
        }
        return inners;
    }
    getReceiverIdByDmChannelName(senderId, channelName) {
        const regex = /user(\d+):user(\d+)/;
        const matches = channelName.match(regex);
        if (matches) {
            const [, id1, id2] = matches;
            const firstUserId = parseInt(id1, 10);
            const secondUserId = parseInt(id2, 10);
            return firstUserId === senderId ? secondUserId : firstUserId;
        }
        else {
            return null;
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [channel_repository_1.ChannelRepository,
        message_repository_1.MessageRepository,
        ucb_repository_1.UcbRepository,
        user_service_1.UserService,
        relation_service_1.RelationService,
        auth_service_1.AuthService])
], ChatService);
//# sourceMappingURL=chat.service.js.map