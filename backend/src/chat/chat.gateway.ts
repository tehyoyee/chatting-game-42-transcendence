import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/user/entity/user.entity';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { NotFoundError, async, map } from 'rxjs';
import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from './enum/user_type.enum';
import {
  DmChannelDto,
  JoinGroupChannelDto,
  GroupChannelDto,
} from './dto/channel-dto';
import { UpdatePasswordDto, UpdateUserInfoDto } from './dto/update-dto';
import { ChannelType } from './enum/channel_type.enum';
import { DmDto, GroupMessageDto, PreviousMessageDto } from './dto/message-dto';
import { UserStatus } from 'src/user/enum/user-status.enum';
import { UserChannelBridge } from './entity/user-channel-bridge.entity';
import { Channel } from './entity/channel.entity';
import { RelationService } from 'src/relation/relation.service';
import { BlockDto, FriendDto } from 'src/relation/dto/relation-dto';
import * as serverConfig from 'config';
import { AcceptGameDto, InviteGameDto } from './dto/game-dto';
import { BridgeDto } from './dto/bridge-dto';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { length } from 'class-validator';
import { constants } from 'perf_hooks';

@WebSocketGateway({
  // path: "/api/socket.io",
  namespace: '/chat',
  cors: {
    origin: `${serverConfig.get('server.url')}:${serverConfig.get(
      'server.front_port',
    )}`,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Cookie',
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private relationServie: RelationService,
    private chatService: ChatService,
  ) {}

  private logger = new Logger('ChatGateway');
  private userSocketMap = new Map();

  //==========================================================================================

  async handleConnection(client: Socket) {
    // console.log('client: ', client);
    this.logger.debug('handle connection in');
    const token: any = client.handshake.query.token;
    const user = await this.socketToUser(client);
    if (!user) {
      this.server.to(client.id).emit('forceLogout');
      return;
    } else if (this.userSocketMap.has(user.user_id)) {
      this.server.to(client.id).emit('forceLogout');
      return;
    } else {
      await this.userService.updateStatus(user.user_id, UserStatus.ONLINE);
      this.userSocketMap.set(user.user_id, client);
    }

    client.data.user = user;

    // const privateChannelName = 'user' + user.user_id.toString();
    // const privateChannel = await this.chatService.getChannelByName(privateChannelName)
    // if (!privateChannel) {
    //   await this.chatService.createPrivateChannelAndBridge(user, user.user_id, privateChannelName);
    // }
    // client.join(privateChannelName);

    const joinedGroupChannels =
      await this.chatService.getJoinedGroupChannelsByUserId(user.user_id);
    for (const c of joinedGroupChannels) {
      client.join(c.channel_name);
    }

    const joinedDmChannels = await this.chatService.getJoinedDmChannelsByUserId(
      user.user_id,
    );
    for (const c of joinedDmChannels) {
      client.join(c.channel_name);
    }

    await this.userService.updateStatus(user.user_id, UserStatus.ONLINE);
    await this.emitUserStatus(user.user_id);
  }

  //==========================================================================================

  async handleDisconnect(client: any) {
    const user = await this.socketToUser(client);
    if (user && this.userSocketMap.has(user.user_id)) {
      this.userSocketMap.delete(user.user_id);
      await this.userService.updateStatus(user.user_id, UserStatus.OFFLINE);
      await this.emitUserStatus(user.user_id);
    } else if (!user) {
      const userId = Number(this.getKeyByValue(this.userSocketMap, client));
      if (userId) {
        this.userSocketMap.delete(userId);
        await this.userService.updateStatus(userId, UserStatus.OFFLINE);
        await this.emitUserStatus(userId);
      }
    }
    client.disconnect();
  }

  private getKeyByValue(map, value) {
    return Object.keys(map).find((key) => map[key] === value);
  }

  //==========================================================================================

  private async socketToUser(client: Socket): Promise<User> {
    // exception 날리지 않고 disconnect하도록 수정
    const token: any = client.handshake.query.token;
    if (!token) {
      this.logger.debug('Null Token');
      // client.disconnect();
      return null;
    }

    try {
      const decoded = await this.authService.verifyTokenSocket(token);
      const user: User = await this.userService.getProfileByUserId(decoded.id);
      return user;
    } catch (err) {
      this.logger.debug(err);
      // client.disconnect();
      return null;
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
    @MessageBody() groupChannelDto: GroupChannelDto,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit(
        'creation-fail',
        'Unidentified User Error in onCreateGroupChannel',
      );
      return;
    }

    const regex = /^.{2,16}$/;
    if (groupChannelDto.channelName !== '' && !regex.test(groupChannelDto.channelName)) {
      client.emit('creation-fail', 'Wrong Input in onCreateGroupChanne');
      return;
    }

    const duplicate = await this.chatService.getChannelByName(
      groupChannelDto.channelName,
    );
    if (duplicate) {
      client.emit(
        'creation-fail',
        'Duplicate Channel Name Error in onCreateGroupChannel',
      );
      return;
    }

    const newChannel = await this.chatService.createGroupChannelAndBridge(
      user,
      groupChannelDto,
    );
    const newBridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      newChannel.channel_id,
    );

    client.emit('creation-success', {
      channel_id: newChannel.channel_id,
      user_type: newBridge.user_type,
    });
    client.join(newChannel.channel_name);
    this.server
      .to(newChannel.channel_name)
      .emit('join', { user_id: user.user_id, user_nickname: user.nickname });
  }

  //==========================================================================================

  //dm방은 leave 없고, close window만 가능 -> 한 번 생성되면 db에 남아있음.
  //dm방은 소셜에서 유저를 클릭했을 때 나오는 dm 버튼을 클릭해서 입장 => 기존 생성된 dm방 있으면 join, 없으면 create and join되도록 수정
  //dm방의 2명은 모두 member로 설정
  //receiver는 게임중일 수도 있으므로 emit으로 join이벤트 할 필요 없음,, <- receiver가 online 일 때만 가능하도록 하면 되지 않을까?

  @SubscribeMessage('enter-dm-channel')
  async onEnterDmChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() dmChannelDto: DmChannelDto,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit(
        'enter-dm-fail',
        'Unidentified User Error in onEnterDmChannel',
      );
      return;
    }

    const receiver = await this.userService.getProfileByUserId(
      dmChannelDto.receiverId,
    );
    if (!receiver) {
      client.emit(
        'enter-dm-fail',
        'Receiver Not Found Error in onEnterDmChannel',
      );
      return;
    }
    if (receiver.status !== UserStatus.ONLINE) {
      client.emit(
        'enter-dm-fail',
        'Receiver Not ONLINE Error in onEnterDmChannel',
      );
      return;
    }

    // const receiverSocket = this.userIdToSocket(receiver.user_id);
    // if (!receiverSocket) {
    //   client.emit('enter-dm-fail', 'Unidentified Receiver User Error in onEnterDmChannel');
    //   return ;
    // }

    let channel: Channel;
    let bridge;
    let receiverBridge;

    const exist = await this.chatService.checkDmRoomExists(
      user.user_id,
      dmChannelDto.receiverId,
    );
    if (exist) {
      channel = exist;
    } else {
      channel = await this.chatService.createDmChannelAndBridges(
        user,
        user.user_id,
        dmChannelDto.receiverId,
      );
      console.debug('dm channel message fail: create new dm channel');
    }

    bridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      channel.channel_id,
    );
    receiverBridge = await this.chatService.checkUserInThisChannel(
      dmChannelDto.receiverId,
      channel.channel_id,
    );

    client.join(channel.channel_name);
    //receiverSocket.join(channel.channel_name);

    client.emit('enter-dm-success', {
      channel_id: channel.channel_id,
      user_type: bridge.user_type,
    });
    // receiverSocket.emit('enter-dm-success', {channel_id: channel.channel_id, user_type: receiverBridge.user_type});

    this.server
      .to(channel.channel_name)
      .emit('join', { user_id: user.user_id, user_nickname: user.nickname });
    // this.server.to(channel.channel_name).emit("join", {user_id: receiver.user_id, user_nickname: receiver.nickname});
    let previousMessages: PreviousMessageDto[] = [];
    previousMessages =
      await this.chatService.getAllMessagesExceptBlockByChannelId(
        user.user_id,
        channel.channel_id,
      );

    this.server.to(client.id).emit('messages', previousMessages);

    // this.server.to(channel.channel_name).emit("join", {
    //   user_id: user.user_id, user_nickname: user.nickname,
    //   receiver_id: receiver.user_id, receiver_nickname: receiver.nickname});
  }

  //==========================================================================================

  @SubscribeMessage('join-group-channel')
  async onJoinGroupChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinGroupChannelDto: JoinGroupChannelDto,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('join-fail', 'Unidentified User Error in onJoinGroupChannel');
      return;
    }

    const bridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      joinGroupChannelDto.channelId,
    );
    if (bridge && bridge.is_banned) {
      client.emit('join-fail', 'Banned User Error in onJoinGroupChannel');
      return;
    }

    const channel = await this.chatService.getChannelById(
      joinGroupChannelDto.channelId,
    );
    if (!channel) {
      client.emit('join-fail', 'Unexist Channel Error in onJoinGroupChannel');
      return;
    }

    if (channel.channel_type === ChannelType.PROTECTED) {
      if (
        !(await this.chatService.checkChannelPassword(
          channel,
          joinGroupChannelDto.password,
        ))
      ) {
        client.emit(
          'join-fail',
          'Incorrect Password Error in onJoinGroupChannel',
        );
        return;
      }
    }

    await this.chatService.createUCBridge(user, channel, UserType.MEMBER);
    const newBridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      channel.channel_id,
    );

    //let inners: BridgeDto[] = [];
    //inners = await this.chatService.getAllUsersInChannelByChannelId(user.user_id, channel.channel_id);

    let previousMessages: PreviousMessageDto[] = [];
    previousMessages =
      await this.chatService.getAllMessagesExceptBlockByChannelId(
        user.user_id,
        channel.channel_id,
      );
    // console.log('preMsgs: ', previousMessages);

    client.join(channel.channel_name);

    client.emit('join-success', {
      channel_id: channel.channel_id,
      user_type: newBridge.user_type,
    });
    //client.emit('get-users-channel', inners);

    this.server.to(client.id).emit('messages', previousMessages);
    this.server
      .to(channel.channel_name)
      .emit('join', { userId: user.user_id, userNickname: user.nickname });
  }

  //==========================================================================================

  //그룹메세지 + dm에 모두 사용
  @SubscribeMessage('post-group-message')
  async onPostGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() groupMessageDto: GroupMessageDto,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('post-fail', 'Unidentified User Error in onPostGroupMessage');
      return;
    }

    console.log('post request');
    const decodedToken = await this.authService.verifyTokenSocket(
      groupMessageDto.token,
    );
    if (!decodedToken) {
      console.log('post fail by invalid token');
      this.server.to(client.id).emit('forceLogout');
      this.handleDisconnect(client);
      return;
    }

    if (groupMessageDto.content === '') {
      client.emit('post-fail', 'Empty Content Error in onPostGroupMessage');
      return;
    }
    const regex = /^.{1,256}$/;
    if (groupMessageDto.content !== '' && !regex.test(groupMessageDto.content)) {
      client.emit('post-fail', 'Wrong Input in onPostGroupMessage');
      return;
    }
    
    const channel = await this.chatService.getChannelById(
      groupMessageDto.channel_id,
    );
    if (!channel) {
      client.emit('post-fail', 'Unexist Channel Error in onPostGroupMessage');
      return;
    }

    const bridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      channel.channel_id,
    );
    if (!bridge || bridge.is_muted || bridge.is_banned) {
      //is_banned는 검사 안해도 될 듯
      client.emit(
        'post-fail',
        'Cannot Post Message Error in onPostGroupMessage',
      );
      return;
    }

    const messageEntity = await this.chatService.createGroupMessage(
      user,
      channel,
      groupMessageDto.content,
    );
    const newMessage = messageEntity.content;

    let inners: BridgeDto[] = [];
    inners = await this.chatService.getAllUsersInChannelByChannelId(
      user.user_id,
      channel.channel_id,
    );

    let listOfWhoBlockedMe: BlockDto[] = [];
    listOfWhoBlockedMe = await this.relationServie.getEveryoneWhoBlockedMe(
      user.user_id,
    );
    // console.log('listofwhoblockedme: ', listOfWhoBlockedMe);

    for (const i of inners) {
      const hasMatchingUser = listOfWhoBlockedMe.some(
        (blockedUser) => blockedUser.userId === i.userId,
      );
      if (hasMatchingUser) {
        continue;
      } else {
        const iSocket = this.userIdToSocket(i.userId);
        if (iSocket) {
          const writerToken: any = client.handshake.query.token;
          const writerDecoded =
            await this.authService.verifyTokenSocket(writerToken);
          const writer = await this.userService.getProfileByUserId(
            writerDecoded.id,
          );
          this.server.to(iSocket.id).emit('message', {
            message: newMessage,
            user_id: writer.user_id,
            user_nickname: writer.nickname,
          });
        }
      }
    }
    //현재 user를 block한 사람들에게는 메세지가 가지 않도록
    // this.server.to(channel.channel_name).fetchSockets()
    //   .then((sockets) => {
    //     sockets.forEach(async (socket) => {
    //       let innerToken:any = client.handshake.query.token;
    //       let innerDecoded = await this.authService.verifyToken(innerToken);
    //       let inner = await this.userService.getProfileByUserId(innerDecoded.id);

    //       if (!listOfWhoBlockedMe.includes({userId: inner.user_id})) {
    //         socket.emit("message", {message: newMessage, user_id: inner.user_id, user_nickname: inner.nickname});
    //       }
    //     })
    //   });

    //채널 전체에 메세지 발송
    //this.server.to(channel.channel_name).emit('message', {message: newMessage, user_id: user.user_id, user_nickname: user.nickname});
    console.log("'post-group-message'");
    //client.emit("message", {message: newMessage, user_id: user.user_id, user_nickname: user.nickname});
    //return newMessage;
  }

  //==========================================================================================

  // @SubscribeMessage('post-dm')
  // async onPostDm(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() dmDto: DmDto) {
  //   const user = await this.socketToUser(client);
  //   if (!user) {
  //     client.emit('post-dm-fail', 'Unidentified User Error in onPostDm');
  //     return ;
  //   }

  //   const receiver = await this.userService.getProfileByUserId(dmDto.receiver_id);
  //   if (!receiver) {
  //     client.emit('post-dm-fail', 'Receiver Not Found Error in onPostDm');
  //     return ;
  //   }
  //   if (receiver.status !== UserStatus.ONLINE) {
  //     client.emit('post-dm-fail', 'Receiver Not ONLINE Error in onPostDm');
  //     return ;
  //   }
  //   if (await this.relationServie.checkBlocked(user.user_id, receiver.user_id)) {
  //     client.emit('post-dm-fail', 'Receiver Not ONLINE Error in onPostDm');
  //     return ;
  //   }

  //   const receiverSocket = this.userIdToSocket(receiver.user_id);
  //   if (!receiverSocket) {
  //     client.emit('post-dm-fail', 'Unidentified Receiver User Error in onPostDm');
  //     return ;
  //   }

  //   if (dmDto.content === '') {
  //     client.emit('post-dm-fail', 'Empty Content Error in onPostDm');
  //     return ;
  //   }

  //   const channel = await this.chatService.checkDmRoomExists(user.user_id, receiver.user_id);
  //   if (!channel) {
  //     client.emit('post-dm-fail', 'Unexist Channel Error in onPostDm');
  //     return ;
  //   }

  //   const newMessage = await this.chatService.createDM(user, channel, dmDto.content);

  //   //dm 받을 사람이 나를 차단했는지 검사 -> 차단했다면, 나는 내 메세지가 보이는데, dm 받을 사람은 내 메세지 보이면 안됨
  //   if (await this.relationServie.checkBlocked(receiver.user_id, user.user_id)) {
  //     //do nothig
  //     return ;
  //   }
  //   this.server.to(channel.channel_name).emit('message', {message: newMessage, user_id: user.user_id, user_nickname: user.nickname});
  //   client.emit('post-dm-success', channel.channel_id);
  // }

  //==========================================================================================

  //dm방 나가기 -> 둘 중 한명만 나가도 방과 브리지 삭제
  @SubscribeMessage('leave-channel')
  async onLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: number,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('leave-fail', 'Unidentified User Error in onLeaveChannel');
      return;
    }

    const bridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      channelId,
    );
    if (!bridge) {
      client.emit('leave-fail', 'Unexist Bridge Error in onLeaveChannel');
      return;
    }

    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      client.emit('leave-fail', 'Unexist Channel Error in onLeaveChannel');
      return;
    }
    // if (channel.channel_type === ChannelType.PRIVATE) {
    //   client.emit('leave-fail', 'Cannot Leave Private Channel Error in onLeaveChannel');
    //   return ;
    // }
    if (channel.channel_type === ChannelType.DM) {
      const receiverId = await this.chatService.getReceiverIdByDmChannelName(
        user.user_id,
        channel.channel_name,
      );
      if (!receiverId) {
        client.emit(
          'leave-fail',
          'Unidentified Receiver User Error in onLeaveChannel',
        );
        return;
      }
      if (user.user_id === receiverId) {
        client.emit(
          'leave-fail',
          'Cannot Leave Private Channel Error in onLeaveChannel',
        );
        return;
      }

      const receiverBridge = await this.chatService.checkUserInThisChannel(
        receiverId,
        channel.channel_id,
      );
      if (receiverBridge) {
        await this.chatService.deleteUCBridge(receiverId, channelId);
      }
      const receiverSocket = await this.userIdToSocket(receiverId);
      if (receiverSocket) {
        receiverSocket.leave(channel.channel_name);
        receiverSocket.emit('leave-success', channel.channel_id);
      }

      await this.chatService.deleteUCBridge(user.user_id, channelId);
      client.leave(channel.channel_name);
      client.emit('leave-success', channel.channel_id);

      await this.chatService.deleteMessagesByChannelId(channel.channel_id);
      await this.chatService.deleteDmChannel(channel.channel_id);

      return;
    }

    await this.chatService.deleteUCBridge(user.user_id, channelId);
    client.leave(channel.channel_name);
    client.emit('leave-success', channel.channel_id);
    this.server
      .to(channel.channel_name)
      .emit('leave', { user_id: user.user_id, user_nickname: user.nickname });

    try {
      await this.chatService.deleteChannelIfEmpty(channelId);
    } catch (ServiceUnavailableException) {
      client.emit('leave-fail', 'Channel Not Deleted Error in onLeaveChannel');
    }
  }

  //==========================================================================================

  @SubscribeMessage('close-channel-window')
  async onCloseChannelWindow(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: number,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit(
        'close-fail',
        'Unidentified User Error in onCloseChannelWindow',
      );
      return;
    }

    const bridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      channelId,
    );
    if (!bridge) {
      client.emit('close-fail', 'Unexist Bridge Error in onCloseChannelWindow');
      return;
    }

    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      client.emit(
        'close-fail',
        'Unexist Channel Error in onCloseChannelWindow',
      );
      return;
    }

    //await this.chatService.deleteUCBridge(user.user_id, channelId);
    client.leave(channel.channel_name);
    client.emit('close-success', channel.channel_id);
    this.server
      .to(channel.channel_name)
      .emit('leave', { user_id: user.user_id, user_nickname: user.nickname });
    //this.server.to(channel.channel_name).emit(`user ${user.nickname} has left`);

    //await this.chatService.deleteChannelIfEmpty(channelId);
  }

  //==========================================================================================

  @SubscribeMessage('set-admin')
  async onSetAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('usermod-fail', 'Unidentified User Error in onSetAdmin');
      return;
    }
    
    const targetUser = await this.userService.getProfileByUserId(
      updateUserInfoDto.targetUserId,
    );
    if (!targetUser) {
      client.emit(
        'usermod-fail',
        'Unidentified Target User Error in onSetAdmin',
      );
      return;
    }
    if (user.user_id === targetUser.user_id) {
      client.emit('usermod-fail', 'Cannot Set Yourself Error in onSetAdmin');
      return;
    }


    const bridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      updateUserInfoDto.channelId,
    );
    if (!bridge) {
      client.emit('usermod-fail', 'Unidentified User Error in onSetAdmin');
      return;
    }
    if (bridge.user_type !== UserType.OWNER &&
        bridge.user_type !== UserType.ADMIN) {
      client.emit(
        'usermod-fail',
        'Member Cannot Set Admin Error in onSetAdmin',
      );
      return;
    }

    const targetBridge = await this.chatService.checkUserInThisChannel(
      updateUserInfoDto.targetUserId,
      updateUserInfoDto.channelId,
    );
    if (!targetBridge) {
      client.emit('usermod-fail', 'Unexist Target Bridge Error in onSetAdmin');
      return;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      client.emit('usermod-fail', 'Cannot Set Owner Error in onSetAdmin');
      return;
    }

    const channel = await this.chatService.getChannelById(
      updateUserInfoDto.channelId,
    );
    if (!channel) {
      client.emit('usermod-fail', 'Unexist Channel Error in onSetAdmin');
      return;
    }

    await this.chatService.updateUserTypeOfUCBridge(
      updateUserInfoDto.targetUserId,
      updateUserInfoDto.channelId,
      UserType.ADMIN,
    );

    client.emit('usermod-success', channel.channel_id);
    this.server.to(channel.channel_name).emit('admin', {
      user_id: targetUser.user_id,
      user_nickname: targetUser.nickname,
    });
  }

  //==========================================================================================
  // set-password change-password 하나로 합치기
  @SubscribeMessage('set-password')
  async onSetPassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() updatePasswordDto: UpdatePasswordDto,
  ) {
    console.log(
      `/chat/set-password: value=${JSON.stringify(updatePasswordDto)}`,
    );
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('setpwd-fail', 'Unidentified User Error in onSetPassword');
      return;
    }

    const regex = /^[a-zA-Z0-9]{4,16}$/;
    if (updatePasswordDto.password !== '' && !regex.test(updatePasswordDto.password)) {
      client.emit('setpwd-fail', 'Wrong Input in onSetPassword');
      return;
    }

    const bridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      updatePasswordDto.channelId,
    );
    if (!bridge) {
      client.emit('setpwd-fail', 'Unexist Bridge Error in onSetPassword');
      return;
    }
    if (bridge.user_type !== UserType.OWNER) {
      client.emit('setpwd-fail', 'Cannot Set Password Error in onSetPassword');
      return;
    }

    const channel = await this.chatService.getChannelById(
      updatePasswordDto.channelId,
    );
    if (!channel) {
      client.emit('setpwd-fail', 'Unexist Channel Error in onSetPassword');
      return;
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
    @MessageBody() channelId: number,
  ) {
    console.log(
      `/chat/remove-password: value=${channelId}, type=${typeof channelId}`,
    );
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit(
        'removepwd-fail',
        'Unidentified User Error in onRemovePassword',
      );
      return;
    }

    const bridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      channelId,
    );
    if (!bridge) {
      client.emit('removepwd-fail', 'Unexist Bridge Error in onRemovePassword');
      return;
    }
    if (bridge.user_type !== UserType.OWNER) {
      client.emit(
        'removepwd-fail',
        'Cannot Set Password Error in onRemovePassword',
      );
      return;
    }

    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) {
      client.emit(
        'removepwd-fail',
        'Unexist Channel Error in onRemovePassword',
      );
      return;
    }

    await this.chatService.removePassword(channel);
    client.emit('removepwd-success', channel.channel_id);
    this.server.to(channel.channel_name).emit('password removed');
  }

  //==========================================================================================

  @SubscribeMessage('kick-user')
  async onKickUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('usermod-fail', 'Unidentified User Error in onKickUser');
      return;
    }

    const userBridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      updateUserInfoDto.channelId,
    );
    if (!userBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onKickUser');
      return;
    }
    if (
      userBridge.user_type !== UserType.OWNER &&
      userBridge.user_type !== UserType.ADMIN
    ) {
      client.emit(
        'usermod-fail',
        'Member Cannot Kick User Error in onKickUser',
      );
      return;
    }

    const channel = await this.chatService.getChannelById(
      updateUserInfoDto.channelId,
    );
    if (!channel) {
      client.emit('usermod-fail', 'Unexist Channel Error in onKickUser');
      return;
    }
    if (channel.channel_type === ChannelType.DM) {
      client.emit(
        'usermod-fail',
        'Cannot Kick User On DM Channel Error in onKickUser',
      );
      return;
    }

    const targetUser = await this.userService.getProfileByUserId(
      updateUserInfoDto.targetUserId,
    );
    if (!targetUser) {
      client.emit('usermod-fail', 'Unexist Target User Error in onKickUser');
      return;
    }

    const targetBridge = await this.chatService.checkUserInThisChannel(
      updateUserInfoDto.targetUserId,
      updateUserInfoDto.channelId,
    );
    if (!targetBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onKickUser');
      return;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      client.emit('usermod-fail', 'Cannot Kick Owner Error in onKickUser');
      return;
    }
    if (user.user_id === targetUser.user_id) {
      client.emit('usermod-fail', 'Cannot Set Yourself Error in onKickUser');
      return;
    }

    const targetUserSocket = this.userIdToSocket(targetUser.user_id);
    if (!targetUserSocket) {
      client.emit(
        'usermod-fail',
        'Unidentified Target User Socket Error in onKickUser',
      );
      return;
    }

    await this.chatService.deleteUCBridge(
      updateUserInfoDto.targetUserId,
      updateUserInfoDto.channelId,
    );

    targetUserSocket.leave(channel.channel_name);

    client.emit('usermod-success', channel.channel_id);
    targetUserSocket.emit('got-kicked', channel.channel_id);

    this.server.to(channel.channel_name).emit('kick', {
      user_id: targetUser.user_id,
      user_nickname: targetUser.nickname,
    });
  }

  //==========================================================================================

  @SubscribeMessage('ban-User')
  async onBanUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('usermod-fail', 'Unidentified User Error in onBanUser');
      return;
    }

    const userBridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      updateUserInfoDto.channelId,
    );
    if (!userBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onBanUser');
      return;
    }
    if (
      userBridge.user_type !== UserType.OWNER &&
      userBridge.user_type !== UserType.ADMIN
    ) {
      client.emit(
        'usermod-fail',
        'Member Cannot Ban Others Error in onBanUser',
      );
      return;
    }

    const channel = await this.chatService.getChannelById(
      updateUserInfoDto.channelId,
    );
    if (!channel) {
      client.emit('usermod-fail', 'Unexist Channel Error in onBanUser');
      return;
    }
    if (channel.channel_type === ChannelType.DM) {
      client.emit(
        'usermod-fail',
        'Cannot Ban User On DM Channel Error in onBanUser',
      );
      return;
    }

    const targetUser = await this.userService.getProfileByUserId(
      updateUserInfoDto.targetUserId,
    );
    if (!targetUser) {
      client.emit('usermod-fail', 'Unexist Target User Error in onBanUser');
      return;
    }
    if (user.user_id === targetUser.user_id) {
      client.emit('usermod-fail', 'Cannot Set Yourself Error in onBanUser');
      return;
    }

    const targetBridge = await this.chatService.checkUserInThisChannel(
      updateUserInfoDto.targetUserId,
      updateUserInfoDto.channelId,
    );
    if (!targetBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onBanUser');
      return;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      client.emit('usermod-fail', 'Cannot Ban Owner Error in onBanUser');
      return;
    }
    if (targetBridge.is_banned) {
      client.emit(
        'usermod-fail',
        'Target User Already Banned Error in onBanUser',
      );
      return;
    }
    const targetUserSocket = this.userIdToSocket(targetUser.user_id);
    if (!targetUserSocket) {
      client.emit(
        'usermod-fail',
        'Unidentified Target User Socket Error in onBanUser',
      );
      return;
    }

    await this.chatService.updateBanStatus(targetBridge, true);

    targetUserSocket.leave(channel.channel_name);

    client.emit('usermod-success', channel.channel_id);
    targetUserSocket.emit('got-banned', channel.channel_id);

    this.server.to(channel.channel_name).emit('ban', {
      user_id: targetUser.user_id,
      user_nickname: targetUser.nickname,
    });
  }

  //==========================================================================================

  @SubscribeMessage('onMuteUser')
  async OnMuteUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateUserInfoDto: UpdateUserInfoDto,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit('usermod-fail', 'Unidentified User Error in onMuteUser');
      return;
    }

    const userBridge = await this.chatService.checkUserInThisChannel(
      user.user_id,
      updateUserInfoDto.channelId,
    );
    if (!userBridge) {
      client.emit('onmute-fail', 'Unexist Bridge Error in onMuteUser');
      return;
    }
    if (
      userBridge.user_type !== UserType.OWNER &&
      userBridge.user_type !== UserType.ADMIN
    ) {
      client.emit(
        'onmute-fail',
        'Member Cannot Mute Others Error in onMuteUser',
      );
      return;
    }

    const channel = await this.chatService.getChannelById(
      updateUserInfoDto.channelId,
    );
    if (!channel) {
      client.emit('usermod-fail', 'Unexist Channel Error in onMuteUser');
      return;
    }
    if (channel.channel_type === ChannelType.DM) {
      client.emit(
        'usermod-fail',
        'Cannot Mute User On DM Channel Error in onMuteUser',
      );
      return;
    }

    const targetUser = await this.userService.getProfileByUserId(
      updateUserInfoDto.targetUserId,
    );
    if (!targetUser) {
      client.emit('usermod-fail', 'Unexist Target User Error in onMuteUser');
      return;
    }
    if (user.user_id === targetUser.user_id) {
      client.emit('usermod-fail', 'Cannot Set Yourself Error in onMuteUser');
      return;
    }

    const targetBridge = await this.chatService.checkUserInThisChannel(
      updateUserInfoDto.targetUserId,
      updateUserInfoDto.channelId,
    );
    if (!targetBridge) {
      client.emit('usermod-fail', 'Unexist Bridge Error in onMuteUser');
      return;
    }
    if (targetBridge.user_type === UserType.OWNER) {
      client.emit('usermod-fail', 'Cannot Mute Owner Error in onMuteUser');
      return;
    }
    if (targetBridge.is_muted) {
      client.emit(
        'usermod-fail',
        'Target User Already Muted Error in onMuteUser',
      );
      return;
    }

    const targetUserSocket = this.userIdToSocket(targetUser.user_id);
    if (!targetUserSocket) {
      client.emit(
        'usermod-fail',
        'Unidentified Target User Socket Error in onMuteUser',
      );
      return;
    }

    await this.chatService.updateMuteStatus(targetBridge, true);

    client.emit('usermod-success', channel.channel_id);
    targetUserSocket.emit('got-mutted', channel.channel_id);

    this.server.to(channel.channel_name).emit('mute', {
      user_id: targetUser.user_id,
      user_nickname: targetUser.nickname,
    });

    setTimeout(() => {
      this.unmuteUser(user, channel, targetUser, targetBridge);
    }, 10 * 1000);
  }

  //==========================================================================================

  private async unmuteUser(
    user: User,
    channel: Channel,
    targetUser: User,
    targetBridge: UserChannelBridge,
  ) {
    await this.chatService.updateMuteStatus(targetBridge, false);

    this.server.to(channel.channel_name).emit('unmute', {
      user_id: targetUser.user_id,
      user_nickname: targetUser.nickname,
    });
  }

  //==========================================================================================

  @SubscribeMessage('invite-game')
  async onInviteGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() inviteGameDto: InviteGameDto,
  ) {
    const user = await this.socketToUser(client);
    if (!user) {
      client.emit(
        'invite-game-fail',
        'Unidentified User Error in onInviteGame',
      );
      return;
    }

    const targetUser = await this.userService.getProfileByUserId(
      inviteGameDto.targetUserId,
    );
    if (!targetUser) {
      client.emit(
        'invite-game-fail',
        'Unidentified Target User Error in onInviteGame',
      );
      return;
    }
    if (targetUser.status === UserStatus.PLAYING) {
      client.emit(
        'invite-game-fail',
        'Target User PLAYING Error in onInviteGame',
      );
      return;
    }
    if (targetUser.status === UserStatus.OFFLINE) {
      client.emit(
        'invite-game-fail',
        'Target User OFFLINE Error in onInviteGame',
      );
      return;
    }
    if (user.user_id === targetUser.user_id) {
      client.emit(
        'usermod-fail',
        'Cannot invite Yourself Error in onInviteGame',
      );
      return;
    }

    const targetUserSocket = this.userIdToSocket(targetUser.user_id);
    if (!targetUserSocket) {
      client.emit(
        'invite-game-fail',
        'Unidentified Target User Socket Error in onInviteGame',
      );
      return;
    }

    //targetUser에게 game invitation을 보냈습니다.
    client.emit('invite-game-success', {
      user_id: targetUser.user_id,
      user_nickname: targetUser.nickname,
    });
    //user가 [inviteGameDto.game_mode] 모드 game invitaion을 보냈습니다.
    targetUserSocket.emit('got-invited', {
      user_id: user.user_id,
      user_nickname: user.nickname,
      gameMode: inviteGameDto.gameMode,
    });
  }

  //==========================================================================================

  // @SubscribeMessage('accept-game')
  // async onAcceptGame(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() acceptGameDto: AcceptGameDto) {
  //     const invitedUser = await this.socketToUser(client);
  //     if (!invitedUser) {
  //       client.emit('accept-game-fail', 'Unidentified Invited User Error in onAcceptGame');
  //       return ;
  //     }

  //     const hostUserSocket = this.userIdToSocket(acceptGameDto.hostUserId);
  //     if (!hostUserSocket) {
  //       client.emit('accept-game-fail', 'Unidentified Host User Socket Error in onAcceptGame');
  //     }

  //     //chat소켓 -> 클라이언트 -> game소켓 -> 게임 시작
  //     // client.emit('accept-game-success', 'accepted');
  //     // hostUserSocket.emit('accept-game-success', 'accepted');
  //     // client.emit('launchGame', {hostUserSocket: hostUserSocket, invitedUserSocket: client, gameMode: acceptGameDto.gameMode});
  //     hostUserSocket.emit('launchGame', {hostUserSocket: hostUserSocket, invitedUserSocket: client, gameMode: acceptGameDto.gameMode});

  //     // this.server.of('/game').emit('launchGame', {hostUserSocket: hostUserSocket, invitedUserSocket: client, gameMode: acceptGameDto.gameMode})
  // }

  //==========================================================================================

  // @SubscribeMessage('decline-game')
  // async onDeclineGame(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() hostId: number) {
  //     const invitedUser = await this.socketToUser(client);
  //     if (!invitedUser) {
  //       client.emit('decline-game-fail', 'Unidentified Invited User Error in onDeclineGame');
  //       return ;
  //     }

  //     const hostUserSocket = this.userIdToSocket(hostId);
  //     if (!hostUserSocket) {
  //       client.emit('decline-game-fail', 'Unidentified Host User Socket Error in onDeclineGame');
  //     }

  //     hostUserSocket.emit('decline-game-success', 'declined');
  //     client.emit('decline-game-success', 'declined');
  // }
  //==========================================================================================

  @SubscribeMessage('gameStatusUpdate')
  async onGameStatusUpdate(@MessageBody() playerId: number) {
    this.emitUserStatus(playerId);
  }

  //==========================================================================================

  private async emitUserStatus(userId: number) {
    //let listOfWhoFriendedMe: FriendDto[] = [];
    //listOfWhoFriendedMe =
     // await this.relationServie.getEveryoneWhoFriendedMe(userId);

    //const currentStatus =
    //  await this.userService.getCurrentUserStatusByUserId(userId);

		this.server.emit('refreshStatus');
    //for (const who of listOfWhoFriendedMe) {
    //  const whoFriendedMeSocket = this.userIdToSocket(who.userId);
    //  if (whoFriendedMeSocket) {
    //    whoFriendedMeSocket.emit('refreshStatus');
    //  }
}
