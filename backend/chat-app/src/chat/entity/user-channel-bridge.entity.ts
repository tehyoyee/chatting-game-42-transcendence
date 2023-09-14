import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserType } from "../enum/user_type.enum";
import { User } from "src/user/entity/user.entity";
import { Channel } from "./channel.entity";

@Entity()
export class UserChannelBridge extends BaseEntity {
    @PrimaryColumn()
    user_id: number;

    @PrimaryColumn()
    channel_id: number;
    
    @Column()
    user_type: UserType;

    @Column({ default: false })
    is_banned: boolean;
    
    @Column({ default: false })
    is_muted: boolean;

    //아래는 관계 표현
    @ManyToOne(type => User, user => user.join_channels, { eager: false })
    user: User;
    
    @ManyToOne(type => Channel, channel => channel.details, { eager: true })
    channel: Channel;
    
}