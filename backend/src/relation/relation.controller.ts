import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { RelationService } from './relation.service';
import { Relation } from './entity/relation.entity';
import { AuthService } from 'src/auth/auth.service';
import { RelationDto } from './dto/relation-dto';
import { UserService } from 'src/user/user.service';
import { SocialDto } from './dto/social-dto';

@Controller('relation')
export class RelationController {
  constructor(
    private readonly relationService: RelationService,
    private readonly userService: UserService,
  ) {}

  @Post('add/friend')
  async addFriend(@Body() relationDto: RelationDto): Promise<Relation> {
    const sender = await this.userService.getProfileByUserId(
      relationDto.senderId,
    );
    return await this.relationService.addFriend(sender, relationDto.receiverId);
  }

  @Post('add/block')
  async addBlock(@Body() relationDto: RelationDto): Promise<Relation> {
    const sender = await this.userService.getProfileByUserId(
      relationDto.senderId,
    );
    return await this.relationService.addBlock(sender, relationDto.receiverId);
  }

  @Delete('remove/friend')
  async unFriend(@Body() relationDto: RelationDto) {
    try {
      const sender = await this.userService.getProfileByUserId(
        relationDto.senderId,
      );
      await this.relationService.unFriend(
        relationDto.senderId,
        relationDto.receiverId,
      );
    } catch (exception) {
      return { state: false };
    }
    return { state: true };
  }

  @Delete('remove/block')
  async unBlock(@Body() relationDto: RelationDto) {
    try {
      const sender = await this.userService.getProfileByUserId(
        relationDto.senderId,
      );
      await this.relationService.unBlock(
        relationDto.senderId,
        relationDto.receiverId,
      );
    } catch (exception) {
      return { state: false };
    }
    return { state: true };
  }

  //user 객체 전체가 아니라 nickname, avatar, status 정도만 불러오도록 수정
  @Get('social/friends/:id')
  async getFriendsStatusOfUser(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<SocialDto[]> {
    return await this.relationService.getFriendsOfUser(userId);
  }

  @Get('social/blocks/:id')
  async getBlocksStatusOfUser(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<SocialDto[]> {
    return await this.relationService.getBlocksOfUser(userId);
  }
}
