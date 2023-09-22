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
import { DmChannelDto, JoinChannelDto, GroupChannelDto } from './dto/channel-dto';
import { UpdatePasswordDto, UpdateUserInfoDto } from './dto/update-dto';
import { ChannelType } from './enum/channel_type.enum';
import { DmDto, GroupMessageDto } from './dto/message-dto';
import { UserStatus } from 'src/user/enum/user-status.enum';
import { UserChannelBridge } from './entity/user-channel-bridge.entity';
import { Channel } from './entity/channel.entity';

//아래 내용은 확인이 더 필요!
@WebSocketGateway({
	// path: "/api/socket.io",
	namespace: "/chat",
	cors: {
	 	origin: "http://localhost:3001",
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
    private chatService: ChatService) {}
  
  private logger = new Logger('ChatGateway');
  private userSocketMap = new Map();

  //onGatewayConnection의 메소드, 소켓이 연결되면 호출된다.
  async handleConnection(client: Socket) {
    this.logger.debug("handle connection in");
    const user = await this.socketToUser(client);
    if (!user) {
    // NOTE: exception is not handled and program stops
      // //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);

      client.emit('creation-fail', 'Unidentified User Error in handleConnection');
      return ;

      //가능한 방법들
      //0. throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED); auth모듈에 있는 HttpException.filter.ts로 감
      // 1. return { statusCode: HttpStatus.UNAUTHORIZED, message: 'Unidentified User' };
      //2. client.disconnect(); 에러 표현 없이 소켓 disconnect 안됨
      //3. wsException() 날리기
      //4. 그냥 return ;
    }
  
    client.data.user = user;
    this.userSocketMap.set(user.user_id, client);
  
    const privateChannelName = 'user' + user.user_id.toString();
    const privateChannel = await this.chatService.getChannelByName(privateChannelName)
    if (!privateChannel) {
      await this.chatService.createPrivateChannel(user, user.user_id, privateChannelName);
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
  
  //OnGatewayDosconnect의 메소드, 소켓 연결이 종료되면 호출된다.
  async handleDisconnect(client: any) {
    const user = await this.socketToUser(client);
    if (user) {
      this.userSocketMap.delete(user.user_id);
    }
    this.userSocketMap.delete(user.user_id);
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
  async onCreateGroupChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() groupChannelDto: GroupChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //이벤트명 'creation-fail' 로 통일해서 메세지만 다르게 보내기
      //client.emit('creation-fail', 'fail');
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('creation-fail', 'Unidentified User Error in onCreateGroupChannel');
      return ;
    }
  
    const duplicate = await this.chatService.getChannelByName(groupChannelDto.channelName);
    if (duplicate) {
      //exception handler
      // this.logger.debug('Duplicate Channel Name');
      // throw new HttpException(`Duplicate Channel Name`, HttpStatus.UNAUTHORIZED);
      client.emit('creation-fail', 'Duplicate Channel Name Error in onCreateGroupChannel');
      return ;
      //this.server.to('user' + user.user_id.toString()).emit('creation-fail', 'Duplicate Channel Name Error in onCreateGroupChannel');
    }
  
    const newChannel = await this.chatService.createGroupChannel(user, groupChannelDto);
  
    //성공 했을 때 채널 고유 아이디를 그 클라이언트한테 emit
    client.emit('creation-success', newChannel.channel_id);
    client.join(newChannel.channel_name);
    this.server.to(newChannel.channel_name).emit("join", user.username);

    //return newChannel;
  }
    
  @SubscribeMessage('create-dm-channel')
  async onCreateDmChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody()dmChannelDto: DmChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('creation-dm-fail', 'Unidentified User Error in onCreateDmChannel');
      return ;
    }
    
    const exist = await this.chatService.checkDmRoomExists(user.user_id, dmChannelDto.receiverId);
    if (exist) {
      //exception handler
      // this.logger.debug('dmRoom already exists');
      // throw new HttpException('dmRoom already exists', HttpStatus.UNAUTHORIZED);
      client.emit('creation-dm-fail', 'dmRoom already exists Error in onCreateDmChannel');
      return ;
    }
    
    const newChannel = await this.chatService.createDmChannel(user, user.user_id, dmChannelDto.receiverId);
    const receiver = await this.userService.getProfileByUserId(dmChannelDto.receiverId);
    if (!receiver) {
      //exception handler
      // this.logger.debug('receiver not found.');
      // throw new HttpException('receiver not found.', HttpStatus.UNAUTHORIZED);
      client.emit('creation-dm-fail', 'receiver not found Error in onCreateDmChannel');
      return ;
    }
    const receiverSocket = this.userIdToSocket(receiver.user_id);
    if (!receiverSocket) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('creation-dm-fail', 'Unidentified User Error in onCreateDmChannel');
      return ;
    }
  
    client.join(newChannel.channel_name);
    receiverSocket.join(newChannel.channel_name);

    client.emit('creation-dm-success', newChannel.channel_id);
    receiverSocket.emit('creation-dm-success', newChannel.channel_id);

    this.server.to(newChannel.channel_name).emit("join", user.nickname);
    this.server.to(newChannel.channel_name).emit("join", receiver.nickname);
  
    //return newChannel;
  }
    
  @SubscribeMessage('join-group-channel')
  async onJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinChannelDto: JoinChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('join-fail', 'Unidentified User Error in onJoinChannel');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, joinChannelDto.channelId);
    if (bridge && bridge.is_banned) {
      // this.logger.debug('Bannde User');
      // throw new HttpException('Bannde User', HttpStatus.UNAUTHORIZED);
      client.emit('join-fail', 'Bannde User Error in onJoinChannel');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(joinChannelDto.channelId);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('join-fail', 'Unexist Channel Error in onJoinChannel');
      return ;
    }
    
    if (channel.channel_type === ChannelType.PROTECTED) {
      if (!(await this.chatService.checkChannelPassword(channel, joinChannelDto.password))) {
        //exception handler
        // this.logger.debug('Incorrect Password');
        // throw new HttpException('Incorrect Password', HttpStatus.UNAUTHORIZED);
        client.emit('join-fail', 'Incorrect Password Error in onJoinChannel');
        return ;
      }
    }

    await this.chatService.createUCBridge(user, channel, UserType.MEMBER);

    let inners = await this.chatService.getAllUsersInChannelByChannelId(channel.channel_id);

    client.join(channel.channel_name);
    client.emit('join-success', channel.channel_id);
    //client.emit('', inners); -> 이벤트명 뭐로할까여!
    this.server.to(channel.channel_name).emit("join", user.nickname);
  }
 
  @SubscribeMessage('post-group-message')
  async onPostGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() groupMessageDto: GroupMessageDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('post-fail', 'Unidentified User Error in onPostGroupMessage');
      return ;
    }
    
    if (groupMessageDto.content === '') {
      //exception handler
      // this.logger.debug('Empty Content');
      // throw new HttpException('Empty Content', HttpStatus.UNAUTHORIZED);
      client.emit('post-fail', 'Empty Content Error in onPostGroupMessage');
      return ;
    }
    const channel = await this.chatService.getChannelById(groupMessageDto.channel_id);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('post-fail', 'Unexist Channel Error in onPostGroupMessage');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channel.channel_id);
    if (!bridge || bridge.is_muted || bridge.is_banned) { //is_banned는 검사 안해도 될 듯
      //exception handler
      // this.logger.debug('Cannot Post Message');
      // throw new HttpException('Cannot Post Message', HttpStatus.UNAUTHORIZED);
      client.emit('post-fail', 'Cannot Post Message Error in onPostGroupMessage');
      return ;
    }
    //블락 검사 필요

    const newMessage = await this.chatService.createGroupMessage(user, channel, groupMessageDto.content);

    this.server.to(channel.channel_name).emit('message', newMessage);
    client.emit('post-success', channel.channel_id);
    //return newMessage;
  }

  @SubscribeMessage('post-dm')
  async onPostDm(
    @ConnectedSocket() client: Socket,
    @MessageBody() dmDto: DmDto) {
      const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('post-dm-fail', 'Unidentified User Error in onPostDm');
      return ;
    } 
    
    if (dmDto.content === '') {
      //exception handler
      // this.logger.debug('Empty Content');
      // throw new HttpException('Empty Content', HttpStatus.UNAUTHORIZED); 
      client.emit('post-dm-fail', 'Empty Content Error in onPostDm');
      return ;
    }
    const channel = await this.chatService.checkDmRoomExists(user.user_id, dmDto.receiver_id);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('post-dm-fail', 'Unexist Channel Error in onPostDm');
      return ;
    }
    // block 검사 필요

    const newMessage = await this.chatService.createDM(user, channel, dmDto.content);

    this.server.to(channel.channel_name).emit('message', newMessage);
    client.emit('post-dm-success', channel.channel_id);
    //return newMessage;
  }

  @SubscribeMessage('leave-channel')
  async onLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: number) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('leave-fail', 'Unidentified User Error in onLeaveChannel');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
    if (!bridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('leave-fail', 'Unexist Bridge Error in onLeaveChannel');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('leave-fail', 'Unexist Channel Error in onLeaveChannel');
      return ;
    }

    await this.chatService.deleteUCBridge(user.user_id, channelId);
    client.leave(channel.channel_name);
    client.emit('leave-success', channel.channel_id);
    this.server.to(channel.channel_name).emit(`user ${user.nickname} has left`);

    await this.chatService.deleteChannelIfEmpty(channelId);
  }

  @SubscribeMessage('set-admin')
  async onSetAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('admin-fail', 'Unidentified User Error in onSetAdmin');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!bridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('admin-fail', 'Unidentified User Error in onSetAdmin');
      return ;
    }
    if (bridge.user_type !== UserType.OWNER) {
      //exception handler
      // this.logger.debug('Cannot Set Admin');
      // throw new HttpException('Cannot Set Admin', HttpStatus.UNAUTHORIZED);
      client.emit('admin-fail', 'Cannot Set Admin Error in onSetAdmin');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('admin-fail', 'Unexist Channel Error in onSetAdmin');
      return ;
    }

    await this.chatService.updateUserTypeOfUCBridge(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId, UserType.ADMIN);

    const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
    client.emit('admin-success', channel.channel_id);
    this.server.to(channel.channel_name).emit("admin", targetUser.nickname);
  }

  @SubscribeMessage('set-password')
  async onSetPassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() updatePasswordDto: UpdatePasswordDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('setpwd-fail', 'Unidentified User Error in onSetPassword');
      return ;
    }
    
    if (updatePasswordDto.password === '') {
      //exception handler
      // this.logger.debug('Empty Password');
      // throw new HttpException('Empty Password', HttpStatus.UNAUTHORIZED);
      client.emit('setpwd-fail', 'Empty Password Error in onSetPassword');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updatePasswordDto.channelId);
    if (!bridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('setpwd-fail', 'Unexist Bridge Error in onSetPassword');
      return ;
    }
    if (bridge.user_type !== UserType.OWNER) {
      //exception handler
      // this.logger.debug('Cannot Set Password');
      // throw new HttpException('Cannot Set Password', HttpStatus.UNAUTHORIZED);
      client.emit('setpwd-fail', 'Cannot Set Password Error in onSetPassword');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(updatePasswordDto.channelId);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('setpwd-fail', 'Unexist Channel Error in onSetPassword');
      return ;
    }

    await this.chatService.updatePassword(channel, updatePasswordDto.password);
    client.emit('setpwd-success', channel.channel_id);
    this.server.to(channel.channel_name).emit('password setted');
  }

  @SubscribeMessage('change-password')
  async onChangePassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() updatePasswordDto: UpdatePasswordDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('changepwd-fail', 'Unidentified User Error in onChangePassword');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updatePasswordDto.channelId);
    if (!bridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('changepwd-fail', 'Unexist Bridge Error in onChangePassword');
      return ;
    }
    if (bridge.user_type !== UserType.OWNER) {
      //exception handler
      // this.logger.debug('Cannot Set Password');
      // throw new HttpException('Cannot Set Password', HttpStatus.UNAUTHORIZED);
      client.emit('changepwd-fail', 'Cannot Set Password Error in onChangePassword');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(updatePasswordDto.channelId);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('changepwd-fail', 'Unexist Channel Error in onChangePassword');
      return ;
    }

    await this.chatService.updatePassword(channel, updatePasswordDto.password);
    client.emit('changepwd-success', channel.channel_id);
    this.server.to(channel.channel_name).emit('password updated');
  }

  @SubscribeMessage('remove-password')
  async onRemovePassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: number) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('removepwd-fail', 'Unidentified User Error in onRemovePassword');
      return ;
    }
    
    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
    if (!bridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('removepwd-fail', 'Unexist Bridge Error in onRemovePassword');
      return ;
    }
    if (bridge.user_type !== UserType.OWNER) {
      //exception handler
      // this.logger.debug('Cannot Set Password');
      // throw new HttpException('Cannot Set Password', HttpStatus.UNAUTHORIZED);
      client.emit('removepwd-fail', 'Cannot Set Password Error in onRemovePassword');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('removepwd-fail', 'Unexist Channel Error in onRemovePassword');
      return ;
    }

    await this.chatService.removePassword(channel);
    client.emit('removepwd-success', channel.channel_id);
    this.server.to(channel.channel_name).emit('password removed');
  }

  @SubscribeMessage('kick-user')
  async onKickUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('kick-fail', 'Unidentified User Error in onKickUser');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('kick-fail', 'Unexist Channel Error in onKickUser');
      return ;
    }
    if (channel.channel_type === ChannelType.DM) {
      //exception handler
      // this.logger.debug('Cannot Kick User On DM Channel');
      // throw new HttpException('Cannot Kick User On DM Channel', HttpStatus.UNAUTHORIZED);
      client.emit('kick-fail', 'Cannot Kick User On DM Channel Error in onKickUser');
      return ;
    }
    
    const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!userBridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('kick-fail', 'Unexist Bridge Error in onKickUser');
      return ;
    }
    if (userBridge.user_type !== UserType.OWNER && userBridge.user_type !== UserType.ADMIN) {
      //exception handler
      // this.logger.debug('Member Cannot Kick User');
      // throw new HttpException('Member Cannot Kick User', HttpStatus.UNAUTHORIZED);
      client.emit('kick-fail', 'Member Cannot Kick User Error in onKickUser');
      return ;
    }
    
    const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    if (!targetBridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('kick-fail', 'Unexist Bridge Error in onKickUser');
      return ;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      //exception handler
      // this.logger.debug('Cannot Kick Owner');
      // throw new HttpException('Cannot Kick Owner', HttpStatus.UNAUTHORIZED);
      client.emit('kick-fail', 'Cannot Kick Owner Error in onKickUser');
      return ;
    }

    await this.chatService.deleteUCBridge(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    client.leave(channel.channel_name);
    client.emit('kick-success', channel.channel_id);
    this.server.to(channel.channel_name).emit(`user ${user.nickname} is kicked.`);
  }

  @SubscribeMessage('ban-User')
  async onBanUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('ban-fail', 'Unidentified User Error in onBanUser');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('ban-fail', 'Unexist Channel Error in onBanUser');
      return ;
    }
    if (channel.channel_type === ChannelType.DM) {
      //exception handler
      // this.logger.debug('Cannot Ban User On DM Channel');
      // throw new HttpException('Cannot Ban User On DM Channel', HttpStatus.UNAUTHORIZED);
      client.emit('ban-fail', 'Cannot Ban User On DM Channel Error in onBanUser');
      return ;
    }

    const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!userBridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('ban-fail', 'Unexist Bridge Error in onBanUser');
      return ;
    }
    if (userBridge.user_type !== UserType.OWNER && userBridge.user_type !== UserType.ADMIN) {
      //exception handler
      // this.logger.debug('Member Cannot Ban Others');
      // throw new HttpException('Member Cannot Ban Others', HttpStatus.UNAUTHORIZED);
      client.emit('ban-fail', 'Member Cannot Ban Others Error in onBanUser');
      return ;
    }
    
    const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    if (!targetBridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('ban-fail', 'Unexist Bridge Error in onBanUser');
      return ;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      //exception handler
      // this.logger.debug('Cannot Ban Owner');
      // throw new HttpException('Cannot Ban Owner', HttpStatus.UNAUTHORIZED);
      client.emit('ban-fail', 'Cannot Ban Owner Error in onBanUser');
      return ;
    }
    if (targetBridge.is_banned) {
      //exception handler
      // this.logger.debug('User Already Banned');
      // throw new HttpException('User Already Banned', HttpStatus.UNAUTHORIZED);
      client.emit('ban-fail', 'User Already Banned Error in onBanUser');
      return ;
    }

    await this.chatService.updateBanStatus(targetBridge, true);

    client.leave(channel.channel_name);
    client.emit('ban-success', channel.channel_id);
    this.server.to(channel.channel_name).emit(`user ${user.nickname} is banned.`);
  }

  @SubscribeMessage('onMuteUser')
  async OnMuteUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      // this.logger.debug('Unidentified User');
      // throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
      client.emit('onmute-fail', 'Unidentified User Error in onMuteUser');
      return ;
    }
    
    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      //exception handler
      // this.logger.debug('Unexist Channel');
      // throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
      client.emit('onmute-fail', 'Unexist Channel Error in onMuteUser');
      return ;
    }
    if (channel.channel_type === ChannelType.DM) {
      //exception handler
      // this.logger.debug('Cannot Mute User On DM Channel');
      // throw new HttpException('Cannot Mute User On DM Channel', HttpStatus.UNAUTHORIZED);
      client.emit('onmute-fail', 'Cannot Mute User On DM Channel Error in onMuteUser');
      return ;
    }
    
    const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!userBridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('onmute-fail', 'Unexist Bridge Error in onMuteUser');
      return ;
    }
    if (userBridge.user_type !== UserType.OWNER && userBridge.user_type !== UserType.ADMIN) {
      //exception handler
      // this.logger.debug('Member Cannot Mute Others');
      // throw new HttpException('Member Cannot Mute Others', HttpStatus.UNAUTHORIZED);
      client.emit('onmute-fail', 'Member Cannot Mute Others Error in onMuteUser');
      return ;
    }
    
    const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    if (!targetBridge) {
      //exception handler
      // this.logger.debug('Unexist Bridge');
      // throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
      client.emit('onmute-fail', 'Unexist Bridge Error in onMuteUser');
      return ;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      //exception handler
      // this.logger.debug('Cannot Mute Owner');
      // throw new HttpException('Cannot Mute Owner', HttpStatus.UNAUTHORIZED);
      client.emit('onmute-fail', 'Cannot Mute Owner Error in onMuteUser');
      return ;
    }
    if (targetBridge.is_muted) {
      //exception handler
      // this.logger.debug('User Already Muted');
      // throw new HttpException('User Already Muted', HttpStatus.UNAUTHORIZED);
      client.emit('onmute-fail', 'User Already Muted Error in onMuteUser');
      return ;
    }

    await this.chatService.updateMuteStatus(targetBridge, true);
    client.emit('onmute-success', channel.channel_id);
    this.server.to(channel.channel_name).emit(`user ${user.nickname} is muted.`);
    
    setTimeout(() => {
      this.unmuteUser(user, channel, targetBridge);
    }, 10 * 1000);
  }
  
  private async unmuteUser(user: User, channel: Channel, targetBridge: UserChannelBridge) {
    await this.chatService.updateMuteStatus(targetBridge, false);

    this.server.to(channel.channel_name).emit(`user ${user.nickname} is unmuted.`);
  }

  // @SubscribeMessage('invite-game')
  // @SubscribeMessage('accept-game')
}
