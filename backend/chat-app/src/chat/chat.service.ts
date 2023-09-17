import { Injectable, NotFoundException } from '@nestjs/common';
import { Channel } from './entity/channel.entity';
import { User } from 'src/user/entity/user.entity';
import { ChannelRepository } from './channel.repository';
import { MessageRepository } from './message.repository';
import { ChatGateway } from './chat.gateway';
import { ChannelDto } from './dto/channel-dto';
import { UcbRepository } from './ucb.repository';
import { UserType } from './enum/user_type.enum';
import { MemberDto } from './dto/member-dto';
import { UserService } from 'src/user/user.service';
import { UserChannelBridge } from './entity/user-channel-bridge.entity';
import { AuthService } from 'src/auth/auth.service';
import { MessageDto } from './dto/message-dto';
import { Message } from './entity/message.entity';
import * as bcrypt from 'bcrypt';
import { channel } from 'diagnostics_channel';
import { DmDto } from './dto/dm-dto';
import { JoinChannelDto } from './dto/join-channel-dto';

@Injectable()
export class ChatService {
    constructor( private channelRepository: ChannelRepository,
        private messageRepository: MessageRepository,
        private ucbRepository: UcbRepository,
        private userService: UserService,
        private authService: AuthService) {}
    

    async createChannel(channelDto: ChannelDto, channelMembers: User[]): Promise<Channel> {
        const newChannel =  await this.channelRepository.createChannel(channelDto, channelMembers);
    
        for (let user of channelMembers)
            await this.createUCBridge(user.user_id, newChannel.channel_id, newChannel, user);

        return newChannel;
    }

    async createUCBridge(userId: number, channelId: number, channel: Channel, user: User) {
        await this.ucbRepository.createUCBridge(userId, channelId, channel, user);
    }

    async addMember(user: User, channel: Channel, type: UserType): Promise<void> {
        const found = await this.ucbRepository.getUcbByIds(user.user_id, channel.channel_id);
        if (!found)
        {
            await this.ucbRepository.addMember(user, channel, type, found);
        }
    }

    async getMembersByChannelId(channelId: number, userId: number): Promise<MemberDto[]> {
        let membersObject: MemberDto[] = [];

        if (await this.ucbRepository.getUcbByIds(userId, channelId)) {
            const usersId = await this.ucbRepository
            .createQueryBuilder('m')
            .where('m.channel_id = :channelId', {channelId})
            .select(['m.user_id', 'm.user_type'])
            .getMany();

            const members: User[] = [];
            for (let id of usersId) {
                let memberObject = {
                    member: await this.userService.getProfileByUserId(id.user_id),
                    type: id.user_type,
                    is_banned: id.is_banned,
                    is_muted: id.is_muted
                }
                membersObject.push(memberObject);
            }
        }
        return membersObject; 
    }

    async getRoomsForUser(userId: number): Promise<Channel[]> {
        const is_banned = false;
        const roomsId = await this.ucbRepository
        .createQueryBuilder('m')
        .where('m.user_id = :userId', {userId})
        .andWhere('m.is_banned = :is_banned', {is_banned})
        .select(['m.channel_id'])
        .getMany();

        let rooms = [];

        for (let id of roomsId) {
            rooms.push(await this.channelRepository.getChatRoomById(id.channel_id));
        }  
        
        return rooms;
    }

    async getAllRooms(userId: number): Promise<Channel[]> {
        const rooms = await this.channelRepository
        .createQueryBuilder('r')
        .select(['r.channel_id', 'r.channel_name', 'r.is_public', 'r.is_channel'])
        .getMany();

        let i = 0;
        while (i < rooms.length) {
            if ((rooms[i].is_public === false && await this.isMember(rooms[i].channel_id, userId)) || 
            (rooms[i].is_public === true && await this.isBanned(rooms[i].channel_id, userId))) {
                rooms.splice(i, 1);
            }
            else
                i++;
        }
        return rooms;
    }

    async isMember(channelId: number, userId: number): Promise<UserChannelBridge> {
        return await this.ucbRepository.getUcbByIds(userId, channelId);
    }

    async isBanned(channelId: number, userId: number): Promise<boolean> {
        const membership = await this.ucbRepository.getUcbByIds(userId, channelId);

        if (membership && membership.is_banned === true)
            return true;
        return false;
    }

    async createMessage(messageDto: MessageDto, sender: User): Promise<Message> {
        const {channel_id, content} = messageDto;
        
        const newMessage = new Message();
        newMessage.content = content;
        newMessage.user = sender;
        newMessage.channel = await this.channelRepository.getChannelById(channel_id);
        await newMessage.save();
        
        return newMessage;
    }

    async getMessagesByChannelId(channelId: number, userId: number): Promise<Message[]> {
        let messages: Message[] = [];
        if (await this.isMember(channelId, userId)) {
            const query = await this.messageRepository.createQueryBuilder('m')
            .select(['m.content', 'm.user_id', 'm.channel_id'])
            .where('m.channel_id = :channelId', {channelId})
            .orderBy('m.created_at');

            messages = await query.getMany();

            //block 유저의 메세지 지우는 부분 필요
        }
    
        return messages;
    }

    async deleteUCBridge(channelId: number, userId: number) {
        return await this.ucbRepository.deleteUCBridge(channelId, userId);
    }

    async updateUserTypeOfUCBridge(userId: number, channelId: number, newType: UserType) {
       await this.ucbRepository.updateUserTypeOfUCBridge(userId, channelId, newType);
    }


    async checkChannelPassword(channel: Channel, inputPwd: string): Promise<boolean> {
        const hashed = await bcrypt.hash(inputPwd, channel.salt);
        
        if (channel.channel_pwd === hashed)
            return true;
        return false;
    }

    async checkDMRoomExists(senderId: number, receiverId: number): Promise<Channel> {
        let channelName = "[DM]" + senderId + "&" + receiverId;
        const found1 = await this.channelRepository.getDMRoomByName(channelName, false);
        if (found1)
            return found1;

        channelName = "[DM]" + receiverId + "&" + senderId;
        const found2 = await this.channelRepository.getDMRoomByName(channelName, false);
        if (found2)
            return found2;

        return null;
    }

    async createDMRoom(senderId: number, receiverId: number): Promise<Channel> {
        const newDMRoom = await this.channelRepository.createDMRoom(senderId, receiverId);

        const sender = await this.userService.getProfileByUserId(senderId);
        const receiver = await this.userService.getProfileByUserId(receiverId);

        await this.addMember(sender, newDMRoom, UserType.GENERAL);
        await this.addMember(receiver, newDMRoom, UserType.GENERAL);

        return newDMRoom;
    }

    async createDM(dmDto: DmDto, sender: User, channel_id: number): Promise<Message> {
        const {receiver_id, content} = dmDto;
        
        const newDM = new Message();
        newDM.content = content;
        newDM.user = sender;
        newDM.channel = await this.channelRepository.getChannelById(channel_id);
        await newDM.save();
        
        return newDM;
    }

    async getDMs(senderId: number, receiverId: number): Promise<Message[]> {
        let messages: Message[] = [];

        //sender가 receiver로부터 block되었는지 확인해야 함
        let channelName = "[DM]" + senderId + "&" + receiverId;
        let found = await this.getChannelByName(channelName);
        if (!found) {
            channelName = "[DM]" + receiverId + "&" + senderId;
            found = await this.getChannelByName(channelName);
        }

        messages = await this.getMessagesByChannelId(found.channel_id, senderId);

        return messages;
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

    async updatePassword(channelId: number, newPassword: string): Promise<Channel> {
        const channel = await this.getChannelById(channelId);

        channel.salt = await bcrypt.genSalt();
        channel.channel_pwd = await bcrypt.hash(newPassword, channel.salt);

        await channel.save();
        return channel;
    }

    async setPasswordToChannel(joinChannelDto: JoinChannelDto) {
        const {channel_id, password} = joinChannelDto;

        const channel = await this.channelRepository.getChannelById(channel_id);
        if (!channel)
            throw new NotFoundException(`channel ${channel_id} not found`);

        channel.is_public = false;
        channel.salt = await bcrypt.genSalt();
        channel.channel_pwd = await bcrypt.hash(password, channel.salt);

        await channel.save();
    }

    async updateBanStatus(userId: number, channelId: number, newBanStatus: boolean): Promise<UserChannelBridge> {
        const found = await this.ucbRepository.getUcbByIds(userId, channelId);
        if (!found) {
            throw new NotFoundException(`user ${userId} not found in channel ${channelId}`);
        }
        found.is_banned = newBanStatus;
        await found.save();

        return found;
    }

    async updateMuteStatus(userId: number, channelId: number, newMuteStatus: boolean): Promise<UserChannelBridge> {
        const found = await this.ucbRepository.getUcbByIds(userId, channelId);
        if (!found) {
            throw new NotFoundException(`user ${userId} not found in channel ${channelId}`);
        }
        found.is_banned = newMuteStatus;
        await found.save();

        return found;
    }


    async getChannelByName(name: string): Promise<Channel> {
        return await this.channelRepository.getChannelByName(name);
    }

    async getChannelById(id: number): Promise<Channel> {
        return await this.channelRepository.getChannelById(id);
    }

    async JoinChannelById(id: number, user: User) {
        return await this.channelRepository.JoinChannelById(id, user);

    }

}
