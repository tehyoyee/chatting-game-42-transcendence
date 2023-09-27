import { BaseEntity } from "typeorm";
import { UserStatus } from "../enum/user-status.enum";
import { UserAchievement } from "../enum/user-achievements.enum";
import { UserChannelBridge } from "src/chat/entity/user-channel-bridge.entity";
import { Message } from "src/chat/entity/message.entity";
import { Relation } from "src/relation/entity/relation.entity";
import { GameHistory } from "src/game/game.history.entity";
export declare class User extends BaseEntity {
    user_id: number;
    two_factor: boolean;
    username: string;
    nickname: string;
    email: string;
    status: UserStatus;
    avatar: string;
    win_count: number;
    lose_count: number;
    point: number;
    achievement: UserAchievement;
    auth_code: string;
    join_channels: UserChannelBridge[];
    messages: Message[];
    senders: Relation[];
    gameHistories: GameHistory[];
}
