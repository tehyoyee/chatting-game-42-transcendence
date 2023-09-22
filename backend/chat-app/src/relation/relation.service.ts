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
        //이미 sender가 receiver를 친구로 등록했는지 검사
        if (this.checkFriended(sender.user_id, receiverId)) {
            //exception handler
            this.logger.debug('Friended Already');
            throw new HttpException('Friended Already', HttpStatus.UNAUTHORIZED);
        }
       
        //이미 sender가 receiver를 block했는지 검사 -> 바꿔는 줌
        if (this.checkBlocked(sender.user_id, receiverId)) {
            this.logger.debug('Block To Friend');
        }

        return await this.relationRepository.addRelation(sender, receiverId, RelationType.FRIEND);
    }

    async addBlock(sender: User, receiverId: number): Promise<Relation> {
        //이미 sender가 receiver를 block했는지 검사
        if (this.checkBlocked(sender.user_id, receiverId)) {
            //exception handler
            this.logger.debug('Blocked Already');
            throw new HttpException('Blocked Already', HttpStatus.UNAUTHORIZED);
        }
       
        //이미 sender가 receiver를 친구등록 했는지 검사 -> 바꿔는 줌
        if (this.checkFriended(sender.user_id, receiverId)) {
            this.logger.debug('Friend To Block');
        }

        return await this.relationRepository.addRelation(sender, receiverId, RelationType.BLOCK);
    }

    async getRelationByIds(senderId: number, receiverId: number): Promise<Relation> {
        return await this.relationRepository.getRelationByIds(senderId, receiverId);
    }

    async checkFriended(senderId: number, receiverId: number) {
        const friended = await this.getRelationByIds(senderId, receiverId);
        if (friended && friended.relation_type === RelationType.FRIEND) {
            return true;
        }

        return false;
    }

    async checkBlocked(senderId: number, receiverId: number) {
        const blocked = await this.getRelationByIds(senderId, receiverId);
        if (blocked && blocked.relation_type === RelationType.BLOCK) {
            return true;
        }
        
        return false;
    }
}
