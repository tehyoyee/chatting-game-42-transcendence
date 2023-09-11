import { Response, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
// import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
// import { userRepository } from 'src/user/user.repository';
import { Observable, firstValueFrom } from 'rxjs';
import * as config from 'config';
import { AxiosRequestConfig } from 'axios';

const dbconfig = config.get('intra');
const grant_type = dbconfig.get('grant_type');
const client_id = dbconfig.get('client_id');
const client_secret = dbconfig.get('client_secret');
const redirect_uri = dbconfig.get('redirect_uri');

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private readonly httpService: HttpService,
	) {}
	
	auth(req) {
		// console.log(req);
		return req;
	}

	async signUp(code: string, res: any) {
		const accessToken = await firstValueFrom(this.httpService.post(`https://api.intra.42.fr/oauth/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`).pipe());

		const axiosConfig: AxiosRequestConfig = {
			headers: {
			Authorization: `Bearer ${accessToken.data.access_token}`
			},
			withCredentials: true,
		}
		const user = await firstValueFrom(this.httpService.get('https://api.intra.42.fr/v2/me', axiosConfig).pipe());
		const userA = user.data.email;
		const newAccessToken = this.jwtService.sign({userA});
		res.cookie('token', newAccessToken,{
			httpOnly: true,
		 	maxAge: 60 * 60
		});
		return ;
	}

	checkLoginState(req: Request) {
	}
}
