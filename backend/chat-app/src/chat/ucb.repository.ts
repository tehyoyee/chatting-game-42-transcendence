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

    async getUcbByIds(user_id: number, channel_id: number): Promise<UserChannelBridge> {
        const found = await this.findOne({
            where: { user_id: user_id,
                channel_id: channel_id }
        });

        return found;
    }

    async createUCBridge(user_id: number, channel_id: number, channel: Channel, user: User) {
        const found = this.getUcbByIds(user_id, channel_id);

        if (!found)
        {
            const newMembership = new UserChannelBridge();
            newMembership.user = user;
            newMembership.channel = channel;
            newMembership.user_type = UserType.GENERAL;

            await newMembership.save();
        }
    }

    async deleteUCBridge(channelId: number, userId: number) {
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