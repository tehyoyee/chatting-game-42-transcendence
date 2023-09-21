import { Module } from '@nestjs/common';
import { RelationController } from './relation.controller';
import { RelationService } from './relation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relation } from './entity/relation.entity';
import { RelationRepository } from './relation.repository';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Relation]),
    UserModule],
  controllers: [RelationController],
  providers: [RelationService, RelationRepository, UserService],
  exports: [TypeOrmModule, RelationRepository],
})
export class RelationModule {}
