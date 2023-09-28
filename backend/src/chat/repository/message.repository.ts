import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Message } from '../entity/message.entity';
import { GroupMessageDto } from '../dto/message-dto';
import { User } from 'src/user/entity/user.entity';
import { Channel } from '../entity/channel.entity';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }

  async createGroupMessage(
    sender: User,
    channel: Channel,
    content: string,
  ): Promise<Message> {
    const newMessage = new Message();
    newMessage.content = content;
    newMessage.user = sender;
    newMessage.channel = channel;
    await newMessage.save();

    return newMessage;
  }

  async createDM(
    sender: User,
    channel: Channel,
    content: string,
  ): Promise<Message> {
    const newDM = new Message();
    newDM.content = content;
    newDM.user = sender;
    newDM.channel = channel;
    await newDM.save();

    return newDM;
  }

  async deleteMessagesByChannelId(channelId: number) {
    await this.delete({ channel_id: channelId });
  }
}
