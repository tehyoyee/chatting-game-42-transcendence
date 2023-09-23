// import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
// import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
// import { HttpStatus } from '@nestjs/common';
// import { Response } from 'express';

// @Catch(WsException)
// export class WsExceptionFilter extends BaseWsExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     // super.catch(exception, host);
//   	// console.log('test', host);
// 	  const ctx = host.switchToHttp();
// 	  const response = ctx.getResponse<Response>();
// 	  const status = exception.getStatus();
// 	  const err = exception.getResponse() as
// 		  | string
// 		  | { error: string; statusCode: 400; message: string[] };

// 	  console.log(status, err);
// 	  if (status === HttpStatus.UNAUTHORIZED) {
// 		  response.clearCookie('token').status(status).json({ loggedIn: false, errCode: status, errMsg: err });
// 	  } else {
// 		  response.status(status).json({ msg: err});
// 	  }
//   }
// }
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