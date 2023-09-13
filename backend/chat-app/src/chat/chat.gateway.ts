import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/user/entity/user.entity';

@WebSocketGateway({namespace: '/chat'})
export class ChatGateway {

  @WebSocketServer()
  server: Server;

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
