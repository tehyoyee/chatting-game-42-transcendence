import { Injectable } from '@nestjs/common';
import { Channel } from './entity/channel.entity';
import { User } from 'src/user/entity/user.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChannelRepository } from './channel.repository';

@Injectable()
export class ChatService {
    constructor(private channelRepository: ChannelRepository) { }
    

    async createChannel(user: User, createChannelDto: CreateChannelDto): Promise<Channel> {
        return this.channelRepository.createChannel(user, createChannelDto);
    }

    async getChannelByName(name: string): Promise<Channel> {
        return 
    }

    async getChannelById(id: number): Promise<Channel> {
        return 
    }

}
