import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/user/entity/user.entity';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { NotFoundError, map } from 'rxjs';
import { ConflictException, ForbiddenException, HttpException, HttpStatus, Logger, NotFoundException, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { UserType } from './enum/user_type.enum';
import { DmChannelDto, JoinGroupChannelDto, GroupChannelDto } from './dto/channel-dto';
import { UpdatePasswordDto, UpdateUserInfoDto } from './dto/update-dto';
import { ChannelType } from './enum/channel_type.enum';
import { DmDto, GroupMessageDto, PreviousMessageDto } from './dto/message-dto';
import { UserStatus } from 'src/user/enum/user-status.enum';
import { UserChannelBridge } from './entity/user-channel-bridge.entity';
import { Channel } from './entity/channel.entity';
import { RelationService } from 'src/relation/relation.service';
import { BlockDto } from 'src/relation/dto/block-dto';
import * as serverConfig from 'config';
import { AcceptGameDto, InviteGameDto } from './dto/game-dto';
import { BridgeDto } from './dto/bridge-dto';

@WebSocketGateway({
	// path: "/api/socket.io",
	namespace: "/chat",
	cors: {
	 	origin: `${serverConfig.get('server.url')}:${serverConfig.get('server.front_port')}`,
	 	credentials: true,
	 	allowedHeaders: 'Content-Type, Authorization, Cookie',
	 	methods: ["GET", "POST"],
	}
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  
  @WebSocketServer() server: Server;
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private relationServie: RelationService,
    private chatService: ChatService) {}
  
  private logger = new Logger('ChatGateway');
  private userSocketMap = new Map();

  //==========================================================================================

  async handleConnection(client: Socket) {
    this.logger.debug("handle connection in");
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('creation-fail', 'Unidentified User Error in handleConnection');
      return ;
    }
  
    client.data.user = user;
    this.userSocketMap.set(user.user_id, client);
  
    const privateChannelName = 'user' + user.user_id.toString();
    const privateChannel = await this.chatService.getChannelByName(privateChannelName)
    if (!privateChannel) {
      await this.chatService.createPrivateChannelAndBridge(user, user.user_id, privateChannelName);
    }
    client.join(privateChannelName);
    
    const joinedGroupChannels = await this.chatService.getJoinedGroupChannelsByUserId(user.user_id);
    for (let c of joinedGroupChannels) {
      client.join(c.channel_name);
    }
  
    const joinedDmChannels = await this.chatService.getJoinedDmChannelsByUserId(user.user_id);
    for (let c of joinedDmChannels) {
      client.join(c.channel_name);
    }
    //socket.except()를 쓰기 위해 blocked와 banned도 있어야 할듯
    this.userService.updateStatus(user.user_id, UserStatus.ONLINE);
  }
  
  //==========================================================================================
  
  async handleDisconnect(client: any) {
    const user = await this.socketToUser(client);
    if (user) {
      this.userSocketMap.delete(user.user_id);
      this.userService.updateStatus(user.user_id, UserStatus.OFFLINE);
      this.userSocketMap.delete(user.user_id);
    }
    client.disconnect();
  }

  //==========================================================================================
    
  private async socketToUser(client: Socket): Promise<User> {
    // exception 날리지 않고 disconnect하도록 수정
    const token: any = client.handshake.query.token;
    if (!token) {
      // throw new HttpException('Unauthorized Token', HttpStatus.UNAUTHORIZED);
      this.logger.debug('Null Token');
      // client.emit('disconnect');
      // client.disconnect();
      return;
    }
  
    try {
      const decoded = await this.authService.verifyToken(token);
      const user: User = await this.userService.getProfileByUserId(decoded.id);
      return user;
    }
    catch (err) {
        this.logger.debug(err);
        client.emit('disconnect');
        client.disconnect();
        return;
    }
  }
  
  //==========================================================================================

  private userIdToSocket(userId: number): Socket {
    return this.userSocketMap.get(userId);
  }

  //==========================================================================================
  
  @SubscribeMessage('create-group-channel')
  async onCreateGroupChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() groupChannelDto: GroupChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('creation-fail', 'Unidentified User Error in onCreateGroupChannel');
      return ;
    }
  
    const duplicate = await this.chatService.getChannelByName(groupChannelDto.channelName);
    if (duplicate) {
      client.emit('creation-fail', 'Duplicate Channel Name Error in onCreateGroupChannel');
      return ;
    }
  
    const newChannel = await this.chatService.createGroupChannelAndBridge(user, groupChannelDto);
    const newBridge = await this.chatService.checkUserInThisChannel(user.user_id, newChannel.channel_id);

    client.emit('creation-success', {channel_id: newChannel.channel_id, user_type: newBridge.user_type});
    client.join(newChannel.channel_name);
    this.server.to(newChannel.channel_name).emit("join", {user_id: user.user_id, user_nickname: user.nickname});

    //return newChannel;
  }

  //==========================================================================================
    
  @SubscribeMessage('create-dm-channel')
  async onCreateDmChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody()dmChannelDto: DmChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('creation-dm-fail', 'Unidentified User Error in onCreateDmChannel');
      return ;
    }
    
    const receiver = await this.userService.getProfileByUserId(dmChannelDto.receiverId);
    if (!receiver) {
      client.emit('creation-dm-fail', 'Receiver Not Found Error in onCreateDmChannel');
      return ;
    }

    const receiverSocket = this.userIdToSocket(receiver.user_id);
    if (!receiverSocket) {
      client.emit('creation-dm-fail', 'Unidentified Receiver User Error in onCreateDmChannel');
      return ;
    }
    
    //만약 closeChannelWindow나 leaveChannel로 dm방을 나가버리면, 이 예외처리문에서 걸려서 다시 들어오지 못한다.
    //dm방 생성이 안되게 하는 것은 맞는것 같은데.. 그럼 joinDmChannel 함수를 새로 만들어야 하나?
    const exist = await this.chatService.checkDmRoomExists(user.user_id, dmChannelDto.receiverId);
    if (exist) {
      client.emit('creation-dm-fail', 'Already Exists DmChannel Error in onCreateDmChannel');
      return ;
    }
    
    const newChannel = await this.chatService.createDmChannelAndBridges(user, user.user_id, dmChannelDto.receiverId);
    const newBridge = await this.chatService.checkUserInThisChannel(user.user_id, newChannel.channel_id);
    const newReceiverBridge = await this.chatService.checkUserInThisChannel(receiver.user_id, newChannel.channel_id);
  
    client.join(newChannel.channel_name);
    receiverSocket.join(newChannel.channel_name);

    client.emit('creation-dm-success', {channel_id: newChannel.channel_id, user_type: newBridge.user_type});
    receiverSocket.emit('creation-dm-success', {channel_id: newChannel.channel_id, user_type: newReceiverBridge.user_type});

    this.server.to(newChannel.channel_name).emit("join", {user_id: user.user_id, user_nickname: user.nickname});
    this.server.to(newChannel.channel_name).emit("join", {user_id: receiver.user_id, user_nickname: receiver.nickname});
  }

  //==========================================================================================  

  @SubscribeMessage('join-group-channel')
  async onJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinGroupChannelDto: JoinGroupChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('join-fail', 'Unidentified User Error in onJoinChannel');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, joinGroupChannelDto.channelId);
    if (bridge && bridge.is_banned) {
      client.emit('join-fail', 'Banned User Error in onJoinChannel');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(joinGroupChannelDto.channelId);
    if (!channel) {
      client.emit('join-fail', 'Unexist Channel Error in onJoinChannel');
      return ;
    }
    
    if (channel.channel_type === ChannelType.PROTECTED) {
      if (!(await this.chatService.checkChannelPassword(channel, joinGroupChannelDto.password))) {
        client.emit('join-fail', 'Incorrect Password Error in onJoinChannel');
        return ;
      }
    }

    await this.chatService.createUCBridge(user, channel, UserType.MEMBER);
    const newBridge = await this.chatService.checkUserInThisChannel(user.user_id, channel.channel_id);

    let inners: BridgeDto[] = [];
    inners = await this.chatService.getAllUsersInChannelByChannelId(channel.channel_id);

    let previousMessages: PreviousMessageDto[] = [];
    previousMessages = await this.chatService.getAllMessagesExceptBlockByChannelId(user.user_id, channel.channel_id);

    client.join(channel.channel_name);

    client.emit('join-success', {channel_id: channel.channel_id, user_type: newBridge.user_type});
    // client.emit('get-users-channel', inners);

    this.server.to(channel.channel_name).emit("messages", previousMessages);
    this.server.to(channel.channel_name).emit("join", {userId: user.user_id, userNickname: user.nickname});
  }

  //==========================================================================================
  // @SubscribeMessage('join-dm-channel')
  // async onDmChannel(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() dmChannelDto: DmChannelDto) {


  //   }

  //==========================================================================================

  @SubscribeMessage('post-group-message')
  async onPostGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() groupMessageDto: GroupMessageDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('post-fail', 'Unidentified User Error in onPostGroupMessage');
      return ;
    }
    
    if (groupMessageDto.content === '') {
      client.emit('post-fail', 'Empty Content Error in onPostGroupMessage');
      return ;
    }
    const channel = await this.chatService.getChannelById(groupMessageDto.channel_id);
    if (!channel) {
      client.emit('post-fail', 'Unexist Channel Error in onPostGroupMessage');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channel.channel_id);
    if (!bridge || bridge.is_muted || bridge.is_banned) { //is_banned는 검사 안해도 될 듯
      client.emit('post-fail', 'Cannot Post Message Error in onPostGroupMessage');
      return ;
    }

    const messageEntity = await this.chatService.createGroupMessage(user, channel, groupMessageDto.content);
		const newMessage = messageEntity.content;

    let listOfWhoBlockedMe: BlockDto[] = [];
    listOfWhoBlockedMe = await this.relationServie.getEveryoneWhoBlockedMe(user.user_id);
    
    //현재 user를 block한 사람들에게는 메세지가 가지 않도록
    this.server.to(channel.channel_name).fetchSockets()
      .then((sockets) => { 
        sockets.forEach((socket) => { 
          let user = socket.data.user;
          if (listOfWhoBlockedMe.includes(user.user_id)) {
            socket.emit("message", {message: newMessage, user_id: user.user_id, user_nickname: user.nickname});
          }
        })
      });

    //채널 전체에 메세지 발송
    //this.server.to(channel.channel_name).emit('message', {message: newMessage, user_id: user.user_id, user_nickname: user.nickname});
		console.log("'post-group-message'");
   	client.emit("message", {message: newMessage, user_id: user.user_id, user_nickname: user.nickname});
    //return newMessage;
  }

  //==========================================================================================

  @SubscribeMessage('post-dm')
  async onPostDm(
    @ConnectedSocket() client: Socket,
    @MessageBody() dmDto: DmDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('post-dm-fail', 'Unidentified User Error in onPostDm');
      return ;
    } 
    
    if (dmDto.content === '') {
      client.emit('post-dm-fail', 'Empty Content Error in onPostDm');
      return ;
    }

    const channel = await this.chatService.checkDmRoomExists(user.user_id, dmDto.receiver_id);
    if (!channel) {
      client.emit('post-dm-fail', 'Unexist Channel Error in onPostDm');
      return ;
    }
    // block 검사 필요

    const newMessage = await this.chatService.createDM(user, channel, dmDto.content);

    this.server.to(channel.channel_name).emit('message', {message: newMessage, user_id: user.user_id, user_nickname: user.nickname});
    client.emit('post-dm-success', channel.channel_id);
  }

  //==========================================================================================

  @SubscribeMessage('leave-channel')
  async onLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: number) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('leave-fail', 'Unidentified User Error in onLeaveChannel');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
    if (!bridge) {
      client.emit('leave-fail', 'Unexist Bridge Error in onLeaveChannel');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      client.emit('leave-fail', 'Unexist Channel Error in onLeaveChannel');
      return ;
    }

    await this.chatService.deleteUCBridge(user.user_id, channelId);
    client.leave(channel.channel_name);
    client.emit('leave-success', channel.channel_id);
    this.server.to(channel.channel_name).emit("leave", {user_id: user.user_id, user_nickname: user.nickname});

    try {
      await this.chatService.deleteChannelIfEmpty(channelId);
    } catch (ServiceUnavailableException) {
      client.emit('leave-fail', 'Channel Not Deleted Error in onLeaveChannel')
    }
  }

  //==========================================================================================

  @SubscribeMessage('close-channel-window')
  async onCloseChannelWindow(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: number) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('close-fail', 'Unidentified User Error in onCloseChannelWindow');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
    if (!bridge) {
      client.emit('close-fail', 'Unexist Bridge Error in onCloseChannelWindow');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      client.emit('close-fail', 'Unexist Channel Error in onCloseChannelWindow');
      return ;
    }

    //await this.chatService.deleteUCBridge(user.user_id, channelId);
    client.leave(channel.channel_name);
    client.emit('close-success', channel.channel_id);
    this.server.to(channel.channel_name).emit("leave", {user_id: user.user_id, user_nickname: user.nickname});
    //this.server.to(channel.channel_name).emit(`user ${user.nickname} has left`);

    //await this.chatService.deleteChannelIfEmpty(channelId);
  }

  //==========================================================================================

  @SubscribeMessage('set-admin')
  async onSetAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('usermod-fail', 'Unidentified User Error in onSetAdmin');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!bridge) {
      client.emit('usermod-fail', 'Unidentified User Error in onSetAdmin');
      return ;
    }
    if (bridge.user_type !== UserType.OWNER) {
      client.emit('usermod-fail', 'Cannot Set Admin Error in onSetAdmin');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      client.emit('usermod-fail', 'Unexist Channel Error in onSetAdmin');
      return ;
    }

    await this.chatService.updateUserTypeOfUCBridge(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId, UserType.ADMIN);

    const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
    client.emit('usermod-success', channel.channel_id);
    this.server.to(channel.channel_name).emit("admin", {user_id: targetUser.user_id, user_nickname: targetUser.nickname});
  }

  //==========================================================================================
  // set-password change-password 하나로 합치기
  @SubscribeMessage('set-password')
  async onSetPassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() updatePasswordDto: UpdatePasswordDto) {
		console.log(`/chat/set-password: value=${JSON.stringify(updatePasswordDto)}`);
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('setpwd-fail', 'Unidentified User Error in onSetPassword');
      return ;
    }
    
    // if (updatePasswordDto.password === '') {
    //   client.emit('setpwd-fail', 'Empty Password Error in onSetPassword');
    //   return ;
    // }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updatePasswordDto.channelId);
    if (!bridge) {
      client.emit('setpwd-fail', 'Unexist Bridge Error in onSetPassword');
      return ;
    }
    if (bridge.user_type !== UserType.OWNER) {
      client.emit('setpwd-fail', 'Cannot Set Password Error in onSetPassword');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(updatePasswordDto.channelId);
    if (!channel) {
      client.emit('setpwd-fail', 'Unexist Channel Error in onSetPassword');
      return ;
    }

    await this.chatService.updatePassword(channel, updatePasswordDto.password);
    client.emit('setpwd-success', channel.channel_id);
    this.server.to(channel.channel_name).emit('password setted');
  }

  //==========================================================================================

  // @SubscribeMessage('change-password')
  // async onChangePassword(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() updatePasswordDto: UpdatePasswordDto) {
  //   const user = await this.socketToUser(client);
  //   if (!user) {
  //     client.emit('changepwd-fail', 'Unidentified User Error in onChangePassword');
  //     return ;
  //   }
    
  //   const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updatePasswordDto.channelId);
  //   if (!bridge) {
  //     client.emit('changepwd-fail', 'Unexist Bridge Error in onChangePassword');
  //     return ;
  //   }
  //   if (bridge.user_type !== UserType.OWNER) {
  //     client.emit('changepwd-fail', 'Cannot Set Password Error in onChangePassword');
  //     return ;
  //   }
    
  //   const channel = await this.chatService.getChannelById(updatePasswordDto.channelId);
  //   if (!channel) {
  //     client.emit('changepwd-fail', 'Unexist Channel Error in onChangePassword');
  //     return ;
  //   }

  //   await this.chatService.updatePassword(channel, updatePasswordDto.password);
  //   client.emit('changepwd-success', channel.channel_id);
  //   this.server.to(channel.channel_name).emit('password updated');
  // }

  //==========================================================================================

  @SubscribeMessage('remove-password')
  async onRemovePassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: number) {
		console.log(`/chat/remove-password: value=${channelId}, type=${typeof(channelId)}`);
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('removepwd-fail', 'Unidentified User Error in onRemovePassword');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
    if (!bridge) {
      client.emit('removepwd-fail', 'Unexist Bridge Error in onRemovePassword');
      return ;
    }
    if (bridge.user_type !== UserType.OWNER) {
      client.emit('removepwd-fail', 'Cannot Set Password Error in onRemovePassword');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      client.emit('removepwd-fail', 'Unexist Channel Error in onRemovePassword');
      return ;
    }

    await this.chatService.removePassword(channel);
    client.emit('removepwd-success', channel.channel_id);
    this.server.to(channel.channel_name).emit('password removed');
  }

  //==========================================================================================

  @SubscribeMessage('kick-user')
  async onKickUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('usermod-fail', 'Unidentified User Error in onKickUser');
      return ;
    }
    
    const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!userBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onKickUser');
      return ;
    }
    if (userBridge.user_type !== UserType.OWNER && userBridge.user_type !== UserType.ADMIN) {
      client.emit('usermod-fail', 'Member Cannot Kick User Error in onKickUser');
      return ;
    }

    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      client.emit('usermod-fail', 'Unexist Channel Error in onKickUser');
      return ;
    }
    if (channel.channel_type === ChannelType.DM) {
      client.emit('usermod-fail', 'Cannot Kick User On DM Channel Error in onKickUser');
      return ;
    }
    
    const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
    if (!targetUser) {
      client.emit('usermod-fail', 'Unexist Target User Error in onKickUser');
      return ;
    }

    const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    if (!targetBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onKickUser');
      return ;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      client.emit('usermod-fail', 'Cannot Kick Owner Error in onKickUser');
      return ;
    }

    const targetUserSocket = this.userIdToSocket(targetUser.user_id);
    if (!targetUserSocket) {
      client.emit('invite-game-fail', 'Unidentified Target User Socket Error in onKickUser');
      return ;
    }

    await this.chatService.deleteUCBridge(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);

    targetUserSocket.leave(channel.channel_name);

    client.emit('usermod-success', channel.channel_id);
    targetUserSocket.emit('got-kicked', channel.channel_id);

    this.server.to(channel.channel_name).emit("kick", {user_id: targetUser.user_id, user_nickname: targetUser.nickname});
  }

  //==========================================================================================

  @SubscribeMessage('ban-User')
  async onBanUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('usermod-fail', 'Unidentified User Error in onBanUser');
      return ;
    }
    
    const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!userBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onBanUser');
      return ;
    }
    if (userBridge.user_type !== UserType.OWNER && userBridge.user_type !== UserType.ADMIN) {
      client.emit('usermod-fail', 'Member Cannot Ban Others Error in onBanUser');
      return ;
    }

    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      client.emit('usermod-fail', 'Unexist Channel Error in onBanUser');
      return ;
    }
    if (channel.channel_type === ChannelType.DM) {
      client.emit('usermod-fail', 'Cannot Ban User On DM Channel Error in onBanUser');
      return ;
    }
    
    const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
    if (!targetUser) {
      client.emit('usermod-fail', 'Unexist Target User Error in onBanUser');
      return ;
    }

    const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    if (!targetBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onBanUser');
      return ;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      client.emit('usermod-fail', 'Cannot Ban Owner Error in onBanUser');
      return ;
    }
    if (targetBridge.is_banned) {
      client.emit('usermod-fail', 'Target User Already Banned Error in onBanUser');
      return ;
    }

    const targetUserSocket = this.userIdToSocket(targetUser.user_id);
    if (!targetUserSocket) {
      client.emit('usermod-fail', 'Unidentified Target User Socket Error in onBanUser');
      return ;
    }

    await this.chatService.updateBanStatus(targetBridge, true);

    targetUserSocket.leave(channel.channel_name);

    client.emit('usermod-success', channel.channel_id);
    targetUserSocket.emit('got-banned', channel.channel_id);

    this.server.to(channel.channel_name).emit("ban", {user_id: targetUser.user_id, user_nickname: targetUser.nickname});
  }

  //==========================================================================================

  @SubscribeMessage('onMuteUser')
  async OnMuteUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('usermod-fail', 'Unidentified User Error in onMuteUser');
      return ;
    }
    
    const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!userBridge) {
      client.emit('onmute-fail', 'Unexist Bridge Error in onMuteUser');
      return ;
    }
    if (userBridge.user_type !== UserType.OWNER && userBridge.user_type !== UserType.ADMIN) {
      client.emit('onmute-fail', 'Member Cannot Mute Others Error in onMuteUser');
      return ;
    }

    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      client.emit('usermod-fail', 'Unexist Channel Error in onMuteUser');
      return ;
    }
    if (channel.channel_type === ChannelType.DM) {
      client.emit('usermod-fail', 'Cannot Mute User On DM Channel Error in onMuteUser');
      return ;
    }
    
    const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
    if (!targetUser) {
      client.emit('usermod-fail', 'Unexist Target User Error in onMuteUser');
      return ;
    }
    
    const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    if (!targetBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onMuteUser');
      return ;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      client.emit('usermod-fail', 'Cannot Mute Owner Error in onMuteUser');
      return ;
    }
    if (targetBridge.is_muted) {
      client.emit('usermod-fail', 'Target User Already Muted Error in onMuteUser');
      return ;
    }

    const targetUserSocket = this.userIdToSocket(targetUser.user_id);
    if (!targetUserSocket) {
      client.emit('usermod-fail', 'Unidentified Target User Socket Error in onMuteUser');
      return ;
    }

    await this.chatService.updateMuteStatus(targetBridge, true);

    client.emit('usermod-success', channel.channel_id);
    targetUserSocket.emit('got-mutted', channel.channel_id);

    this.server.to(channel.channel_name).emit("mute", {user_id: targetUser.user_id, user_nickname: targetUser.nickname});
    
    setTimeout(() => {
      this.unmuteUser(user, channel, targetUser, targetBridge);
    }, 10 * 1000);
  }

  //==========================================================================================
  
  private async unmuteUser(user: User, channel: Channel, targetUser: User, targetBridge: UserChannelBridge) {
    await this.chatService.updateMuteStatus(targetBridge, false);

    this.server.to(channel.channel_name).emit("unmute", {user_id: targetUser.user_id, user_nickname: targetUser.nickname});
  }

  //==========================================================================================

  @SubscribeMessage('invite-game')
  async onInviteGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() inviteGameDto: InviteGameDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('invite-game-fail', 'Unidentified User Error in onInviteGame');
      return ;
    }

    const targetUser = await this.userService.getProfileByUserId(inviteGameDto.targetUserId);
    if (!targetUser) {
      client.emit('invite-game-fail', 'Unidentified Target User Error in onInviteGame');
      return ;
    }
    if (targetUser.status === UserStatus.PLAYING) {
      client.emit('invite-game-fail', 'Target User PLAYING Error in onInviteGame');
      return ;
    }
    if (targetUser.status === UserStatus.OFFLINE) {
      client.emit('invite-game-fail', 'Target User OFFLINE Error in onInviteGame');
      return ;
    }

    const targetUserSocket = this.userIdToSocket(targetUser.user_id);
    if (!targetUserSocket) {
      client.emit('invite-game-fail', 'Unidentified Target User Socket Error in onInviteGame');
      return ;
    }

    //targetUser에게 game invitation을 보냈습니다.
    client.emit('invite-game-success', {user_id: targetUser.user_id, user_nickname: targetUser.nickname});
    //user가 [inviteGameDto.game_mode] 모드 game invitaion을 보냈습니다.
    targetUserSocket.emit('got-invited', {user_id: user.user_id, user_nickname: user.nickname, gameMode: inviteGameDto.gameMode});
  }

  //==========================================================================================

  @SubscribeMessage('accept-game')
  async onAcceptGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() acceptGameDto: AcceptGameDto) {
      const invitedUser = await this.socketToUser(client);
      if (!invitedUser) {
        client.emit('accept-game-fail', 'Unidentified Invited User Error in onAcceptGame');
        return ;
      }

      const hostUserSocket = this.userIdToSocket(acceptGameDto.hostUserId);
      if (!hostUserSocket) {
        client.emit('accept-game-fail', 'Unidentified Host User Socket Error in onAcceptGame');
      }

      client.emit('accept-game-success', 'accepted');
      hostUserSocket.emit('accept-game-success', 'accepted');

      this.server.of('/game').emit('launchGame', {hostUserSocket: hostUserSocket, invitedUserSocket: client, gameMode: acceptGameDto.gameMode})
  }

  //==========================================================================================

  @SubscribeMessage('decline-game')
  async onDeclineGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() hostId: number) {
      const invitedUser = await this.socketToUser(client);
      if (!invitedUser) {
        client.emit('decline-game-fail', 'Unidentified Invited User Error in onDeclineGame');
        return ;
      }

      const hostUserSocket = this.userIdToSocket(hostId);
      if (!hostUserSocket) {
        client.emit('decline-game-fail', 'Unidentified Host User Socket Error in onDeclineGame');
      }

      hostUserSocket.emit('decline-game-success', 'declined');
      client.emit('decline-game-success', 'declined');
  }

}
