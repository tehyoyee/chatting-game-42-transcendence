import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Channel } from '../entity/channel.entity';
import { User } from 'src/user/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UserType } from '../enum/user_type.enum';
import { ChannelType } from '../enum/channel_type.enum';
import { GroupChannelDto } from '../dto/channel-dto';
import { UpdatePasswordDto } from '../dto/update-dto';

@Injectable()
export class ChannelRepository extends Repository<Channel> {
  constructor(dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }

  async createGroupChannel(groupChannelDto: GroupChannelDto): Promise<Channel> {
    const { channelName, channelType, password } = groupChannelDto;

    const newChannel = new Channel();
    newChannel.channel_name = channelName;
    newChannel.channel_type = channelType;
    if (channelType === ChannelType.PROTECTED && password) {
      newChannel.salt = await bcrypt.genSalt();
      newChannel.channel_pwd = await bcrypt.hash(password, newChannel.salt);
    }
    if (channelType === ChannelType.PUBLIC) {
      newChannel.salt = '';
      newChannel.channel_pwd = '';
    }
    await newChannel.save();

    return newChannel;
  }

  async createDmChannel(
    senderId: number,
    receiverId: number,
  ): Promise<Channel> {
    const newChannel = new Channel();

    newChannel.channel_name =
      'user' + senderId.toString() + ':' + 'user' + receiverId.toString();
    newChannel.channel_type = ChannelType.DM;
    // newChannel.is_channel = false;
    // newChannel.is_public = false;
    newChannel.salt = '';
    newChannel.channel_pwd = '';

    await newChannel.save();

    return newChannel;
  }

  async createPrivateChannel(channelName: string): Promise<Channel> {
    const newChannel = new Channel();

    newChannel.channel_name = channelName;
    newChannel.channel_type = ChannelType.PRIVATE;
    // newChannel.is_channel = false;
    // newChannel.is_public = false;
    newChannel.salt = '';
    newChannel.channel_pwd = '';

    await newChannel.save();

    return newChannel;
  }

  async getChannelByName(channelName: string): Promise<Channel> {
    const found = await this.findOne({
      where: { channel_name: channelName },
    });

    return found;
  }

  async getChannelById(channelId: number): Promise<Channel> {
    const found = await this.findOne({
      where: { channel_id: channelId },
    });

    return found;
  }

  async getDmRoomByName(channelName: string): Promise<Channel> {
    const found = await this.findOne({
      where: { channel_name: channelName, channel_type: ChannelType.DM },
    });

    return found;
  }

  async deleteChannelByChannelId(channelId: number) {
    const result = await this.delete({ channel_id: channelId });
    if (result.affected !== 1) {
      throw new ServiceUnavailableException();
    }
  }

  async setPassword(channel: Channel, newPassword: string) {
    if (channel.channel_type === ChannelType.PUBLIC) {
      channel.channel_type = ChannelType.PROTECTED;
    }
    channel.salt = await bcrypt.genSalt();
    channel.channel_pwd = await bcrypt.hash(newPassword, channel.salt);

    await channel.save();
  }

  async unsetPassword(channel: Channel) {
    channel.channel_type = ChannelType.PUBLIC;
    channel.salt = '';
    channel.channel_pwd = '';

    await channel.save();
  }
}
