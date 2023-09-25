import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UserChannelBridge } from "./entity/user-channel-bridge.entity";
import { Channel } from "./entity/channel.entity";
import { UserType } from "./enum/user_type.enum";
import { User } from "src/user/entity/user.entity";

@Injectable()
export class UcbRepository extends Repository<UserChannelBridge> {
    constructor(dataSource: DataSource) {
        super(UserChannelBridge, dataSource.createEntityManager())
    }

    private logger = new Logger('UcbRepository');

    async getUcbByIds(userId: number, channelId: number): Promise<UserChannelBridge> {
        const found = await this.findOne({
            where: {user_id: userId,
                    channel_id: channelId}
        });

        return found;
    }

    async createUCBridge(user: User, channel: Channel, userType: UserType) {
        const found = await this.getUcbByIds(user.user_id, channel.channel_id);
        if (!found)
        {
            const newBridge = new UserChannelBridge();
            newBridge.user_id = user.user_id;
            newBridge.channel_id = channel.channel_id;
            newBridge.user_type = userType;
            newBridge.user = user;
            newBridge.channel = channel;

            await newBridge.save();
        }
    }

    async deleteUCBridge(userId: number, channelId: number) {
        await this.delete({ channel_id: channelId, user_id: userId });
    }

    async updateUserTypeOfUCBridge(targetUserId: number, channelId: number, newType: UserType) {
        const found = await this.getUcbByIds(targetUserId, channelId);

        if (found) {
            found.user_type = newType;
            await found.save();
        }
        else {
            //exception handler
            this.logger.debug('Unexist Bridge');
            throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
        }
    }

    async updateBanStatus(bridge: UserChannelBridge, newBanStatus: boolean): Promise<UserChannelBridge> {
        bridge.is_banned = newBanStatus;
        await bridge.save();

        return bridge;
    }

    async updateMuteStatus(bridge: UserChannelBridge, newMuteStatus: boolean): Promise<UserChannelBridge> {
        bridge.is_muted = newMuteStatus;
        await bridge.save();

        return bridge;
    }
}