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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const user_service_1 = require("../user/user.service");
const auth_service_1 = require("../auth/auth.service");
const common_1 = require("@nestjs/common");
const user_type_enum_1 = require("./enum/user_type.enum");
const channel_dto_1 = require("./dto/channel-dto");
const update_dto_1 = require("./dto/update-dto");
const channel_type_enum_1 = require("./enum/channel_type.enum");
const message_dto_1 = require("./dto/message-dto");
const user_status_enum_1 = require("../user/enum/user-status.enum");
const relation_service_1 = require("../relation/relation.service");
const serverConfig = require("config");
const game_dto_1 = require("./dto/game-dto");
let ChatGateway = class ChatGateway {
    constructor(authService, userService, relationServie, chatService) {
        this.authService = authService;
        this.userService = userService;
        this.relationServie = relationServie;
        this.chatService = chatService;
        this.logger = new common_1.Logger('ChatGateway');
        this.userSocketMap = new Map();
    }
    async handleConnection(client) {
        this.logger.debug("handle connection in");
        const user = await this.socketToUser(client);
        if (!user) {
            this.server.to(client.id).emit("forceLogout");
        }
        const token = client.handshake.query.token;
        if (this.userSocketMap.has(user.user_id)) {
            this.server.to(client.id).emit('forceLogout');
        }
        else {
            await this.userService.updateStatus(user.user_id, user_status_enum_1.UserStatus.ONLINE);
            this.userSocketMap.set(user.user_id, client);
        }
        client.data.user = user;
        const joinedGroupChannels = await this.chatService.getJoinedGroupChannelsByUserId(user.user_id);
        for (let c of joinedGroupChannels) {
            client.join(c.channel_name);
        }
        const joinedDmChannels = await this.chatService.getJoinedDmChannelsByUserId(user.user_id);
        for (let c of joinedDmChannels) {
            client.join(c.channel_name);
        }
        await this.userService.updateStatus(user.user_id, user_status_enum_1.UserStatus.ONLINE);
        await this.emitUserStatus(user.user_id);
    }
    async handleDisconnect(client) {
        const user = await this.socketToUser(client);
        if (user && this.userSocketMap.has(user.user_id)) {
            this.userSocketMap.delete(user.user_id);
            await this.userService.updateStatus(user.user_id, user_status_enum_1.UserStatus.OFFLINE);
            await this.emitUserStatus(user.user_id);
        }
        else if (!user) {
            const userId = Number(this.getKeyByValue(this.userSocketMap, client));
            if (userId) {
                this.userSocketMap.delete(userId);
                await this.userService.updateStatus(userId, user_status_enum_1.UserStatus.OFFLINE);
                await this.emitUserStatus(userId);
            }
        }
        client.disconnect();
    }
    getKeyByValue(map, value) {
        return Object.keys(map).find(key => map[key] === value);
    }
    async socketToUser(client) {
        const token = client.handshake.query.token;
        if (!token) {
            this.logger.debug('Null Token');
            return null;
        }
        try {
            const decoded = await this.authService.verifyTokenSocket(token);
            const user = await this.userService.getProfileByUserId(decoded.id);
            return user;
        }
        catch (err) {
            this.logger.debug(err);
            return null;
        }
    }
    userIdToSocket(userId) {
        return this.userSocketMap.get(userId);
    }
    async onCreateGroupChannel(client, groupChannelDto) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('creation-fail', 'Unidentified User Error in onCreateGroupChannel');
            return;
        }
        const duplicate = await this.chatService.getChannelByName(groupChannelDto.channelName);
        if (duplicate) {
            client.emit('creation-fail', 'Duplicate Channel Name Error in onCreateGroupChannel');
            return;
        }
        const newChannel = await this.chatService.createGroupChannelAndBridge(user, groupChannelDto);
        const newBridge = await this.chatService.checkUserInThisChannel(user.user_id, newChannel.channel_id);
        client.emit('creation-success', { channel_id: newChannel.channel_id, user_type: newBridge.user_type });
        client.join(newChannel.channel_name);
        this.server.to(newChannel.channel_name).emit("join", { user_id: user.user_id, user_nickname: user.nickname });
    }
    async onEnterDmChannel(client, dmChannelDto) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('enter-dm-fail', 'Unidentified User Error in onEnterDmChannel');
            return;
        }
        const receiver = await this.userService.getProfileByUserId(dmChannelDto.receiverId);
        if (!receiver) {
            client.emit('enter-dm-fail', 'Receiver Not Found Error in onEnterDmChannel');
            return;
        }
        if (receiver.status !== user_status_enum_1.UserStatus.ONLINE) {
            client.emit('enter-dm-fail', 'Receiver Not ONLINE Error in onEnterDmChannel');
            return;
        }
        let channel, bridge, receiverBridge;
        const exist = await this.chatService.checkDmRoomExists(user.user_id, dmChannelDto.receiverId);
        if (exist) {
            channel = exist;
        }
        else {
            channel = await this.chatService.createDmChannelAndBridges(user, user.user_id, dmChannelDto.receiverId);
            console.debug('dm channel message fail: create new dm channel');
        }
        bridge = await this.chatService.checkUserInThisChannel(user.user_id, channel.channel_id);
        receiverBridge = await this.chatService.checkUserInThisChannel(dmChannelDto.receiverId, channel.channel_id);
        client.join(channel.channel_name);
        client.emit('enter-dm-success', { channel_id: channel.channel_id, user_type: bridge.user_type });
        this.server.to(channel.channel_name).emit("join", { user_id: user.user_id, user_nickname: user.nickname });
        let previousMessages = [];
        previousMessages = await this.chatService.getAllMessagesExceptBlockByChannelId(user.user_id, channel.channel_id);
        this.server.to(client.id).emit("messages", previousMessages);
    }
    async onJoinGroupChannel(client, joinGroupChannelDto) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('join-fail', 'Unidentified User Error in onJoinGroupChannel');
            return;
        }
        const bridge = await this.chatService.checkUserInThisChannel(user.user_id, joinGroupChannelDto.channelId);
        if (bridge && bridge.is_banned) {
            client.emit('join-fail', 'Banned User Error in onJoinGroupChannel');
            return;
        }
        const channel = await this.chatService.getChannelById(joinGroupChannelDto.channelId);
        if (!channel) {
            client.emit('join-fail', 'Unexist Channel Error in onJoinGroupChannel');
            return;
        }
        if (channel.channel_type === channel_type_enum_1.ChannelType.PROTECTED) {
            if (!(await this.chatService.checkChannelPassword(channel, joinGroupChannelDto.password))) {
                client.emit('join-fail', 'Incorrect Password Error in onJoinGroupChannel');
                return;
            }
        }
        await this.chatService.createUCBridge(user, channel, user_type_enum_1.UserType.MEMBER);
        const newBridge = await this.chatService.checkUserInThisChannel(user.user_id, channel.channel_id);
        let previousMessages = [];
        previousMessages = await this.chatService.getAllMessagesExceptBlockByChannelId(user.user_id, channel.channel_id);
        client.join(channel.channel_name);
        client.emit('join-success', { channel_id: channel.channel_id, user_type: newBridge.user_type });
        this.server.to(client.id).emit("messages", previousMessages);
        this.server.to(channel.channel_name).emit("join", { userId: user.user_id, userNickname: user.nickname });
    }
    async onPostGroupMessage(client, groupMessageDto) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('post-fail', 'Unidentified User Error in onPostGroupMessage');
            return;
        }
        const decodedToken = await this.authService.verifyTokenSocket(groupMessageDto.token);
        if (!decodedToken) {
            this.server.to(client.id).emit("forceLogout");
            this.handleDisconnect(client);
            return;
        }
        if (groupMessageDto.content === '') {
            client.emit('post-fail', 'Empty Content Error in onPostGroupMessage');
            return;
        }
        const channel = await this.chatService.getChannelById(groupMessageDto.channel_id);
        if (!channel) {
            client.emit('post-fail', 'Unexist Channel Error in onPostGroupMessage');
            return;
        }
        const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channel.channel_id);
        if (!bridge || bridge.is_muted || bridge.is_banned) {
            client.emit('post-fail', 'Cannot Post Message Error in onPostGroupMessage');
            return;
        }
        const messageEntity = await this.chatService.createGroupMessage(user, channel, groupMessageDto.content);
        const newMessage = messageEntity.content;
        let listOfWhoBlockedMe = [];
        listOfWhoBlockedMe = await this.relationServie.getEveryoneWhoBlockedMe(user.user_id);
        this.server.to(channel.channel_name).fetchSockets()
            .then((sockets) => {
            sockets.forEach(async (socket) => {
                let innerToken = client.handshake.query.token;
                let innerDecoded = await this.authService.verifyToken(innerToken);
                let inner = await this.userService.getProfileByUserId(innerDecoded.id);
                if (!listOfWhoBlockedMe.includes({ userId: inner.user_id })) {
                    socket.emit("message", { message: newMessage, user_id: inner.user_id, user_nickname: inner.nickname });
                }
            });
        });
        console.log("'post-group-message'");
    }
    async onLeaveChannel(client, channelId) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('leave-fail', 'Unidentified User Error in onLeaveChannel');
            return;
        }
        const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
        if (!bridge) {
            client.emit('leave-fail', 'Unexist Bridge Error in onLeaveChannel');
            return;
        }
        const channel = await this.chatService.getChannelById(channelId);
        if (!channel) {
            client.emit('leave-fail', 'Unexist Channel Error in onLeaveChannel');
            return;
        }
        if (channel.channel_type === channel_type_enum_1.ChannelType.DM) {
            const receiverId = await this.chatService.getReceiverIdByDmChannelName(user.user_id, channel.channel_name);
            if (!receiverId) {
                client.emit('leave-fail', 'Unidentified Receiver User Error in onLeaveChannel');
                return;
            }
            if (user.user_id === receiverId) {
                client.emit('leave-fail', 'Cannot Leave Private Channel Error in onLeaveChannel');
                return;
            }
            const receiverBridge = await this.chatService.checkUserInThisChannel(receiverId, channel.channel_id);
            if (receiverBridge) {
                await this.chatService.deleteUCBridge(receiverId, channelId);
            }
            const receiverSocket = await this.userIdToSocket(receiverId);
            if (receiverSocket) {
                receiverSocket.leave(channel.channel_name);
                receiverSocket.emit('leave-success', channel.channel_id);
            }
            await this.chatService.deleteUCBridge(user.user_id, channelId);
            client.leave(channel.channel_name);
            client.emit('leave-success', channel.channel_id);
            await this.chatService.deleteMessagesByChannelId(channel.channel_id);
            await this.chatService.deleteDmChannel(channel.channel_id);
            return;
        }
        await this.chatService.deleteUCBridge(user.user_id, channelId);
        client.leave(channel.channel_name);
        client.emit('leave-success', channel.channel_id);
        this.server.to(channel.channel_name).emit("leave", { user_id: user.user_id, user_nickname: user.nickname });
        try {
            await this.chatService.deleteChannelIfEmpty(channelId);
        }
        catch (ServiceUnavailableException) {
            client.emit('leave-fail', 'Channel Not Deleted Error in onLeaveChannel');
        }
    }
    async onCloseChannelWindow(client, channelId) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('close-fail', 'Unidentified User Error in onCloseChannelWindow');
            return;
        }
        const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
        if (!bridge) {
            client.emit('close-fail', 'Unexist Bridge Error in onCloseChannelWindow');
            return;
        }
        const channel = await this.chatService.getChannelById(channelId);
        if (!channel) {
            client.emit('close-fail', 'Unexist Channel Error in onCloseChannelWindow');
            return;
        }
        client.leave(channel.channel_name);
        client.emit('close-success', channel.channel_id);
        this.server.to(channel.channel_name).emit("leave", { user_id: user.user_id, user_nickname: user.nickname });
    }
    async onSetAdmin(client, updateUserInfoDto) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('usermod-fail', 'Unidentified User Error in onSetAdmin');
            return;
        }
        const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
        if (!targetUser) {
            client.emit('usermod-fail', 'Unidentified Target User Error in onSetAdmin');
            return;
        }
        if (user.user_id === targetUser.user_id) {
            client.emit('usermod-fail', 'Cannot Set Yourself Error in onSetAdmin');
            return;
        }
        const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
        if (!bridge) {
            client.emit('usermod-fail', 'Unidentified User Error in onSetAdmin');
            return;
        }
        if (bridge.user_type !== user_type_enum_1.UserType.OWNER) {
            client.emit('usermod-fail', 'Cannot Set Owner As Admin Error in onSetAdmin');
            return;
        }
        const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
        if (!channel) {
            client.emit('usermod-fail', 'Unexist Channel Error in onSetAdmin');
            return;
        }
        await this.chatService.updateUserTypeOfUCBridge(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId, user_type_enum_1.UserType.ADMIN);
        client.emit('usermod-success', channel.channel_id);
        this.server.to(channel.channel_name).emit("admin", { user_id: targetUser.user_id, user_nickname: targetUser.nickname });
    }
    async onSetPassword(client, updatePasswordDto) {
        console.log(`/chat/set-password: value=${JSON.stringify(updatePasswordDto)}`);
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('setpwd-fail', 'Unidentified User Error in onSetPassword');
            return;
        }
        const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updatePasswordDto.channelId);
        if (!bridge) {
            client.emit('setpwd-fail', 'Unexist Bridge Error in onSetPassword');
            return;
        }
        if (bridge.user_type !== user_type_enum_1.UserType.OWNER) {
            client.emit('setpwd-fail', 'Cannot Set Password Error in onSetPassword');
            return;
        }
        const channel = await this.chatService.getChannelById(updatePasswordDto.channelId);
        if (!channel) {
            client.emit('setpwd-fail', 'Unexist Channel Error in onSetPassword');
            return;
        }
        await this.chatService.updatePassword(channel, updatePasswordDto.password);
        client.emit('setpwd-success', channel.channel_id);
        this.server.to(channel.channel_name).emit('password setted');
    }
    async onRemovePassword(client, channelId) {
        console.log(`/chat/remove-password: value=${channelId}, type=${typeof (channelId)}`);
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('removepwd-fail', 'Unidentified User Error in onRemovePassword');
            return;
        }
        const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
        if (!bridge) {
            client.emit('removepwd-fail', 'Unexist Bridge Error in onRemovePassword');
            return;
        }
        if (bridge.user_type !== user_type_enum_1.UserType.OWNER) {
            client.emit('removepwd-fail', 'Cannot Set Password Error in onRemovePassword');
            return;
        }
        const channel = await this.chatService.getChannelById(channelId);
        if (!channel) {
            client.emit('removepwd-fail', 'Unexist Channel Error in onRemovePassword');
            return;
        }
        await this.chatService.removePassword(channel);
        client.emit('removepwd-success', channel.channel_id);
        this.server.to(channel.channel_name).emit('password removed');
    }
    async onKickUser(client, updateUserInfoDto) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('usermod-fail', 'Unidentified User Error in onKickUser');
            return;
        }
        const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
        if (!userBridge) {
            client.emit('usermod-fail', 'Unexist Bridge Error in onKickUser');
            return;
        }
        if (userBridge.user_type !== user_type_enum_1.UserType.OWNER && userBridge.user_type !== user_type_enum_1.UserType.ADMIN) {
            client.emit('usermod-fail', 'Member Cannot Kick User Error in onKickUser');
            return;
        }
        const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
        if (!channel) {
            client.emit('usermod-fail', 'Unexist Channel Error in onKickUser');
            return;
        }
        if (channel.channel_type === channel_type_enum_1.ChannelType.DM) {
            client.emit('usermod-fail', 'Cannot Kick User On DM Channel Error in onKickUser');
            return;
        }
        const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
        if (!targetUser) {
            client.emit('usermod-fail', 'Unexist Target User Error in onKickUser');
            return;
        }
        const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
        if (!targetBridge) {
            client.emit('usermod-fail', 'Unexist Bridge Error in onKickUser');
            return;
        }
        if (targetBridge.user_type === user_type_enum_1.UserType.OWNER) {
            client.emit('usermod-fail', 'Cannot Kick Owner Error in onKickUser');
            return;
        }
        if (user.user_id === targetUser.user_id) {
            client.emit('usermod-fail', 'Cannot Set Yourself Error in onKickUser');
            return;
        }
        const targetUserSocket = this.userIdToSocket(targetUser.user_id);
        if (!targetUserSocket) {
            client.emit('usermod-fail', 'Unidentified Target User Socket Error in onKickUser');
            return;
        }
        await this.chatService.deleteUCBridge(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
        targetUserSocket.leave(channel.channel_name);
        client.emit('usermod-success', channel.channel_id);
        targetUserSocket.emit('got-kicked', channel.channel_id);
        this.server.to(channel.channel_name).emit("kick", { user_id: targetUser.user_id, user_nickname: targetUser.nickname });
    }
    async onBanUser(client, updateUserInfoDto) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('usermod-fail', 'Unidentified User Error in onBanUser');
            return;
        }
        const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
        if (!userBridge) {
            client.emit('usermod-fail', 'Unexist Bridge Error in onBanUser');
            return;
        }
        if (userBridge.user_type !== user_type_enum_1.UserType.OWNER && userBridge.user_type !== user_type_enum_1.UserType.ADMIN) {
            client.emit('usermod-fail', 'Member Cannot Ban Others Error in onBanUser');
            return;
        }
        const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
        if (!channel) {
            client.emit('usermod-fail', 'Unexist Channel Error in onBanUser');
            return;
        }
        if (channel.channel_type === channel_type_enum_1.ChannelType.DM) {
            client.emit('usermod-fail', 'Cannot Ban User On DM Channel Error in onBanUser');
            return;
        }
        const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
        if (!targetUser) {
            client.emit('usermod-fail', 'Unexist Target User Error in onBanUser');
            return;
        }
        if (user.user_id === targetUser.user_id) {
            client.emit('usermod-fail', 'Cannot Set Yourself Error in onBanUser');
            return;
        }
        const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
        if (!targetBridge) {
            client.emit('usermod-fail', 'Unexist Bridge Error in onBanUser');
            return;
        }
        if (targetBridge.user_type === user_type_enum_1.UserType.OWNER) {
            client.emit('usermod-fail', 'Cannot Ban Owner Error in onBanUser');
            return;
        }
        if (targetBridge.is_banned) {
            client.emit('usermod-fail', 'Target User Already Banned Error in onBanUser');
            return;
        }
        const targetUserSocket = this.userIdToSocket(targetUser.user_id);
        if (!targetUserSocket) {
            client.emit('usermod-fail', 'Unidentified Target User Socket Error in onBanUser');
            return;
        }
        await this.chatService.updateBanStatus(targetBridge, true);
        targetUserSocket.leave(channel.channel_name);
        client.emit('usermod-success', channel.channel_id);
        targetUserSocket.emit('got-banned', channel.channel_id);
        this.server.to(channel.channel_name).emit("ban", { user_id: targetUser.user_id, user_nickname: targetUser.nickname });
    }
    async OnMuteUser(client, updateUserInfoDto) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('usermod-fail', 'Unidentified User Error in onMuteUser');
            return;
        }
        const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
        if (!userBridge) {
            client.emit('onmute-fail', 'Unexist Bridge Error in onMuteUser');
            return;
        }
        if (userBridge.user_type !== user_type_enum_1.UserType.OWNER && userBridge.user_type !== user_type_enum_1.UserType.ADMIN) {
            client.emit('onmute-fail', 'Member Cannot Mute Others Error in onMuteUser');
            return;
        }
        const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
        if (!channel) {
            client.emit('usermod-fail', 'Unexist Channel Error in onMuteUser');
            return;
        }
        if (channel.channel_type === channel_type_enum_1.ChannelType.DM) {
            client.emit('usermod-fail', 'Cannot Mute User On DM Channel Error in onMuteUser');
            return;
        }
        const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
        if (!targetUser) {
            client.emit('usermod-fail', 'Unexist Target User Error in onMuteUser');
            return;
        }
        if (user.user_id === targetUser.user_id) {
            client.emit('usermod-fail', 'Cannot Set Yourself Error in onMuteUser');
            return;
        }
        const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
        if (!targetBridge) {
            client.emit('usermod-fail', 'Unexist Bridge Error in onMuteUser');
            return;
        }
        if (targetBridge.user_type === user_type_enum_1.UserType.OWNER) {
            client.emit('usermod-fail', 'Cannot Mute Owner Error in onMuteUser');
            return;
        }
        if (targetBridge.is_muted) {
            client.emit('usermod-fail', 'Target User Already Muted Error in onMuteUser');
            return;
        }
        const targetUserSocket = this.userIdToSocket(targetUser.user_id);
        if (!targetUserSocket) {
            client.emit('usermod-fail', 'Unidentified Target User Socket Error in onMuteUser');
            return;
        }
        await this.chatService.updateMuteStatus(targetBridge, true);
        client.emit('usermod-success', channel.channel_id);
        targetUserSocket.emit('got-mutted', channel.channel_id);
        this.server.to(channel.channel_name).emit("mute", { user_id: targetUser.user_id, user_nickname: targetUser.nickname });
        setTimeout(() => {
            this.unmuteUser(user, channel, targetUser, targetBridge);
        }, 10 * 1000);
    }
    async unmuteUser(user, channel, targetUser, targetBridge) {
        await this.chatService.updateMuteStatus(targetBridge, false);
        this.server.to(channel.channel_name).emit("unmute", { user_id: targetUser.user_id, user_nickname: targetUser.nickname });
    }
    async onInviteGame(client, inviteGameDto) {
        const user = await this.socketToUser(client);
        if (!user) {
            client.emit('invite-game-fail', 'Unidentified User Error in onInviteGame');
            return;
        }
        const targetUser = await this.userService.getProfileByUserId(inviteGameDto.targetUserId);
        if (!targetUser) {
            client.emit('invite-game-fail', 'Unidentified Target User Error in onInviteGame');
            return;
        }
        if (targetUser.status === user_status_enum_1.UserStatus.PLAYING) {
            client.emit('invite-game-fail', 'Target User PLAYING Error in onInviteGame');
            return;
        }
        if (targetUser.status === user_status_enum_1.UserStatus.OFFLINE) {
            client.emit('invite-game-fail', 'Target User OFFLINE Error in onInviteGame');
            return;
        }
        if (user.user_id === targetUser.user_id) {
            client.emit('usermod-fail', 'Cannot invite Yourself Error in onInviteGame');
            return;
        }
        const targetUserSocket = this.userIdToSocket(targetUser.user_id);
        if (!targetUserSocket) {
            client.emit('invite-game-fail', 'Unidentified Target User Socket Error in onInviteGame');
            return;
        }
        client.emit('invite-game-success', { user_id: targetUser.user_id, user_nickname: targetUser.nickname });
        targetUserSocket.emit('got-invited', { user_id: user.user_id, user_nickname: user.nickname, gameMode: inviteGameDto.gameMode });
    }
    async onGameStatusUpdate(playerId) {
        this.emitUserStatus(playerId);
    }
    async emitUserStatus(userId) {
        let listOfWhoFriendedMe = [];
        listOfWhoFriendedMe = await this.relationServie.getEveryoneWhoFriendedMe(userId);
        const currentStatus = await this.userService.getCurrentUserStatusByUserId(userId);
        for (const who of listOfWhoFriendedMe) {
            const whoFriendedMeSocket = this.userIdToSocket(who.userId);
            if (whoFriendedMeSocket) {
                whoFriendedMeSocket.emit('refreshStatus');
            }
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('create-group-channel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        channel_dto_1.GroupChannelDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onCreateGroupChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('enter-dm-channel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        channel_dto_1.DmChannelDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onEnterDmChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-group-channel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        channel_dto_1.JoinGroupChannelDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onJoinGroupChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('post-group-message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        message_dto_1.GroupMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onPostGroupMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-channel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onLeaveChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('close-channel-window'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onCloseChannelWindow", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('set-admin'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        update_dto_1.UpdateUserInfoDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onSetAdmin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('set-password'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        update_dto_1.UpdatePasswordDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onSetPassword", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remove-password'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onRemovePassword", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('kick-user'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        update_dto_1.UpdateUserInfoDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onKickUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ban-User'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        update_dto_1.UpdateUserInfoDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onBanUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('onMuteUser'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        update_dto_1.UpdateUserInfoDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "OnMuteUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('invite-game'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        game_dto_1.InviteGameDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onInviteGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('gameStatusUpdate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onGameStatusUpdate", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: "/chat",
        cors: {
            origin: `${serverConfig.get('server.url')}:${serverConfig.get('server.front_port')}`,
            credentials: true,
            allowedHeaders: 'Content-Type, Authorization, Cookie',
            methods: ["GET", "POST"],
        }
    }),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService,
        relation_service_1.RelationService,
        chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map