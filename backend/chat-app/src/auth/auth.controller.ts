import { Param, Request, Get, Body, Controller, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
// import { AuthCredentialsDto } from './dto/auth-credetial.dto';
import { AuthService } from './auth.service';
// import { AuthGuard } from '@nestjs/passport';
import { FortyTwoAuthGuard } from './guard';
import { Query } from '@nestjs/common';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get('/')
	asdf() {
		return 'asdf';
	}

	@UseGuards(FortyTwoAuthGuard)
	@Get('/42')
	async auth(@Request() req) {
		// return req;
		return 'success';
		// return this.authService.auth(req);
	}
	
	@Get('/generate')
	@UseGuards(FortyTwoAuthGuard)
	fortytwoRedirect(@Query('code') code, @Req() req) {
		// return 'success';
		console.log(code);
		// console.log(req);
		// return this.authService.auth(req);
	}


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
