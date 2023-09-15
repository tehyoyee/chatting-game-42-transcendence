import { Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Channel } from "./entity/channel.entity";
import { User } from "src/user/entity/user.entity";
import * as bcrypt from 'bcrypt';
import { UserType } from "./enum/user_type.enum";
import { ChannelDto } from "./dto/channel-dto";

@Injectable()
export class ChannelRepository extends Repository<Channel> {
    constructor(dataSource: DataSource) {
        super(Channel, dataSource.createEntityManager())
    }

    // async createChannel(user: User, createChannelDto: CreateChannelDto): Promise<Channel> {
    //     const {name, type, password} = createChannelDto;

    //     const foundDuplicate = await this.getChannelByName(name);
    //     if (!foundDuplicate)
    //         throw new NotFoundException(`${name} 채널이 이미 존재합니다.`);
        
    //     const newChannel = await this.create({
    //         channel_name: name,
    //         channel_type: type,
    //         channel_pwd: password
    //     });
        
    //     this.fillDetails(newChannel, user, 'OWNER');
    //     await this.save(newChannel);
        
    //     return newChannel;
    // }

    async createChannel(channelDto: ChannelDto, channelMembers: User[]): Promise<Channel> {
        const {name, type, password} = channelDto;

        type.toUpperCase();
        const newChannel = new Channel();
        newChannel.channel_name = name;
        newChannel.is_channel = true;
        if (type === 'PRIVATE')
        {
            newChannel.is_public = false;
            newChannel.salt = await bcrypt.genSalt();
            newChannel.channel_pwd = await bcrypt.hash(password, newChannel.salt);
        }

        await newChannel.save();

        return await newChannel;
    }


    // private fillDetails(channel: Channel, user: User, user_type: string)
    // {
    //     channel.details.user_id = user.user_id;
    //     channel.details.channel_id = channel.channel_id;
    //     channel.details.user = user;
    //     channel.details.channel = channel;
        
    //     user_type.toUpperCase();
    //     switch (user_type) {
    //         case 'OWNER':
    //             channel.details.user_type = UserType.OWNER;
    //             break;
    //         case 'ADMIN':
    //             channel.details.user_type = UserType.ADMIN;
    //             break;
    //         case 'GENERAL':
    //             channel.details.user_type = UserType.GENERAL;
    //             break;    

    //         default:
    //             throw new NotAcceptableException('User type ' + user_type + ' is not acceptable.');
    //     }
    // }
    
    async getChannelByName(name: string): Promise<Channel> {
        const found = await this.findOne({
            where: {channel_name: name},
        });

        return found;
    }

    async getChannelById(id: number): Promise<Channel> {
        const found = await this.findOne({
            where: {channel_id: id},
        });

        return found;
    }

    async getChatRoomById(id: number): Promise<Channel> {
        const room = await this
        .createQueryBuilder('r')
        .where('r.channel_id = :id', {id})
        .select(['r.channel_id', 'r.channel_name', 'r.is_public', 'r.is_channel'])
        .getOne();

        return room;
    }

    async JoinChannelById(id: number, user: User) {
        const found = await this.getChannelById(id);
        if (!found)
            throw new NotFoundException(`channel ${id} does not exist.`);

        await this.findBy({
            channel_id: id,
            //details.user_id = user.user_id,
        });
        
        
        return 

    }
}