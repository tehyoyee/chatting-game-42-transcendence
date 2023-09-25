import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Channel } from './entity/channel.entity';
import { User } from 'src/user/entity/user.entity';
import { ChannelRepository } from './channel.repository';
import { MessageRepository } from './message.repository';
import { ChatGateway } from './chat.gateway';
import { UcbRepository } from './ucb.repository';
import { UserType } from './enum/user_type.enum';
import { UserService } from 'src/user/user.service';
import { UserChannelBridge } from './entity/user-channel-bridge.entity';
import { AuthService } from 'src/auth/auth.service';
import { Message } from './entity/message.entity';
import * as bcrypt from 'bcrypt';
import { JoinGroupChannelDto, GroupChannelDto } from './dto/channel-dto';
import { ChannelType } from './enum/channel_type.enum';
import { DmDto, GroupMessageDto, PreviousMessageDto } from './dto/message-dto';
import { UpdatePasswordDto } from './dto/update-dto';
import { BridgeDto } from './dto/bridge-dto';
import { RelationService } from 'src/relation/relation.service';

@Injectable()
export class ChatService {
    constructor( private channelRepository: ChannelRepository,
        private messageRepository: MessageRepository,
        private ucbRepository: UcbRepository,
        private userService: UserService,
        private relationService: RelationService,
        private authService: AuthService) {}

    async createGroupChannelAndBridge(user: User, groupChannelDto: GroupChannelDto): Promise<Channel> {
        const newChannel = await this.channelRepository.createGroupChannel(groupChannelDto);
        await this.createUCBridge(user, newChannel, UserType.OWNER);
        
        return newChannel;
    }

    async createDmChannelAndBridges(sender: User, senderId: number, receiverId: number): Promise<Channel> {
        const newChannel = await this.channelRepository.createDmChannel(senderId, receiverId);
        const receiver = await this.userService.getProfileByUserId(receiverId);
        
        await this.createUCBridge(sender, newChannel, UserType.MEMBER);
        await this.createUCBridge(receiver, newChannel, UserType.MEMBER);
        
        return newChannel;
    }

    async createPrivateChannelAndBridge(user: User, user_id: number, channelName: string): Promise<Channel> {
        const newChannel = await this.channelRepository.createPrivateChannel(channelName);
        await this.createUCBridge(user, newChannel, UserType.OWNER);

        return newChannel;
    }

    async createUCBridge(user: User, channel: Channel, userType: UserType) {
        await this.ucbRepository.createUCBridge(user, channel, userType);
    }

    async getAllGroupChannelsByChannelType(channelType: ChannelType): Promise<Channel[]> {
        let channels: Channel[] = [];
        
        const channel = await this.channelRepository
        .createQueryBuilder('c')
        .select(['c.channel_id', 'c.channel_name', 'c.channel_type'])
        .where('c.channel_type = :channelType', {channelType})
        .orderBy('c.channel_id');

        channels = await channel.getMany();

        return channels;
    }

    async getJoinedGroupChannelsByUserId(userId: number) {
        const isBanned = false;
        const channelIds = await this.ucbRepository
        .createQueryBuilder('b')
        .where('b.user_id = :userId', {userId})
        .andWhere('b.is_banned = :isBanned', {isBanned})
        .select(['b.channel_id'])
        .getMany();

        let joinedChannels = [];
        for (let c of channelIds) {
            let tmp = await this.channelRepository.getChannelById(c.channel_id);
            if (tmp.channel_type === ChannelType.PUBLIC || tmp.channel_type === ChannelType.PROTECTED) {
                joinedChannels.push(tmp);
            }
        }

        return joinedChannels;
    }

    async getJoinedDmChannelsByUserId(userId: number) {
        const channels = await this.ucbRepository
        .createQueryBuilder('b')
        .where('b.user_id = :userId', {userId})
        .select(['b.channel_id'])
        .getMany();

        let joinedChannels = [];
        for (let c of channels) {
            let tmp = await this.channelRepository.getChannelById(c.channel_id);
            if (tmp.channel_type === ChannelType.DM) {
                joinedChannels.push(tmp);
            }
        }

        return joinedChannels;
    }

    async getPrivateChannelByUserId(userId: number): Promise<Channel> {
        const user = await this.userService.getProfileByUserId(userId);
        if (!user) {
            //exception handler
            throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
        }
            
        const channelName = 'user' + user.user_id.toString();
        const channel = await this.getChannelByName(channelName);

        return channel;
    }

    async createGroupMessage(sender: User, channel: Channel, content: string): Promise<Message> {
        return await this.messageRepository.createGroupMessage(sender, channel, content);
    }

    async createDM(sender:User, channel: Channel, content: string): Promise<Message> {
        return await this.messageRepository.createDM(sender, channel, content);
    }

    async getAllMessagesExceptBlockByChannelId(userId: number, channelId: number): Promise<PreviousMessageDto[]> {
        let previousMessages: PreviousMessageDto[] = [];

        const rows = await this.messageRepository
        .createQueryBuilder('m')
        .where('m.channel_id = :channelId', {channelId})
        .select(['m.user_id', 'm.content'])
        .orderBy('m.created_at', 'ASC')
        .limit(10)
        .getMany();

        for (let r of rows) {
            let message = { writerId: r.user_id,
                            content: r.content};
            
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

    async deleteUCBridge(userId: number, channelId: number) {
        return await this.ucbRepository.deleteUCBridge(userId, channelId, );
    }

    //  방에 밴된유저만 남아있을경우 빈채널로 보고 삭제
    async deleteChannelIfEmpty(channelId: number) {
        const channels = await this.ucbRepository
        .createQueryBuilder('b')
        .where('b.channel_id = :channelId', {channelId})
        .select(['b.channel_id', 'b.user_id', 'b.is_banned'])
        .getMany();

        if (channels.length === 0) {
            await this.channelRepository.deleteChannelByChannelId(channelId);
            return ;
        }
        for (let c of channels) {
            if (!c.is_banned) {
                return ;
            }
        }

        let bannedUsersId: number[] = [];
        for (let c of channels) {
            bannedUsersId.push(c.user_id);
        }
        for (let bId of bannedUsersId) {
            this.deleteUCBridge(bId, channelId);
        }
        this.channelRepository.deleteChannelByChannelId(channelId);
    }

    async deleteDmChannel(channelId: number) {
        return await this.channelRepository.deleteChannelByChannelId(channelId);
    }

    async updateUserTypeOfUCBridge(targetUserId: number, channelId: number, newType: UserType) {
       await this.ucbRepository.updateUserTypeOfUCBridge(targetUserId, channelId, newType);
    }

    async checkChannelPassword(channel: Channel, inputPwd: string): Promise<boolean> {
        if (await bcrypt.compare(inputPwd, channel.channel_pwd))
            return true;

        return false;
    }

    async checkDmRoomExists(senderId: number, receiverId: number): Promise<Channel> {
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
    
    async isOwnerOfChannel(userId: number, channelId: number) {
        const found = await this.ucbRepository.getUcbByIds(userId, channelId);
        if (!found)
            throw new NotFoundException(`user ${userId} not found in channel ${channelId}`);

        if (found.user_type === UserType.OWNER)
            return true;
        return null;
    }

    async isAdminOfChannel(userId: number, channelId: number) {
        const found = await this.ucbRepository.getUcbByIds(userId, channelId);
        if (!found)
            throw new NotFoundException(`user ${userId} not found in channel ${channelId}`);

        if (found.user_type === UserType.ADMIN)
            return true;
        return null;
    }

    async checkUserInThisChannel(userId: number, channelId: number): Promise<UserChannelBridge> {
        return await this.ucbRepository.getUcbByIds(userId, channelId);
    }

    async updatePassword(channel: Channel, newPassword: string) {
        await this.channelRepository.setPassword(channel, newPassword);
    }

    async removePassword(channel: Channel) {
        await this.channelRepository.unsetPassword(channel);
    }

    async updateBanStatus(bridge: UserChannelBridge, newBanStatus: boolean): Promise<UserChannelBridge> {
        return await this.ucbRepository.updateBanStatus(bridge, newBanStatus);
    }

    async updateMuteStatus(bridge: UserChannelBridge, newMuteStatus: boolean): Promise<UserChannelBridge> {
        return await this.ucbRepository.updateMuteStatus(bridge, newMuteStatus);
    }

    async getChannelByName(channelName: string): Promise<Channel> {
        return await this.channelRepository.getChannelByName(channelName);
    }

    async getChannelById(id: number): Promise<Channel> {
        return await this.channelRepository.getChannelById(id);
    }

    async getAllUsersInChannelByChannelId(newUserId: number, channelId: number):Promise<BridgeDto[]>{
        let inners: BridgeDto[] = [];
        const isBanned = false;

        const bridges = await this.ucbRepository
        .createQueryBuilder('b')
        .where('b.channel_id = :channelId', {channelId})
        .andWhere('b.is_banned = :isBanned', {isBanned})
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

    getReceiverIdByDmChannelName(senderId: number, channelName: string): number {
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
}
