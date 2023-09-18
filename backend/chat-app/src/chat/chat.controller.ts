import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from 'src/user/entity/user.entity';
import { ChatGateway } from './chat.gateway';
import { GroupChannelDto } from './dto/channel-dto';
import { UserInRequest } from 'src/types/user-in-request.interface';

@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
        private chatGateway: ChatGateway) {}

    // //public, protected 채팅방 생성 5
    // @Post('/channel/group')
    // async createGeneralChannel(@Req() req: UserInRequest, @Body() groupChannelDto: GroupChannelDto) {
    //     const channel = await this.chatService.createGroupChannel(req.user, groupChannelDto);

        


    }

    //private, dm 채팅방 생성 7
    // @Post('/channel/dm')

    //public인 전체 채널 리스트 가져오기 1
    // @Get('channel/public')

    //유저가 참여중인 채널 리스트 가져오기 3
    // @Get('channel/joined')

    //특정 채널 가져오기 11
    // @Get('/channel/:id')

    //특정 채널 삭제하기 12
    // @Get('channel/:id')

    
