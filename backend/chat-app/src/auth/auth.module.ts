import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as config from 'config';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
// import { serRepository } from 'src/user/user.repository';
import { HttpModule, HttpService } from "@nestjs/axios";
import { UserRepository } from '../user/user.repository';
// const jwtConfig = config.get('jwt');

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
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, UserRepository],
  exports: [TypeOrmModule, PassportModule, JwtModule],
})
export class AuthModule {}
