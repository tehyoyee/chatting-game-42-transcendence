import {
  ArgumentsHost,
  Catch,
  HttpException,
  ExceptionFilter,
  HttpStatus,
  WsExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const err = exception.getResponse() as
      | string
      | { error: string; statusCode: 400; message: string[] };

    console.log(status, err);
    if (status === HttpStatus.UNAUTHORIZED) {
      response
        .clearCookie('token')
        .status(status)
        .json({ loggedIn: false, status: status, message: err });
    } else {
      response.status(status).json({ status: status, msg: err });
    }
  }
}
