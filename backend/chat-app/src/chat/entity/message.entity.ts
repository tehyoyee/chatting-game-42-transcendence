import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "src/user/entity/user.entity";

@Entity()
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn()
    message_id: number;
    
    @ManyToOne(type => Channel, channel => channel.messages, { eager: true })
    @JoinColumn()
    channel: Channel;
    
    @ManyToOne(type => User, user => user.messages, { eager: true })
    @JoinColumn()
    user: User;
    
    @Column()
    content: string;
}
