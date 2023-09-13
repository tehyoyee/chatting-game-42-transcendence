import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({namespace: '/chat'})
export class ChatGateway {

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket,
  @MessageBody('roomName') roomName: string) {

    console.log('hi');
    console.log(roomName);
    // client.on('message', (client) => console.log(client));
    client.emit('message', roomName);
    client.broadcast.emit('message', roomName);
  }
}
