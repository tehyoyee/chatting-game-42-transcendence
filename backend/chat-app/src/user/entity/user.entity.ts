import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { UserStatus } from "../enum/user-status.enum";
import { UserAchievement } from "../enum/user-achievements.enum";
import { UserChannelBridge } from "src/chat/entity/user-channel-bridge.entity";
import { Message } from "src/chat/entity/message.entity";
import { Relation } from "src/relation/entity/relation.entity";

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

    @Column({ default: '' })
    auth_code: string;
    
    //아래는 관계표현
    @OneToMany(type => UserChannelBridge, join_channels => join_channels.user, { eager: false })
    join_channels: UserChannelBridge[];
    
    @OneToMany(type => Message, messages => messages.user, { eager: false })
    messages: Message[];

    @OneToMany(type => Relation, senders => senders.sender, {eager: true})
    senders: Relation[];
    
    //게임기록 추가 필요
}
