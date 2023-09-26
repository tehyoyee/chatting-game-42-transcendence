import { User } from "src/user/entity/user.entity";
import { BaseEntity } from "typeorm";
import { RelationType } from "../enum/relation-type.enum";
export declare class Relation extends BaseEntity {
    relation_id: number;
    relation_type: RelationType;
    sender_id: number;
    receiver_id: number;
    sender: User;
}
