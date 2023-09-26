import { DataSource, Repository } from "typeorm";
import { Message } from "../entity/message.entity";
import { User } from "src/user/entity/user.entity";
import { Channel } from "../entity/channel.entity";
export declare class MessageRepository extends Repository<Message> {
    constructor(dataSource: DataSource);
    createGroupMessage(sender: User, channel: Channel, content: string): Promise<Message>;
    createDM(sender: User, channel: Channel, content: string): Promise<Message>;
    deleteMessagesByChannelId(channelId: number): Promise<void>;
}
