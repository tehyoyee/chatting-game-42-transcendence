import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { getUser } from 'src/user/decorator/get-user.decorator';
import { User } from 'src/user/entity/user.entity';

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) {}

    // @Post('/channel/create')
    // async createChannel(@getUser() user: User, @Body() createChannelDto: CreateChannelDto) {
    //     console.log('createchannel controller in');
    //     const newChannel = await this.chatService.createChannel(user, createChannelDto);
    // }

    @Get('/channel/list/join')
    getJoinChannelList() {

    }

    @Get('channel/list/all')
    getAllChannelList() {

    }

    @Put('/channel/:id')
    async JoinChannelById(@Param('id') id: number, @getUser() user: User) {
        return await this.chatService.JoinChannelById(id, user);

    }
    
}
