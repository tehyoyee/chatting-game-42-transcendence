import { Param, Get, Body, Controller, Post, Req, UseGuards, ValidationPipe, Res } from '@nestjs/common';
// import { AuthCredentialsDto } from './dto/auth-credetial.dto';
import { AuthService } from './auth.service';
// import { AuthGuard } from '@nestjs/passport';
import { FortyTwoAuthGuard } from './guard';
import { Query } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	// @UseGuards(FortyTwoAuthGuard)
	// @Get('/42')
	// async auth(@Request() req) {
	// 	// return req;
	// 	return 'success';
	// 	// return this.authService.auth(req);
	// }
	
	@Get('/')
	asdf() {
		return 'asdf';
	}

	@Get('/signup')
	signUp(@Query('code') code, @Res() res: Response) {
		return this.authService.signUp(code, res);
	}

	@Get('/state')
	checkLoginState(@Req() req: Request, @Res() res: Response) {
		return this.authService.checkLoginState(req, res);
	}

	@Get('/signout')
	signOut(@Res() res: Response) {
		return this.authService.signOut(res);
	}

	@Post('/twofactor')
	async authTwoFactor(@Body() body: any, @Query() inputCode: string) {
		return await this.authService.authTwoFactor(body, inputCode);
	}
	

	// @Get('/2fa')
	// twofactorVarify(@Res() res:)

	// @Get()
	// @UseGuards(AuthGuard('google'))
	// async googleAuth(@Req() req) {
	// }

	// @Get('/google/callback')
	// @UseGuards(AuthGuard('google'))
	// googleAuthRedirect(@Req() req) {
	// 	// console.log(req);
	// 	// return req;
	// 	return this.authService.googleLogin(req);
	// }





	// @Post('/signup')
	// signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
	// 	return this.authService.signUp(authCredentialsDto);
	// }

	// @Post('/signin')
	// signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
	// 	return this.authService.signIn(authCredentialsDto);
	// }

	// @Post('/test')
	// @UseGuards(AuthGuard())
	// test(@Req() req) {
	// 	console.log('req', req);
	// }

	// @Get('/index')
	// index() {
	// 	return "this is the index";
	// }
}
