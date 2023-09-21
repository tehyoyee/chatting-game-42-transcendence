import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { RelationType } from "../enum/relation-type.enum";

@Entity()
export class Relation extends BaseEntity {
    @PrimaryGeneratedColumn()
    relation_id: number;

    @Column()
    ralation_type: RelationType;
    
    @Column({ name: 'sender_id' })
    sender_id: number;

    @Column()
    receiver_id: number;

    // 아래는 관계표현
    @ManyToOne(typa => User, sender => sender.senders)
    @JoinColumn({ name: 'sender_id'})
    sender: User;
}
