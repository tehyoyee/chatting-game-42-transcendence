import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Catch(WsException, HttpException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as Socket;
    const eventName = host.switchToWs().getData();	// 이벤트 이름
    const error = exception instanceof WsException ? exception.getError() : exception.getResponse();	// 소켓정보
    const errMessage = error instanceof Object ? { ...error } : { message: error };	// 받은 인자

	// console.log(client);
	console.log(client.id);
	console.log(errMessage);
    client.send(JSON.stringify({
      event: "socketError",
      data: {
        id: (client as any).id,
        rid: eventName.rid,
        ...errMessage
      }
    }));
  }
}