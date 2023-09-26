import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entity/channel.entity';
import { Message } from './entity/message.entity';
import { UserChannelBridge } from './entity/user-channel-bridge.entity';
import { UserModule } from 'src/user/user.module';
import { ChannelRepository } from './repository/channel.repository';
import { MessageRepository } from './repository/message.repository';
import { UcbRepository } from './repository/ucb.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { MailService } from 'src/auth/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HttpExceptionFilter } from 'src/exception/http.exception.filter';
import { RelationModule } from 'src/relation/relation.module';
import { RelationService } from 'src/relation/relation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message, UserChannelBridge]),
    AuthModule,
    UserModule,
    HttpModule,
    MailerModule,
    RelationModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    UserService,
    AuthService,
    MailService,
    ChatService,
    RelationService,
    ChannelRepository,
    MessageRepository,
    UcbRepository,
  ],
  exports: [ChatService, ChannelRepository, MessageRepository, UcbRepository],
})
export class ChatModule {}
