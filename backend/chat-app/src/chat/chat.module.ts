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
import { HttpModule, HttpService } from '@nestjs/axios';
import { MailService } from 'src/auth/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HttpExceptionFilter } from 'src/auth/http.exception.filter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message, UserChannelBridge]),
    AuthModule,
    UserModule,
    HttpModule,
    MailerModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, UserService, AuthService, MailService, ChatService, ChannelRepository, MessageRepository, UcbRepository],
  exports: [ChatService, ChannelRepository, MessageRepository, UcbRepository]
})
export class ChatModule {}
