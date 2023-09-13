import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { getUser } from 'src/user/decorator/get-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { CreateChannelDto } from './dto/create-channel.dto';

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) {}

    @Post('/channel/create')
    async createChannel(@getUser() user: User, @Body() createChannelDto: CreateChannelDto) {
        const newChannel = await this.chatService.createChannel(user, createChannelDto);

    }

    @Get('/channel/list')
    getJoinChannelList() {

    }
    
}
