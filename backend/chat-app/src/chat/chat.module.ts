import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entity/channel.entity';
import { Message } from './entity/message.entity';
import { UserChannelBridge } from './entity/user-channel-bridge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Message, UserChannelBridge])],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController]
})
export class ChatModule {}
