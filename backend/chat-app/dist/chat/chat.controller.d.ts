import { ChatService } from './chat.service';
import { User } from 'src/user/entity/user.entity';
import { ChatGateway } from './chat.gateway';
import { Channel } from './entity/channel.entity';
import { UserService } from 'src/user/user.service';
import { BridgeDto } from './dto/bridge-dto';
export declare class ChatController {
    private userServics;
    private chatService;
    private chatGateway;
    constructor(userServics: UserService, chatService: ChatService, chatGateway: ChatGateway);
    getAllPublicChannel(): Promise<Channel[]>;
    getAllProtectedChannel(): Promise<Channel[]>;
    getJoinedGroupChannelsByUserId(id: number): Promise<Channel[]>;
    getJoinedDmChannelsByUserId(id: number): Promise<Channel[]>;
    getChannelByChannelId(id: number): Promise<Channel>;
    getChannelByChannelName(name: string): Promise<Channel>;
    getProfileByUserIdInChannel(id: number): Promise<User>;
    getAllUsersInfoInChannel(uid: number, cid: number): Promise<BridgeDto[]>;
}
