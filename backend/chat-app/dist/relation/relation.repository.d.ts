import { Relation } from "./entity/relation.entity";
import { DataSource, Repository } from "typeorm";
import { User } from "src/user/entity/user.entity";
import { RelationType } from "./enum/relation-type.enum";
export declare class RelationRepository extends Repository<Relation> {
    constructor(datasource: DataSource);
    addRelation(sender: User, receiverId: number, newRelationType: RelationType): Promise<Relation>;
    deleteRelation(relationId: number): Promise<void>;
    getRelationByIds(senderId: number, receiverId: number): Promise<Relation>;
}
