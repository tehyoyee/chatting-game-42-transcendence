import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RelationRepository } from './relation.repository';
import { User } from 'src/user/entity/user.entity';
import { Relation } from './entity/relation.entity';
import { RelationType } from './enum/relation-type.enum';

@Injectable()
export class RelationService {
    constructor(private relationRepository: RelationRepository) {}
    
    private logger = new Logger('RelationService');

    async addFriend(sender: User, receiverId: number): Promise<Relation> {
        const already = await this.relationRepository.getRelationByIds(sender.user_id, receiverId);
        if (already && already.relation_type === RelationType.FRIEND) {
            //exception handler
            this.logger.debug('Friended Already');
            throw new HttpException('Friended Already', HttpStatus.UNAUTHORIZED);
        }
        if (already && already.relation_type === RelationType.BLOCK) {
            //exception handler
            this.logger.debug('Unblock First');
            throw new HttpException('Unblock First', HttpStatus.UNAUTHORIZED);
        }

        //sender가 reeiver를 블록했는지 검사
        //receiver가 sender를 블록했는지 검사

        return await this.relationRepository.addFriend(sender, receiverId);
    }

    async addBlock(sender: User, receiverId: number): Promise<Relation> {
        const already = await this.relationRepository.getRelationByIds(sender.user_id, receiverId);
        if (already && already.relation_type === RelationType.BLOCK) {
            //exception handler
            this.logger.debug('Blocked Already');
            throw new HttpException('Blocked Already', HttpStatus.UNAUTHORIZED);
        }

        //sender가 receiver를 친구등록했는지 검사

        return await this.relationRepository.addFriend(sender, receiverId);
    }

    async getRelationByIds(senderId: number, receiverId: number): Promise<Relation> {
        return await this.relationRepository.getRelationByIds(senderId, receiverId);
    }
}
