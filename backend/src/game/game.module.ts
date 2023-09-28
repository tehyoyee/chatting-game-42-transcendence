import { AuthModule } from 'src/auth/auth.module';
import { GameGateway } from './game.gateway';
import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/auth/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { UserRepository } from 'src/user/user.repository';
import { GameService } from './game.service';
import { GameRepository } from './game.repository';

@Module({
  imports: [AuthModule, UserModule, MailerModule, HttpModule],
  providers: [
    GameGateway,
    GameService,
    AuthService,
    UserService,
    MailService,
    UserRepository,
    GameRepository,
  ],
})
export class GameModule {}
