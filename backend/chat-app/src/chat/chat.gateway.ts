import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/user/entity/user.entity';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { ChannelDto, DmChannelDto, GroupChannelDto } from './dto/channel-dto';
import { NotFoundError, map } from 'rxjs';
import { ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserType } from './enum/user_type.enum';
import { MessageDto } from './dto/message-dto';
import { JoinChannelDto } from './dto/channel-dto';
import { UcbDto } from './dto/ucb-dto';
import { DmDto } from './dto/dm-dto';
import { ChannelType } from './enum/channel_type.enum';


@WebSocketGateway( {namespace: '/chat'} )
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  
  @WebSocketServer() server: Server;
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private chatService: ChatService) {}

    private userSocketMap = new Map();

    //onGatewayConnection의 메소드, 소켓이 연결되면 호출된다.
    async handleConnection(client: Socket) {
      const user = await this.socketToUser(client);
      if (!user) {
        throw new ForbiddenException('client not identified.');
        return;
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
    }
    
    //OnGatewayDosconnect의 메소드, 소켓 연결이 종료되면 호출된다.
    handleDisconnect(client: any) {
      //내용없음
    }
    
    private async socketToUser(client: Socket): Promise<User> {
      try {
        const token: any = client.handshake.query.token;
        if (!token)
          return null;
    
        const decoded = await this.authService.verifyToken(token);
        const user: User = await this.userService.getProfileByUserId(decoded.id);
        return user;
      }
      catch (error) {
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
        throw new ForbiddenException('client not identified.');
      }
    
      const duplicate = await this.chatService.getChannelByName(groupChannelDto.channelName);
      if (duplicate)
          throw new ConflictException(`channel name ${groupChannelDto.channelName} already exists.`);
    
      const newChannel = await this.chatService.createGroupChannel(user, groupChannelDto);
    
      client.join(newChannel.channel_name);
      this.server.to(newChannel.channel_name).emit("join", user.username);
    
      return newChannel;
    }
    
    @SubscribeMessage('create-dm-channel')
    async onCreateDMhannel(client: Socket, dmChannelDto: DmChannelDto) {
      const user = await this.socketToUser(client);
      if (!user) {
        throw new ForbiddenException('client not identified.');
      }
      
      const exist = await this.chatService.checkDmRoomExists(user.user_id, dmChannelDto.receiverId);
      if (exist) {
        return exist;
      }
    
      const newChannel = await this.chatService.createDmChannel(user, user.user_id, dmChannelDto.receiverId);
      const receiver = await this.userService.getProfileByUserId(dmChannelDto.receiverId);
      if (!receiver) {
        throw new NotFoundException('receiver not found.');
      }
      const receiverSocket = this.userIdToSocket(receiver.user_id);
      if (!receiverSocket) {
        throw new ForbiddenException('receiver not identified.');
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
        throw new ForbiddenException('client not identified.');
      }

      const channel = await this.chatService.getChannelById(joinChannelDto.channel_id);
      if (!channel) {
        throw new NotFoundException(`channel not found.`);
      }

      if (channel.channel_type === ChannelType.PROTECTED) {
        if (!(await this.chatService.checkChannelPassword(channel, joinChannelDto.password))) {
          throw new ForbiddenException('password incorrect');
        }
      }

      await this.chatService.createUCBridge(user, channel, UserType.MEMBER);

      client.join(channel.channel_name);
      this.server.to(channel.channel_name).emit("join", user.nickname);
    }
    
  

  // @SubscribeMessage('createMessage')
  // async onCreateMessage(client: Socket, messageDto: MessageDto) {
  //   await this.definePlayer(client);

  //   if (this.currentUser) {
  //     const member = await this.chatService.isMember(messageDto.channel_id, this.currentUser.user_id);
  //     if (member && messageDto.content !== '' && member.is_muted === false) {
  //       await this.chatService.createMessage(messageDto, this.currentUser);

  //       let userId: any;
  //       let messages: any;
  //       for (let x of this.connectedUsers) {
  //         userId = await x.handshake.query.token;
  //         userId = await this.authService.verifyToken(userId);

  //         if (await this.chatService.isMember(messageDto.channel_id, userId)) {
  //           messages = await this.chatService.getMembersByChannelId(messageDto.channel_id, userId);
  //           this.server.to(x.user_id).emit('sendMessages', messages);
  //         }
  //       }
  //     }
  //   }
  // }

  // @SubscribeMessage('leaveChannel')
  // async onLeaveChannel(client: Socket, channel_id: number) {
  //   await this.definePlayer(client);

  //   if (this.currentUser) {
  //     if (await this.chatService.isMember(channel_id, this.currentUser.user_id)) {
  //       await this.chatService.deleteUCBridge(channel_id, this.currentUser.user_id);
        
  //       let rooms;
  //       let allRooms;
  //       let messages = [];

  //       rooms = await this.chatService.getRoomsForUser(this.currentUser.user_id);
  //       allRooms = await this.chatService.getAllRooms(this.currentUser.user_id);

  //       this.server.to(client.id).emit('message', rooms);
  //       this.server.to(client.id).emit('allRooms', allRooms);        
  //       this.server.to(client.id).emit('sendMessages', messages);

  //       let members = [];
  //       let userId: any;
  //       for (let x of this.connectedUsers) {
  //         userId = await x.handshake.headers.query.token;
  //         userId = await this.authService.verifyToken(userId);

  //         members = await this.chatService.getMembersByChannelId(channel_id, userId.user_id);
  //         if (await this.chatService.isMember(channel_id, userId))
  //           this.server.to(x.id).emit('members', members);
  //       }
  //     }
  //   }
  // }


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


  // @SubscribeMessage('createDM')
  // async onCreateDM(sender: Socket, receiverId: number) {
  //   await this.definePlayer(sender);

  //   if (this.currentUser) {
  //     const room = await this.chatService.checkDMRoomExists(this.currentUser.user_id, receiverId);
  //     if (room) {
  //       let messages = await this.chatService.getDMs(this.currentUser.user_id, receiverId);
  //       this.server.to(this.accessToken.id).emit('sendMessages', messages);
  //     }
  //     else {
  //       const DMRoom = await this.chatService.createDmChannel(this.currentUser.user_id, receiverId);

  //       let allRooms = await this.chatService.getAllRooms(this.currentUser.user_id);
  //       let rooms = await this.chatService.getRoomsForUser(this.currentUser.user_id);

  //       this.server.to(sender.id).emit('allRooms', allRooms);
  //       this.server.to(sender.id).emit('rooms', rooms);

  //       let receiver = await this.getSocketId(receiverId);
  //       if (receiver) {
  //         allRooms = await this.chatService.getAllRooms(receiverId);
  //         rooms = await this.chatService.getRoomsForUser(receiverId);

  //         this.server.to(receiver.id).emit('allRooms', allRooms);
  //         this.server.to(receiver.id).emit('message', rooms);
  //       }
  //     }
  //   }
  // }

  // @SubscribeMessage('sendDM')
  // async onSendDM(sender: Socket, dmDto: DmDto) {
  //   if (dmDto.content !== '') {
  //     await this.definePlayer(sender);

  //     if (this.currentUser) {
  //       let receiverId = dmDto.receiver_id;
  //       let DMRoom = await this.chatService.checkDMRoomExists(this.currentUser.user_id, receiverId);
  //       await this.chatService.createDM(dmDto, this.currentUser, DMRoom.channel_id);
        
  //       let receiverSocket = await this.getSocketId(receiverId);
  //       let DMs = await this.chatService.getDMs(this.currentUser.user_id, receiverId);
  //       if (receiverSocket) {
  //         this.server.to(receiverSocket.id).emit('sendMessage', DMs);
  //       }
  //       this.server.to(sender.id).emit('sendMessage', DMs);
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
