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
	path: "/api/socket.io",
	namespace: "chat",
	cors: {
		origin: "localhost:3001",
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
    const user = await this.socketToUser(client);
    if (!user) {
    // NOTE: exception is not handled and program stops
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);

      //가능한 방법들
      //0. throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED); auth모듈에 있는 HttpException.filter.ts로 감
      //1. return { statusCode: HttpStatus.UNAUTHORIZED, message: 'Unidentified User' };
      //2. client.disconnect(); 에러 표현 없이 소켓 disconnect
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
  async onCreateDMhannel(
    @ConnectedSocket() client: Socket,
    @MessageBody()dmChannelDto: DmChannelDto) {
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
  async onJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinChannelDto: JoinChannelDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, joinChannelDto.channelId);
    if (bridge.is_banned) {
      this.logger.debug('Bannde User');
      throw new HttpException('Bannde User', HttpStatus.UNAUTHORIZED);
    }

    const channel = await this.chatService.getChannelById(joinChannelDto.channelId);
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

    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channel.channel_id);
    if (!bridge || bridge.is_muted || bridge.is_banned) { //is_banned는 검사 안해도 될 듯
      //exception handler
      this.logger.debug('Cannot Post Message');
      throw new HttpException('Cannot Post Message', HttpStatus.UNAUTHORIZED);
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
  async onLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: number) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
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
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!bridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (bridge.user_type !== UserType.OWNER) {
      //exception handler
      this.logger.debug('Cannot Set Admin');
      throw new HttpException('Cannot Set Admin', HttpStatus.UNAUTHORIZED);
    }

    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }

    await this.chatService.updateUserTypeOfUCBridge(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId, UserType.ADMIN);

    const targetUser = await this.userService.getProfileByUserId(updateUserInfoDto.targetUserId);
    this.server.to(channel.channel_name).emit("admin", targetUser.nickname);
  }

  @SubscribeMessage('set-password')
  async onSetPassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() updatePasswordDto: UpdatePasswordDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    if (updatePasswordDto.password === '') {
      //exception handler
      this.logger.debug('Empty Password');
      throw new HttpException('Empty Password', HttpStatus.UNAUTHORIZED);
    }

    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updatePasswordDto.channelId);
    if (!bridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (bridge.user_type !== UserType.OWNER) {
      //exception handler
      this.logger.debug('Cannot Set Password');
      throw new HttpException('Cannot Set Password', HttpStatus.UNAUTHORIZED);
    }

    const channel = await this.chatService.getChannelById(updatePasswordDto.channelId);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }

    await this.chatService.updatePassword(channel, updatePasswordDto.password);
    this.server.to(channel.channel_name).emit('password setted');
  }

  @SubscribeMessage('change-password')
  async onChangePassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() updatePasswordDto: UpdatePasswordDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, updatePasswordDto.channelId);
    if (!bridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (bridge.user_type !== UserType.OWNER) {
      //exception handler
      this.logger.debug('Cannot Set Password');
      throw new HttpException('Cannot Set Password', HttpStatus.UNAUTHORIZED);
    }

    const channel = await this.chatService.getChannelById(updatePasswordDto.channelId);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }

    await this.chatService.updatePassword(channel, updatePasswordDto.password);
    this.server.to(channel.channel_name).emit('password updated');
  }

  @SubscribeMessage('remove-password')
  async onRemovePassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: number) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const bridge = await this.chatService.checkUserInThisChannel(user.user_id, channelId);
    if (!bridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (bridge.user_type !== UserType.OWNER) {
      //exception handler
      this.logger.debug('Cannot Set Password');
      throw new HttpException('Cannot Set Password', HttpStatus.UNAUTHORIZED);
    }

    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }

    await this.chatService.removePassword(channel);
    this.server.to(channel.channel_name).emit('password removed');
  }

  @SubscribeMessage('kick-user')
  async onKickUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }
    if (channel.channel_type === ChannelType.DM) {
      //exception handler
      this.logger.debug('Cannot Kick User On DM Channel');
      throw new HttpException('Cannot Kick User On DM Channel', HttpStatus.UNAUTHORIZED);
    }

    const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!userBridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (userBridge.user_type !== UserType.OWNER && userBridge.user_type !== UserType.ADMIN) {
      //exception handler
      this.logger.debug('Member Cannot Kick User');
      throw new HttpException('Member Cannot Kick User', HttpStatus.UNAUTHORIZED);
    }

    const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    if (!targetBridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (targetBridge.user_type === UserType.OWNER) {
      //exception handler
      this.logger.debug('Cannot Kick Owner');
      throw new HttpException('Cannot Kick Owner', HttpStatus.UNAUTHORIZED);
    }

    await this.chatService.deleteUCBridge(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    client.leave(channel.channel_name);
    this.server.to(channel.channel_name).emit(`user ${user.nickname} is kicked.`);
  }

  @SubscribeMessage('ban-User')
  async onBanUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }
    if (channel.channel_type === ChannelType.DM) {
      //exception handler
      this.logger.debug('Cannot Ban User On DM Channel');
      throw new HttpException('Cannot Ban User On DM Channel', HttpStatus.UNAUTHORIZED);
    }

    const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!userBridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (userBridge.user_type !== UserType.OWNER && userBridge.user_type !== UserType.ADMIN) {
      //exception handler
      this.logger.debug('Member Cannot Ban User');
      throw new HttpException('Member Cannot Ban User', HttpStatus.UNAUTHORIZED);
    }

    const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    if (!targetBridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (targetBridge.user_type === UserType.OWNER) {
      //exception handler
      this.logger.debug('Cannot Ban Owner');
      throw new HttpException('Cannot Ban Owner', HttpStatus.UNAUTHORIZED);
    }
    if (targetBridge.is_banned) {
      //exception handler
      this.logger.debug('User Already Banned');
      throw new HttpException('User Already Banned', HttpStatus.UNAUTHORIZED);
    }

    await this.chatService.updateBanStatus(targetBridge, true);

    client.leave(channel.channel_name);
    this.server.to(channel.channel_name).emit(`user ${user.nickname} is banned.`);
  }

  @SubscribeMessage('onMuteUser')
  async OnMuteUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto) {
    const user = await this.socketToUser(client);
    if (!user) {
      //exception handler
      this.logger.debug('Unidentified User');
      throw new HttpException('Unidentified User', HttpStatus.UNAUTHORIZED);
    }

    const channel = await this.chatService.getChannelById(updateUserInfoDto.channelId);
    if (!channel) {
      //exception handler
      this.logger.debug('Unexist Channel');
      throw new HttpException('Unexist Channel', HttpStatus.UNAUTHORIZED);
    }
    if (channel.channel_type === ChannelType.DM) {
      //exception handler
      this.logger.debug('Cannot Mute User On DM Channel');
      throw new HttpException('Cannot Mute User On DM Channel', HttpStatus.UNAUTHORIZED);
    }

    const userBridge = await this.chatService.checkUserInThisChannel(user.user_id, updateUserInfoDto.channelId);
    if (!userBridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (userBridge.user_type !== UserType.OWNER && userBridge.user_type !== UserType.ADMIN) {
      //exception handler
      this.logger.debug('Member Cannot Mute User');
      throw new HttpException('Member Cannot Mute User', HttpStatus.UNAUTHORIZED);
    }

    const targetBridge = await this.chatService.checkUserInThisChannel(updateUserInfoDto.targetUserId, updateUserInfoDto.channelId);
    if (!targetBridge) {
      //exception handler
      this.logger.debug('Unexist Bridge');
      throw new HttpException('Unexist Bridge', HttpStatus.UNAUTHORIZED);
    }
    if (targetBridge.user_type === UserType.OWNER) {
      //exception handler
      this.logger.debug('Cannot Mute Owner');
      throw new HttpException('Cannot Mute Owner', HttpStatus.UNAUTHORIZED);
    }
    if (targetBridge.is_muted) {
      //exception handler
      this.logger.debug('User Already Muted');
      throw new HttpException('User Already Muted', HttpStatus.UNAUTHORIZED);
    }

    await this.chatService.updateMuteStatus(targetBridge, true);

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
