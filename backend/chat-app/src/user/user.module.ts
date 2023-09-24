import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// import { getUser } from './decorator/get-user.decorator';
import * as config from 'config';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname } from 'path';
import { format } from 'light-date';
@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
          storage: diskStorage({
              destination: function (req, file, cb) {
                  // 파일저장위치 + 년월 에다 업로드 파일을 저장한다.
                  // 요 부분을 원하는 데로 바꾸면 된다.
                  const dest = __dirname + `/../../uploads/${format(new Date(), '{yyyy}{MM}')}/`;

                  if (!fs.existsSync(dest)) {
                      fs.mkdirSync(dest, { recursive: true });
                  }

                  cb(null, dest);
              },
              filename: (req, file, cb) => {
                  // 업로드 후 저장되는 파일명을 랜덤하게 업로드 한다.(동일한 파일명을 업로드 됐을경우 오류방지)
                  const randomName = Array(32)
                      .fill(null)
                      .map(() => Math.round(Math.random() * 16).toString(16))
                      .join('');
                  return cb(null, `${randomName}${extname(file.originalname)}`);
              },
          }),
      }),
      inject: [ConfigService],
    }),




    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || config.get('jwt.secret'),
      signOptions:{
        expiresIn: '60m',
      }
    }),
    TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserRepository, ConfigService],
  exports: [TypeOrmModule, UserRepository],
})
export class UserModule {}
