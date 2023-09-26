import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as config from 'config';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { HttpModule, HttpService } from "@nestjs/axios";
import { UserRepository } from '../user/user.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || config.get('jwt.secret'),
      signOptions:{
        expiresIn: 3600,
      }
    }),
    TypeOrmModule.forFeature([User]),
    HttpModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: config.get('mail.user'),
          pass: config.get('mail.pass')
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: __dirname + '/templates',
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, UserRepository, MailService, JwtStrategy],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
