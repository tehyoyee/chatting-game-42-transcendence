import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from 'src/user/entity/user.entity';
import { ChatGateway } from './chat.gateway';
import { UserInRequest } from 'src/types/user-in-request.interface';
import { Channel } from './entity/channel.entity';
import { ChannelType } from './enum/channel_type.enum';

@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
        private chatGateway: ChatGateway) {}

        //public인 전체 채널 리스트 가져오기
        @Get('channel/all/public')
        async getAllPublicChannel(): Promise<Channel[]> {
            let channels: Channel[] = [];
            channels =  await this.chatService.getAllGroupChannelsByChannelType(ChannelType.PUBLIC);

            return channels;
        }

        //비밀번호 걸린 전체 채널 리스트 가져오기
        @Get('channel/all/protected')
        async getAllProtectedChannel(): Promise<Channel[]> {
            let channels: Channel[] = [];
            channels =  await this.chatService.getAllGroupChannelsByChannelType(ChannelType.PROTECTED);

            return channels;
        }
    
        //유저가 참여중인 그룹채널 리스트 가져오기
        @Get('channel/joined/group/:id')
        async getJoinedGroupChannelsByUserId(@Param('id', ParseIntPipe) id: number): Promise<Channel[]> {
            let channels: Channel[] = [];
            channels = await this.chatService.getJoinedGroupChannelsByUserId(id);

            return channels;
        }
    
        //유저가 참여중인 DM채널 리스트 가져오기
        @Get('channel/joined/dm/:id')
        async getJoinedDmChannelsByUserId(@Param('id', ParseIntPipe) id: number): Promise<Channel[]> {
            let channels: Channel[] = [];
            channels = await this.chatService.getJoinedDmChannelsByUserId(id);

            return channels;
        }

        //유저의 Private채널 리스트 가져오기
        @Get('channel/joined/private/:id')
        async getJoinedPrivateChannelsByUserId(@Param('id', ParseIntPipe) id: number): Promise<Channel> {
            return await this.chatService.getPrivateChannelByUserId(id);
        }

        //특정 채널 id로 가져오기
        @Get('/channel/:id')
        async getChannelByChannelId(@Param('id', ParseIntPipe) id: number): Promise<Channel> {
            return await this.chatService.getChannelById(id);
        }

        //특정 채널 이름으로 가져오기
        @Get('/channel/:name')
        async getChannelByChannelName(@Param('name') name: string): Promise<Channel> {
            return await this.chatService.getChannelByName(name);
        }
    }

    
