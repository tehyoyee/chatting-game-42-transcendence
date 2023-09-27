import { BaseEntity } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "src/user/entity/user.entity";
export declare class Message extends BaseEntity {
    message_id: number;
    content: string;
    created_at: Date;
    user_id: number;
    channel_id: number;
    channel: Channel;
    user: User;
}
