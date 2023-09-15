import { Injectable } from '@nestjs/common';
import { Channel } from './entity/channel.entity';
import { User } from 'src/user/entity/user.entity';
import { ChannelRepository } from './channel.repository';
import { MessageRepository } from './message.repository';
import { ChatGateway } from './chat.gateway';
import { ChannelDto } from './dto/channel-dto';
import { UcbRepository } from './ucb.repository';
import { UserType } from './enum/user_type.enum';
import { memberDto } from './dto/member-dto';
import { UserService } from 'src/user/user.service';
import { UserChannelBridge } from './entity/user-channel-bridge.entity';

@Injectable()
export class ChatService {
    constructor( private channelRepository: ChannelRepository,
        private messageRepository: MessageRepository,
        private ucbRepository: UcbRepository,
        private userService: UserService,
        private chatGateway: ChatGateway) {}
    

    async createChannel(channelDto: ChannelDto, channelMembers: User[]): Promise<Channel> {
        const newChannel =  await this.channelRepository.createChannel(channelDto, channelMembers);
    
        for (let user of channelMembers)
            await this.ucbRepository.createUCBridge(user.user_id, newChannel.channel_id, newChannel, user);

        return newChannel;
    }

    async addMember(user: User, channel: Channel, type: UserType): Promise<void> {
        const found = await this.ucbRepository.getUcbByIds(user.user_id, channel.channel_id);
        if (!found)
        {
            await this.ucbRepository.addMember(user, channel, type, found);
        }
    }

    async getMembersByChannelId(channelId: number, userId: number): Promise<memberDto[]> {
        let membersObject: memberDto[] = [];

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
