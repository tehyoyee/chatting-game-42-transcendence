import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';
import { AuthModule } from './auth/auth.module';
import { typeORMConfig } from './configs/typeorm.config';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { RelationModule } from './relation/relation.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    UserModule, AuthModule, ChatModule, 
    GameModule, RelationModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
