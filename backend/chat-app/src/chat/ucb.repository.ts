import { Injectable, NotFoundException } from "@nestjs/common";
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

    async getUcbByIds(userId: number, channelId: number): Promise<UserChannelBridge> {
        const found = await this.findOne({
            where: {user_id: userId,
                    channel_id: channelId}
        });

        return found;
    }

    async createUCBridge(user: User, channel: Channel, userType: UserType) {
        const found = this.getUcbByIds(user.user_id, channel.channel_id);
        if (!found)
        {
            const newBridge = new UserChannelBridge();
            newBridge.user = user;
            newBridge.channel = channel;
            newBridge.user_type = userType;

            await newBridge.save();
        }
    }

    async deleteUCBridge(userId: number, channelId: number) {
        await this.delete({ channel_id: channelId, user_id: userId });
    }

    async updateUserTypeOfUCBridge(userId: number, channelId: number, newType: UserType) {
        const found = await this.getUcbByIds(userId, channelId);

        if (found) {
            found.user_type = newType;
            await found.save();
        }
        else
            throw new NotFoundException(`user ${userId} not found in channel ${channelId}`);
    }

    async addMember(user: User, channel: Channel, type: UserType, found: UserChannelBridge): Promise<void> {
        const newMembership = new UserChannelBridge();

        newMembership.user_type = type;
        newMembership.user = user;
        newMembership.channel = channel;
        
        await newMembership.save();
    }
}