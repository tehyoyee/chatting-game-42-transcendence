import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/user/entity/user.entity';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { ChannelDto } from './dto/channel-dto';
import { NotFoundError } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { UserType } from './enum/user_type.enum';

@WebSocketGateway({namespace: '/chat'})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

  @WebSocketServer() server: Server;

  accessToken: any;
  currentUser: User;

  connectedUsers: any[] = [];
  channelMembers: User[] = [];

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService) {}

  
  private async definePlayer(client: Socket) {
    try {
      this.accessToken = client.handshake.query.token;
      this.accessToken = await this.authService.verifyToken(this.accessToken);
      this.currentUser = null;
      this.currentUser = await this.userService.getProfileByUserId(this.accessToken.id);

      if (!this.currentUser)
        return this.disconnect(client);

    } catch (error) {
      return this.disconnect(client);
    }
  }

  private disconnect(socket: Socket) {
    socket.disconnect();
  }

  private async getSocketId(id: number): Promise<Socket> {
    for (let user of this.connectedUsers) {
      let decoded = user.handshake.query.token;
      decoded = await this.authService.verifyToken(decoded);

      if (decoded.id === id)
        return user;
    }

    return null;
  }


  async handleConnection(client: Socket) {
    await this.definePlayer(client);

    if (this.currentUser) {
      client.data.currentUser = this.currentUser;
      this.connectedUsers.push(client);
    }
  }

  handleDisconnect(client: any) {
    this.connectedUsers = this.connectedUsers.filter(user => user.id !== client.id);
  }


  @SubscribeMessage('createChannel')
  async onCreateChannel(client: Socket, channelDto: ChannelDto) {
    await this.definePlayer(client);
    if (this.currentUser) {
      const found = await this.chatService.getChannelByName(channelDto.name);
      if (found)
        this.server.to(client.id).emit('channel-exist', channelDto.name);
      else {
        const userNames = channelDto.members;

        for (let userName of userNames) {
          const user: User = await this.userService.getProfileByUserName(userName);

          if (!user)
            throw new NotFoundException(`cannot find user ${user.username}`);

          this.channelMembers.push(user);
        }

        const room = await this.chatService.createChannel(channelDto, this.channelMembers);
        await this.chatService.addMember(client.data.currentUser, room, UserType.OWNER);

      }
    }

  }









  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket,
  @MessageBody('channelName') channelName: string) {

    console.log('hi');
    console.log(channelName);
    
    // client.on('message', (client) => console.log(client));
    client.emit('message', channelName);
    client.broadcast.emit('message', channelName);
  }

  async onChannelJoin(@ConnectedSocket() client: Socket,
  @MessageBody('channelName') channelName: string) {
		client.join(channelName);
	}



}
