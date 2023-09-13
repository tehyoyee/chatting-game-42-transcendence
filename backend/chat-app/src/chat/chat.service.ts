import { Injectable } from '@nestjs/common';
import { Channel } from './entity/channel.entity';
import { User } from 'src/user/entity/user.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChannelRepository } from './channel.repository';
import { MessageRepository } from './message.repository';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
    constructor( private channelRepository: ChannelRepository,
        private messageRepository: MessageRepository,
        private chatGateway: ChatGateway) {}
    

    async createChannel(user: User, createChannelDto: CreateChannelDto): Promise<Channel> {
        const newChannel =  await this.channelRepository.createChannel(user, createChannelDto);
        
        this.chatGateway
        return newChannel;
        
    }

    async getChannelByName(name: string): Promise<Channel> {
        return await this.channelRepository.getChannelByName(name);
    }

    async getChannelById(id: number): Promise<Channel> {
        return await this.channelRepository.getChannelById(id);
    }

    async JoinChannelById(): Promise<Channel> {
        return
    }

}
