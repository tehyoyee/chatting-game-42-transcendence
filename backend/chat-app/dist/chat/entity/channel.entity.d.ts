import { BaseEntity } from "typeorm";
import { ChannelType } from "../enum/channel_type.enum";
import { Message } from "./message.entity";
import { UserChannelBridge } from "./user-channel-bridge.entity";
export declare class Channel extends BaseEntity {
    channel_id: number;
    channel_name: string;
    channel_type: ChannelType;
    salt: string;
    channel_pwd: string;
    details: UserChannelBridge[];
    messages: Message[];
}
