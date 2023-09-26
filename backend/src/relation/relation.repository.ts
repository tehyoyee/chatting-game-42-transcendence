import { Injectable } from '@nestjs/common';
import { Relation } from './entity/relation.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { RelationType } from './enum/relation-type.enum';

@Injectable()
export class RelationRepository extends Repository<Relation> {
  constructor(datasource: DataSource) {
    super(Relation, datasource.createEntityManager());
  }

  async addRelation(
    sender: User,
    receiverId: number,
    newRelationType: RelationType,
  ): Promise<Relation> {
    const newRelation = new Relation();
    newRelation.relation_type = newRelationType;
    newRelation.sender_id = sender.user_id;
    newRelation.receiver_id = receiverId;
    newRelation.sender = sender;

    await newRelation.save();
    return newRelation;
  }

  async deleteRelation(relationId: number) {
    await this.delete({ relation_id: relationId });
  }

  async getRelationByIds(
    senderId: number,
    receiverId: number,
  ): Promise<Relation> {
    const found = await this.findOne({
      where: { sender_id: senderId, receiver_id: receiverId },
    });

    return found;
  }
}
