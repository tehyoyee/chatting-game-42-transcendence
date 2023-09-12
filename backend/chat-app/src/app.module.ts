import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';
import { AuthModule } from './auth/auth.module';
<<<<<<< HEAD
import { ChatModule } from './chat/chat.module';
import { ChannelGateway } from './channel/channel.gateway';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'chat-app',
      entities: [User],
      synchronize: true,
    }),
    UserModule, AuthModule, ChatModule
=======
import { typeORMConfig } from './configs/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'postgres',
    //   password: '1234',
    //   database: 'chat-app',
    //   entities: [User],
    //   synchronize: true,
    // }),
    UserModule, AuthModule
>>>>>>> 58000b4ec5315494dc1814f9f996ccc086a5231e
  ],
  controllers: [AppController],
  providers: [AppService, ChannelGateway],
})
export class AppModule {}
