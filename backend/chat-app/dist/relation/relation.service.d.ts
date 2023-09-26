import { RelationRepository } from './relation.repository';
import { User } from 'src/user/entity/user.entity';
import { Relation } from './entity/relation.entity';
import { SocialDto } from './dto/social-dto';
import { UserService } from 'src/user/user.service';
import { BlockDto, FriendDto } from './dto/relation-dto';
export declare class RelationService {
    private userService;
    private relationRepository;
    constructor(userService: UserService, relationRepository: RelationRepository);
    private logger;
    addFriend(sender: User, receiverId: number): Promise<Relation>;
    addBlock(sender: User, receiverId: number): Promise<Relation>;
    unFriend(senderId: number, receiverId: number): Promise<void>;
    unBlock(senderId: number, receiverId: number): Promise<void>;
    getRelationByIds(senderId: number, receiverId: number): Promise<Relation>;
    checkFriended(senderId: number, receiverId: number): Promise<boolean>;
    checkBlocked(senderId: number, receiverId: number): Promise<boolean>;
    getFriendsOfUser(userId: number): Promise<SocialDto[]>;
    getBlocksOfUser(userId: number): Promise<SocialDto[]>;
    getEveryoneWhoBlockedMe(myId: number): Promise<BlockDto[]>;
    getEveryoneWhoFriendedMe(myId: number): Promise<FriendDto[]>;
}
