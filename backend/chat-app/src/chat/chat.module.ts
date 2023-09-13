import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entity/channel.entity';
import { Message } from './entity/message.entity';
import { UserChannelBridge } from './entity/user-channel-bridge.entity';
import { UserModule } from 'src/user/user.module';
import { ChannelRepository } from './channel.repository';
import { MessageRepository } from './message.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message, UserChannelBridge]),
    UserModule
  ],
  providers: [ChatService, ChatGateway, ChannelRepository, MessageRepository],
  controllers: [ChatController]
})
export class ChatModule {}
