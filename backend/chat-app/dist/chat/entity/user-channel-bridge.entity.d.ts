import { BaseEntity } from "typeorm";
import { UserType } from "../enum/user_type.enum";
import { User } from "src/user/entity/user.entity";
import { Channel } from "./channel.entity";
export declare class UserChannelBridge extends BaseEntity {
    user_id: number;
    channel_id: number;
    user_type: UserType;
    is_banned: boolean;
    is_muted: boolean;
    user: User;
    channel: Channel;
}
