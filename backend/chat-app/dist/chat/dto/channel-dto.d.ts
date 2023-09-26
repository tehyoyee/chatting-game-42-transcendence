import { ChannelType } from "../enum/channel_type.enum";
export declare class GroupChannelDto {
    channelName: string;
    channelType: ChannelType;
    password?: string;
}
export declare class DmChannelDto {
    receiverId: number;
}
export declare class JoinGroupChannelDto {
    channelId: number;
    password: string;
}
