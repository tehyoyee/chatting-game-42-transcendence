import { Injectable } from '@nestjs/common';
import { Channel } from './entity/channel.entity';
import { User } from 'src/user/entity/user.entity';
import { ChannelRepository } from './channel.repository';
import { MessageRepository } from './message.repository';
import { ChatGateway } from './chat.gateway';
import { ChannelDto } from './dto/channel-dto';
import { UcbRepository } from './ucb.repository';
import { UserType } from './enum/user_type.enum';

@Injectable()
export class ChatService {
    constructor( private channelRepository: ChannelRepository,
        private messageRepository: MessageRepository,
        private ucbRepository: UcbRepository,
        private chatGateway: ChatGateway) {}
    

    async createChannel(channelDto: ChannelDto, channelMembers: User[]): Promise<Channel> {
        const newChannel =  await this.channelRepository.createChannel(channelDto, channelMembers);
    
        for (let user of channelMembers)
            await this.ucbRepository.createUCBridge(user.user_id, newChannel.channel_id, newChannel, user);

        return newChannel;
    }

    async addMember(user: User, channel: Channel ,type: UserType): Promise<void> {
        const found = await this.ucbRepository.getUcbByIds(user.user_id, channel.channel_id);
        if (!found)
        {
            
        }
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
