import { DataSource, Repository } from "typeorm";
import { Channel } from "../entity/channel.entity";
import { GroupChannelDto } from "../dto/channel-dto";
export declare class ChannelRepository extends Repository<Channel> {
    constructor(dataSource: DataSource);
    createGroupChannel(groupChannelDto: GroupChannelDto): Promise<Channel>;
    createDmChannel(senderId: number, receiverId: number): Promise<Channel>;
    createPrivateChannel(channelName: string): Promise<Channel>;
    getChannelByName(channelName: string): Promise<Channel>;
    getChannelById(channelId: number): Promise<Channel>;
    getDmRoomByName(channelName: string): Promise<Channel>;
    deleteChannelByChannelId(channelId: number): Promise<void>;
    setPassword(channel: Channel, newPassword: string): Promise<void>;
    unsetPassword(channel: Channel): Promise<void>;
}
