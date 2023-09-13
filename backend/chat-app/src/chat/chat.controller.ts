import { Controller, Get, Post, Req } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) {}

    @Post('/channel/create')
    createChannel(@Req() req: Request) {

    }

    @Get('/channel/list')
    getJoinChannelList() {

    }
    
}
