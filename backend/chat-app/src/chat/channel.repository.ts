import { Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Channel } from "./entity/channel.entity";
import { User } from "src/user/entity/user.entity";
import * as bcrypt from 'bcrypt';
import { UserType } from "./enum/user_type.enum";
import { ChannelDto, GroupChannelDto } from "./dto/channel-dto";
import { ChannelType } from "./enum/channel_type.enum";

@Injectable()
export class ChannelRepository extends Repository<Channel> {
    constructor(dataSource: DataSource) {
        super(Channel, dataSource.createEntityManager())
    }

    async createChannel(channelDto: ChannelDto, channelMembers: User[]): Promise<Channel> {
        const {name, type, password} = channelDto;

        //type.toUpperCase();
        const newChannel = new Channel();
        newChannel.channel_name = name;
        newChannel.is_channel = true;

        if (type === ChannelType.PROTECTED)
        {
            newChannel.is_public = false;
            newChannel.salt = await bcrypt.genSalt();
            newChannel.channel_pwd = await bcrypt.hash(password, newChannel.salt);
        }

        await newChannel.save();

        return await newChannel;
    }

    async createGroupChannel(groupChannelDto: GroupChannelDto): Promise<Channel> {
        const {channelName, channelType, password} = groupChannelDto;

        const newChannel = new Channel();
        newChannel.channel_name = channelName;
        newChannel.channel_type = channelType;
        if (channelType === ChannelType.PROTECTED && password) {
            newChannel.salt = await bcrypt.genSalt();
            newChannel.channel_pwd = await bcrypt.hash(password, newChannel.salt);
        }
        await newChannel.save();

        return newChannel;
    }
    
    async createDmChannel(senderId: number, receiverId: number): Promise<Channel> {
        const newRoom = new Channel();

        newRoom.channel_name = "[DM]" + senderId + "&" + receiverId;
        newRoom.is_channel = false;
        newRoom.is_public = false;
        newRoom.salt = '';
        newRoom.channel_pwd = '';

        await newRoom.save();

        return newRoom;
    }

    async createPrivateChannel(channelName: string): Promise<Channel> {
        const newChannel = new Channel();

        newChannel.channel_name = channelName;
        newChannel.channel_type = ChannelType.PRIVATE;
        // newChannel.is_channel = false;
        // newChannel.is_public = false;
        newChannel.salt = '';
        newChannel.channel_pwd = '';

        await newChannel.save();
    
        return newChannel;
    }


    async getChannelByName(channelName: string): Promise<Channel> {
        const found = await this.findOne({
            where: {channel_name: channelName},
        });

        return found;
    }

    async getChannelById(channelId: number): Promise<Channel> {
        const found = await this.findOne({
            where: {channel_id: channelId},
        });

        return found;
    }

    async getDMRoomByName(name: string, isChannel: boolean): Promise<Channel> {
        const found = await this.findOne({
            where: {channel_name: name,
                is_channel: isChannel}
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