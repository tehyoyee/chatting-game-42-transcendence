import { Get, Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Query } from '@nestjs/common';
import { Request, Response } from 'express';

const g_debug = true;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/signup')
  signUp(@Query('code') code, @Res() res: Response) {
    if (g_debug) console.log('/signup');
    return this.authService.signUp(code, res);
  }

  @Get('/state')
  checkLoginState(@Req() req: Request, @Res() res: Response) {
    if (g_debug) console.log('/state');
    return this.authService.checkLoginState(req, res);
  }

  @Get('/signout')
  signOut(@Req() req: Request, @Res() res: Response) {
    if (g_debug) console.log('/signout');
    return this.authService.signOut(req, res);
  }

  @Post('/twofactor')
  authTwoFactor(
    @Body() body: any,
    @Query('inputCode') inputCode: string,
    @Res() res: Response,
  ) {
    if (g_debug) console.log('/twofactor');
    return this.authService.authTwoFactor(body, inputCode, res);
  }
}
