import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { RelationService } from './relation.service';
import { Relation } from './entity/relation.entity';
import { AuthService } from 'src/auth/auth.service';
import { RelationDto } from './dto/relation-dto';
import { UserService } from 'src/user/user.service';

@Controller('relation')
export class RelationController {
    constructor (
        private readonly relationService: RelationService,
        private readonly userService: UserService) {}

    @Post('add/friend')
    async addFriend(@Body() relationDto: RelationDto): Promise<Relation> {
        const sender = await this.userService.getProfileByUserId(relationDto.senderId); 
        return await this.relationService.addFriend(sender, relationDto.receiverId);
    }
    
    @Post('add/block')
    async addBlock(@Body() relationDto: RelationDto): Promise<Relation> {
        const sender = await this.userService.getProfileByUserId(relationDto.senderId);
        return await this.relationService.addBlock(sender, relationDto.receiverId);
    }

    // @Delete('remove/friend')
    // async unFriend() {

    // }

    // @Delete('remove/block')
    // async unBlock() {
        
    // }

    // @Get('social/friends')
    // async getFriendsStatusOfUser() {

    // }

    // @Get('social/blocks')
    // async getBlocksStatusOfUser() {
        
    // }
}
