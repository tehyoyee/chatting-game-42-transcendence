import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from 'src/user/entity/user.entity';
import { ChatGateway } from './chat.gateway';
import { UserInRequest } from 'src/types/user-in-request.interface';

@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
        private chatGateway: ChatGateway) {}

        //public인 전체 채널 리스트 가져오기
        // @Get('channel/public')
    
        //유저가 참여중인 채널 리스트 가져오기
        // @Get('channel/joined')
    
        //특정 채널 가져오기
        // @Get('/channel/:id')
    
        //특정 채널 삭제하기
        // @Get('channel/:id')

    }

    
