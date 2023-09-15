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
import { UcbRepository } from './ucb.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message, UserChannelBridge]),
    AuthModule,
    UserModule
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChannelRepository, MessageRepository, UcbRepository],
  exports: [TypeOrmModule, ChatService, ChannelRepository, MessageRepository, UcbRepository]
})
export class ChatModule {}
