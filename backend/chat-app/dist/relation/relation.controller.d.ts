import { RelationService } from './relation.service';
import { Relation } from './entity/relation.entity';
import { RelationDto } from './dto/relation-dto';
import { UserService } from 'src/user/user.service';
import { SocialDto } from './dto/social-dto';
export declare class RelationController {
    private readonly relationService;
    private readonly userService;
    constructor(relationService: RelationService, userService: UserService);
    addFriend(relationDto: RelationDto): Promise<Relation>;
    addBlock(relationDto: RelationDto): Promise<Relation>;
    unFriend(relationDto: RelationDto): Promise<{
        state: boolean;
    }>;
    unBlock(relationDto: RelationDto): Promise<{
        state: boolean;
    }>;
    getFriendsStatusOfUser(userId: number): Promise<SocialDto[]>;
    getBlocksStatusOfUser(userId: number): Promise<SocialDto[]>;
}
