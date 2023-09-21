import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "src/user/entity/user.entity";

@Entity()
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn()
    message_id: number;
    
    @Column()
    content: string;

    @CreateDateColumn()
    created_at: Date;
    
    @Column({ name: 'user_id' })
    user_id: number;
    
    @Column({ name: 'channel_id' })
    channel_id: number;
    
    @ManyToOne(type => Channel, channel => channel.messages)
    @JoinColumn({ name: 'channel_id' })
    channel: Channel;
    
    @ManyToOne(type => User, user => user.messages)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
