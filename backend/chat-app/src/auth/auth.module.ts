import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FortyTwoStrategy } from './FortyTwostrategy';
import * as config from 'config';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { userRepository } from 'src/user/user.repository';
// const jwtConfig = config.get('jwt');

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.register({
      secret: 'Secret1234',
      signOptions:{
        expiresIn: 3600,
      }
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy, UserService, userRepository],
  exports: [TypeOrmModule, PassportModule, JwtModule],
})
export class AuthModule {}
