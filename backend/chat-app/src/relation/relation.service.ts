import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RelationRepository } from './relation.repository';
import { User } from 'src/user/entity/user.entity';
import { Relation } from './entity/relation.entity';
import { RelationType } from './enum/relation-type.enum';
import { SocialDto } from './dto/social-dto';
import { UserService } from 'src/user/user.service';
import { BlockDto } from './dto/block-dto';

@Injectable()
export class RelationService {
    constructor(
        private userService: UserService,
        private relationRepository: RelationRepository) {}
    
    private logger = new Logger('RelationService');

    async addFriend(sender: User, receiverId: number): Promise<Relation> {
        //이미 sender가 receiver를 친구로 등록했는지 검사
        if (await this.checkFriended(sender.user_id, receiverId)) {
            //exception handler
            this.logger.debug('Friended Already');
            throw new HttpException('Friended Already', HttpStatus.UNAUTHORIZED);
        }
       
        //이미 sender가 receiver를 block했는지 검사 -> 바꿔는 줌
        if (await this.checkBlocked(sender.user_id, receiverId)) {
            this.logger.debug('Block To Friend');
        }

        return await this.relationRepository.addRelation(sender, receiverId, RelationType.FRIEND);
    }

    async addBlock(sender: User, receiverId: number): Promise<Relation> {
        //이미 sender가 receiver를 block했는지 검사
        if (await this.checkBlocked(sender.user_id, receiverId)) {
            //exception handler
            this.logger.debug('Blocked Already');
            throw new HttpException('Blocked Already', HttpStatus.UNAUTHORIZED);
        }
       
        //이미 sender가 receiver를 친구등록 했는지 검사 -> 바꿔는 줌
        if (await this.checkFriended(sender.user_id, receiverId)) {
            this.logger.debug('Friend To Block');
        }

        return await this.relationRepository.addRelation(sender, receiverId, RelationType.BLOCK);
    }

    async unFriend(senderId: number, receiverId: number) {
        const relation = await this.getRelationByIds(senderId, receiverId);
        if (!relation || (relation && relation.relation_type !== RelationType.FRIEND)) {
            //exception handler
            this.logger.debug('Not Friended Before');
            throw new HttpException('Not Friended Before', HttpStatus.UNAUTHORIZED);
        }

        await this.relationRepository.deleteRelation(relation.relation_id);
    }

    async unBlock(senderId: number, receiverId: number) {
        const relation = await this.getRelationByIds(senderId, receiverId);
        if (!relation || (relation && relation.relation_type !== RelationType.BLOCK)) {
            //exception handler
            this.logger.debug('Not Blocked Before');
            throw new HttpException('Not Blocked Before', HttpStatus.UNAUTHORIZED);
        }

        await this.relationRepository.deleteRelation(relation.relation_id);
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

    async getFriendsOfUser(userId: number): Promise<SocialDto[]> {
        let friends: SocialDto[] = [];
        const relationType = RelationType.FRIEND;

        const relations = await this.relationRepository
        .createQueryBuilder('r')
        .where('r.sender_id = :userId', {userId})
        .andWhere('r.relation_type = :relationType', {relationType})
        .select(['r.receiver_id'])
        .getMany();

        for (let r of relations) {
            let friend = {user: await this.userService.getProfileByUserId(r.receiver_id)};
            friends.push(friend);
        }

        return friends;
    }

    async getBlocksOfUser(userId: number): Promise<SocialDto[]> {
        let blocks: SocialDto[] = [];
        const relationType = RelationType.BLOCK;

        const relations = await this.relationRepository
        .createQueryBuilder('r')
        .where('r.sender_id = :userId', {userId})
        .andWhere('r.relation_type = :relationType', {relationType})
        .select(['r.receiver_id'])
        .getMany();

        for (let r of relations) {
            let friend = {user: await this.userService.getProfileByUserId(r.receiver_id)};
            blocks.push(friend);
        }

        return blocks;
    }

    async getEveryoneWhoBlockedMe(myId: number): Promise<BlockDto[]> {
        let whoBlockedMe: BlockDto[] = [];
        const relationType = RelationType.BLOCK;

        const relations = await this.relationRepository
        .createQueryBuilder('r')
        .where('r.receiver_id = :myId', {myId})
        .andWhere('r.relation_type = :relationType', {relationType})
        .select(['r.sender_id'])
        .getMany();

        for (let r of relations) {
            let b_id = { userId: r.sender_id };
            whoBlockedMe.push(b_id);
        }

        return whoBlockedMe;
    }

}
