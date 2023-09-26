import { DataSource, Repository } from "typeorm";
import { UserChannelBridge } from "../entity/user-channel-bridge.entity";
import { Channel } from "../entity/channel.entity";
import { UserType } from "../enum/user_type.enum";
import { User } from "src/user/entity/user.entity";
export declare class UcbRepository extends Repository<UserChannelBridge> {
    constructor(dataSource: DataSource);
    private logger;
    getUcbByIds(userId: number, channelId: number): Promise<UserChannelBridge>;
    createUCBridge(user: User, channel: Channel, userType: UserType): Promise<void>;
    deleteUCBridge(userId: number, channelId: number): Promise<void>;
    updateUserTypeOfUCBridge(targetUserId: number, channelId: number, newType: UserType): Promise<void>;
    updateBanStatus(bridge: UserChannelBridge, newBanStatus: boolean): Promise<UserChannelBridge>;
    updateMuteStatus(bridge: UserChannelBridge, newMuteStatus: boolean): Promise<UserChannelBridge>;
}
