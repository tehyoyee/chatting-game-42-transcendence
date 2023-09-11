import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { UserStatus } from "../enum/user-status.enum";
import { UserAchievement } from "../enum/user-achievements.enum";
import { Message } from "src/chat/entity/message.entity";
import { Channel } from "src/chat/entity/channel.entity";
import { UserChannelBridge } from "src/chat/entity/user-channel-bridge.entity";

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    user_id: number;
    
    @Column({ default: false })
    two_factor: boolean;
    
    @Column()
    username: string;
    
    @Column()
    nickname: string;

    @Column()
    email: string;

    @Column({ default: UserStatus.OFFLINE })
    status: UserStatus;
    
    @Column({ default: 'default_image' }) 
    avatar: string;
    
    @Column({ default: 0 })
    win_count: number;
    
    @Column({ default: 0 })
    lose_count: number;
    
    @Column({ default: 1000 })
    point: number;

    @Column({ default: UserAchievement.A0 })
    achievement: UserAchievement;

    //아래는 관계표현
    @OneToMany(type => UserChannelBridge, join_channels => join_channels.user, { eager: false })
    join_channels: UserChannelBridge[];
    
    @OneToMany(type => Message, messages => messages.user, { eager: false })
    messages: Message[];


    //친구, 차단, 게임기록, 조인채널목록 추가 필요
}