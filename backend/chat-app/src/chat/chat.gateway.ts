import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/user/entity/user.entity';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { NotFoundError, map } from 'rxjs';
import { ConflictException, ForbiddenException, HttpException, HttpStatus, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserType } from './enum/user_type.enum';
import { DmChannelDto, JoinChannelDto, GroupChannelDto } from './dto/channel-dto';
import { UcbDto } from './dto/ucb-dto';
import { ChannelType } from './enum/channel_type.enum';
import { DmDto, GroupMessageDto } from './dto/message-dto';
import { UserStatus } from 'src/user/enum/user-status.enum';


@WebSocketGateway( {namespace: '/chat'} )
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  
  @WebSocketServer() server: Server;
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private chatService: ChatService) {}
  
  private logger = new Logger('ChatGateway');
  private userSocketMap = new Map();

  //onGatewayConnection의 메소드, 소켓이 연결되면 호출된다.
  async handleConnection(client: Socket) {
    const user = await this.socketToUser(client);
    if (!user) {
    // NOTE: exception is not handled and program stops
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);

      //return { statusCode: HttpStatus.UNAUTHORIZED, message: 'Unidentified User' };
      //client.disconnect();
      //유저가 없기 때문에 터지는게 맞는듯?
      //exException()
      //catch return (err);
      //return ;
    }
  
    client.data.user = user;
    this.userSocketMap.set(user.user_id, client);
  
    const privateChannelName = 'user' + user.user_id.toString();
    const privateChannel = await this.chatService.getChannelByName(privateChannelName)
    if (!privateChannel) {
      await this.chatService.createPrivateChannel(user, user.user_id, privateChannelName);
    }
    client.join(privateChannelName);
    
    const joinedGroupChannels = await this.chatService.getJoinedGroupChannelsOfUser(user.user_id);
    for (let c of joinedGroupChannels) {
      client.join('channel' + c.channel_id.toString());
    }
  
    const joinedDmChannels = await this.chatService.getJoinedDmChannelsOfUser(user.user_id);
    for (let c of joinedDmChannels) {
      client.join('channel' + c.channel_id.toString());
    }
    //socket.except()를 쓰기 위해 blocked와 banned도 있어야 할듯
    this.userService.updateStatus(user.user_id, UserStatus.ONLINE);
  }
  
  //OnGatewayDosconnect의 메소드, 소켓 연결이 종료되면 호출된다.
  async handleDisconnect(client: any) {
    const user = await this.socketToUser(client);
    client.disconnect();

    this.userService.updateStatus(user.user_id, UserStatus.OFFLINE);
  }
    
  private async socketToUser(client: Socket): Promise<User> {
    const token: any = client.handshake.query.token;
    if (!token)
      return null;
  
    try {
      const decoded = await this.authService.verifyToken(token);
      const user: User = await this.userService.getProfileByUserId(decoded.id);
      return user;
    }
    catch (error) {
        this.logger.error(error);
        return undefined;
    }
  }

  private userIdToSocket(userId: number): Socket {
    return this.userSocketMap.get(userId);
  }
  
  @SubscribeMessage('create-group-channel')
  async onCreateGroupChannel(client: Socket, groupChannelDto: GroupChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }
  
    const duplicate = await this.chatService.getChannelByName(groupChannelDto.channelName);
    if (duplicate) {
      //exception handler
      this.logger.debug('`Duplicate Channel Name`');
      throw new HttpException(`Duplicate Channel Name`, HttpStatus.UNAUTHORIZED);
    }
  
    const newChannel = await this.chatService.createGroupChannel(user, groupChannelDto);
  
    client.join(newChannel.channel_name);
    this.server.to(newChannel.channel_name).emit("join", user.username);

    return newChannel;
  }
    
  @SubscribeMessage('create-dm-channel')
  async onCreateDMhannel(client: Socket, dmChannelDto: DmChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }
    
    const exist = await this.chatService.checkDmRoomExists(user.user_id, dmChannelDto.receiverId);
    if (exist) {
      //exception handler
      this.logger.debug('dmRoom already exists');
      throw new HttpException('dmRoom already exists', HttpStatus.UNAUTHORIZED);
    }
  
    const newChannel = await this.chatService.createDmChannel(user, user.user_id, dmChannelDto.receiverId);
    const receiver = await this.userService.getProfileByUserId(dmChannelDto.receiverId);
    if (!receiver) {
      //exception handler
      this.logger.debug('receiver not found.');
      throw new HttpException('receiver not found.', HttpStatus.UNAUTHORIZED);
    }
    const receiverSocket = this.userIdToSocket(receiver.user_id);
    if (!receiverSocket) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }
  
    client.join(newChannel.channel_name);
    receiverSocket.join(newChannel.channel_name);
    this.server.to(newChannel.channel_name).emit("join", user.nickname);
    this.server.to(newChannel.channel_name).emit("join", receiver.nickname);
  
    return newChannel;
  }
    
  @SubscribeMessage('join-group-channel')
  async onJoinChannel(client: Socket, joinChannelDto: JoinChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const channel = await this.chatService.getChannelById(joinChannelDto.channel_id);
    if (!channel) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    if (channel.channel_type === ChannelType.PROTECTED) {
      if (!(await this.chatService.checkChannelPassword(channel, joinChannelDto.password))) {
        //exception handler
      this.logger.debug('Incorrect Password');
      throw new HttpException('Incorrect Password', HttpStatus.UNAUTHORIZED);
      }
    }

    await this.chatService.createUCBridge(user, channel, UserType.MEMBER);

    client.join(channel.channel_name);
    this.server.to(channel.channel_name).emit("join", user.nickname);
  }
 
  @SubscribeMessage('post-group-message')
  async onPostGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() groupMessageDto: GroupMessageDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    if (groupMessageDto.content === '') {
      //exception handler
      this.logger.debug('Empty Content');
      throw new HttpException('Empty Content', HttpStatus.UNAUTHORIZED);
    }
    const channel = await this.chatService.getChannelById(groupMessageDto.channel_id);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }

    const ucb = await this.chatService.isInThisChannel(user.user_id, channel.channel_id);
    if (!ucb || ucb.is_muted || ucb.is_banned) { //is_banned는 검사 안해도 될 듯
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    //블락 검사 필요

    const newMessage = await this.chatService.createGroupMessage(user, channel, groupMessageDto.content);

    this.server.to(channel.channel_name).emit('message', newMessage);
    return newMessage;
  }

  @SubscribeMessage('post-dm')
  async onPostDm(
    @ConnectedSocket() client: Socket,
    @MessageBody() dmDto: DmDto) {
      const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    } 

    if (dmDto.content === '') {
      //exception handler
      this.logger.debug('Empty Content');
      throw new HttpException('Empty Content', HttpStatus.UNAUTHORIZED); 
    }
    const channel = await this.chatService.checkDmRoomExists(user.user_id, dmDto.receiver_id);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }
    // block 검사 필요

    const newMessage = await this.chatService.createDM(user, channel, dmDto.content);

    this.server.to(channel.channel_name).emit('message', newMessage);
    return newMessage;
  }

  @SubscribeMessage('leave-channel')
  async onLeaveChannel(client: Socket, channelId: number) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const bridge = await this.chatService.isInThisChannel(user.user_id, channelId);
    if (!bridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }

    await this.chatService.deleteUCBridge(user.user_id, channelId);
    client.leave(channel.channel_name);
    this.server.to(channel.channel_name).emit(`user ${user.nickname} has left the room`);

    await this.chatService.deleteChannelIfEmpty(channelId);
  }


  // @SubscribeMessage('setAdmin')
  // async onSetAdmin(client: Socket, ucbDto: UcbDto) {
  //   await this.definePlayer(client);

  //   if (this.currentUser) {
  //     //currentUser가 channel에서의 user_type이 OWNER인지 확인해야 함!
  //     await this.chatService.updateUserTypeOfUCBridge(ucbDto.user_id, ucbDto.channel_id, UserType.ADMIN);

  //     let members = await this.chatService.getMembersByChannelId(ucbDto.channel_id, ucbDto.user_id);
  //     for (let x of this.connectedUsers) {
  //       let userId = x.handshake.query.token;
  //       userId = this.authService.verifyToken(userId);

  //       if (await this.chatService.isMember(ucbDto.channel_id, userId))
  //         this.server.to(x.id).emit('members', members);
  //     }
  //   }
  // }



  // @SubscribeMessage('changePassword')
  // async oncCangePassword(client: Socket, joinChannelDto: JoinChannelDto) {
  //   await this.definePlayer(client);

  //   if (this.currentUser) {
  //     if (this.chatService.isOwnerOfChannel(this.currentUser.user_id, joinChannelDto.channel_id)) {
  //       const {channel_id, password} = joinChannelDto;
        
  //       await this.chatService.updatePassword(channel_id, password);
  //     }
  //   }
  // }

  // @SubscribeMessage('removePassword')
  // async onRemovePassword(client: Socket, channelId: number) {
  //   await this.definePlayer(client);
  
  //   if (this.currentUser) {
  //     if (this.chatService.isOwnerOfChannel(this.currentUser.user_id, channelId)) {
  //       await this.chatService.updatePassword(channelId, '');
  //     }
  //   }
  // }
  
  // @SubscribeMessage('set-password')
  // async onSetPassword(client: Socket, joinChannelDto: JoinChannelDto) {
  //   await this.definePlayer(client);
  
  //   if (this.currentUser) {
  //     if (this.chatService.isOwnerOfChannel(this.currentUser.user_id, joinChannelDto.channel_id)) {
  //       await this.chatService.setPasswordToChannel(joinChannelDto);
  //     }
  //   }
  // }

  // @SubscribeMessage('kickUser')
  // async onKickUser(client: Socket, ucbDto: UcbDto) {
  //   await this.definePlayer(client);

  //   if (this.currentUser) {
  //     if (this.chatService.isOwnerOfChannel(ucbDto.user_id, ucbDto.channel_id)) {
  //       throw new UnauthorizedException(`user ${this.currentUser.user_id} cannot kick user ${ucbDto.user_id}`);
  //     }
      
  //     if (this.chatService.isOwnerOfChannel(this.currentUser.user_id, ucbDto.channel_id) || 
  //     this.chatService.isAdminOfChannel(this.currentUser.user_id, ucbDto.channel_id)) {
        
  //       await this.chatService.deleteUCBridge(ucbDto.channel_id, ucbDto.user_id);
  
  //       let kickedUserSocket = await this.getSocketId(ucbDto.user_id);
  //       if (kickedUserSocket) {
  //         let rooms = await this.chatService.getRoomsForUser(ucbDto.user_id);
  //         let allRooms = await this.chatService.getAllRooms(ucbDto.user_id);
          
  //         this.server.to(kickedUserSocket.id).emit('rooms', rooms);
  //         this.server.to(kickedUserSocket.id).emit('allRooms', allRooms);
  //       }
  
  //       let members = await this.chatService.getMembersByChannelId(ucbDto.channel_id, this.currentUser.user_id);
  //       for (let x of this.connectedUsers) {
  //         let userId = await x.handshake.query.token;
  
  //         userId = await this.authService.verifyToken(userId);
  //         if (await this.chatService.isMember(ucbDto.channel_id, userId.id)) {
  //           this.server.to(x.id).emit('members', members);
  //         }
  //       }
  //     }
  //   }
  // }
  
  // @SubscribeMessage('banUser') 
  // async onBanUser(client: Socket, ucbDto: UcbDto) {
  //   await this.definePlayer(client);

  //   if (this.currentUser) {
  //     if (this.chatService.isOwnerOfChannel(ucbDto.user_id, ucbDto.channel_id)) {
  //       throw new UnauthorizedException(`user ${this.currentUser.user_id} cannot kick user ${ucbDto.user_id}`);
  //     }
      
  //     if (this.chatService.isOwnerOfChannel(this.currentUser.user_id, ucbDto.channel_id) || 
  //     this.chatService.isAdminOfChannel(this.currentUser.user_id, ucbDto.channel_id)) {

  //       await this.chatService.updateBanStatus(this.currentUser.user_id, ucbDto.channel_id, true);

  //       let bannedSocket = await this.getSocketId(ucbDto.user_id);
  //       if (bannedSocket) {
  //         let rooms = await this.chatService.getRoomsForUser(ucbDto.user_id);
  //         let allRooms = await this.chatService.getAllRooms(ucbDto.user_id);
          
  //         this.server.to(bannedSocket.id).emit('message', rooms);
  //         this.server.to(bannedSocket.id).emit('allRooms', allRooms);
  //       }
      
  //       let members = await this.chatService.getMembersByChannelId(ucbDto.channel_id, this.currentUser.user_id);
  //       for (let x of this.connectedUsers) {
  //         let userId = await x.handshake.query.token;
  //         userId = await this.getSocketId(userId);
  //         if (await this.chatService.isMember(ucbDto.channel_id, userId.id)) {
  //           this.server.to(x.id).emit('members', members);
  //         }
  //       }
  //     }
  //   }
  // }

  // // @SubscribeMessage('unbanUser') <- 없어도 될듯?
  
  // @SubscribeMessage('muteUser')
  // async onMuteUser(client: Socket, ucbDto: UcbDto) {
  //   await this.definePlayer(client);

  //   if (this.currentUser) {
  //     if (this.chatService.isOwnerOfChannel(ucbDto.user_id, ucbDto.channel_id)) {
  //       throw new UnauthorizedException(`user ${this.currentUser.user_id} cannot kick user ${ucbDto.user_id}`);
  //     }

  //     if (this.chatService.isOwnerOfChannel(this.currentUser.user_id, ucbDto.channel_id) || 
  //     this.chatService.isAdminOfChannel(this.currentUser.user_id, ucbDto.channel_id)) {
  //       await this.chatService.updateMuteStatus(ucbDto.user_id, ucbDto.channel_id, true);

  //       //let mutedSocket = await this.getSocketId(ucbDto.user_id);
  //       let members = await this.chatService.getMembersByChannelId(ucbDto.channel_id, this.currentUser.user_id);
  //       for (let x of this.connectedUsers) {
  //         let userId = await x.handshake.query.token;
  //         userId = await this.getSocketId(userId);
  //         if (await this.chatService.isMember(ucbDto.channel_id, userId.id)) {
  //           this.server.to(x.id).emit('members', members);
  //           let membership = {
  //             channel_id: ucbDto.channel_id, 
  //             user_id: ucbDto.user_id };
  //           setTimeout(() => {
  //             this.server.to(x.id).emit('unMuteUser', membership);
  //           }, 10 * 1000);
  //         }
  //       }
  //     }
  //   }
  // }
  
  // @SubscribeMessage('unMuteUser')
  // async onUnMuteUser(client: Socket, ucbDto: UcbDto) {
  //   await this.definePlayer(client);

  //   if (this.currentUser) {
  //     await this.chatService.updateMuteStatus(ucbDto.user_id, ucbDto.channel_id, false);

  //     let unMutedSocket = await this.getSocketId(ucbDto.user_id);
  //     let members = await this.chatService.getMembersByChannelId(ucbDto.channel_id, ucbDto.user_id);
  //     if (unMutedSocket) {
  //       this.server.to(unMutedSocket.id).emit('members', members);
  //     }

  //     for (let x of this.connectedUsers) {
  //       let userId = await x.handshake.query.token;
  //       userId = await this.authService.verifyToken(userId);
  //       if (await this.chatService.isMember(ucbDto.channel_id, userId.id)) {
  //         this.server.to(x.id).emit('members', members);
  //       }
  //     }
  //   }
  // }

  // @SubscribeMessage('inviteGame')


}
