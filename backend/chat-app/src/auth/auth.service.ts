import { Request, Response } from 'express';
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

	async signUp(code: string, res: Response) {
		try {
			const accessToken = await firstValueFrom(this.httpService.post(`https://api.intra.42.fr/oauth/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`).pipe());

			const axiosConfig: AxiosRequestConfig = {
				headers: {
				Authorization: `Bearer ${accessToken.data.access_token}`
				},
				withCredentials: true,
			}
			const user = await firstValueFrom(this.httpService.get('https://api.intra.42.fr/v2/me', axiosConfig).pipe());
			const userA = {
				email: user.data.email,
				id: user.data.id,
			} 
			const newAccessToken = this.jwtService.sign({ userA });
			res.cookie('token', newAccessToken,{
				httpOnly: true,
				maxAge: 60 * 60,
				sameSite: 'lax',
			});
			res.send();
		} catch (err) {
			console.log(`signUp error: ${err}`);
			res.send();
		}
		return ;
	}

	checkLoginState(req: Request, res: Response) {
		try {
			console.log(req);
			const token = req.cookies['token'];

			if (!token) {
			  res.json({ loggedIn: false });
				return;
			}
			const { userData } = this.jwtService.verify(token);
			const newToken = this.jwtService.sign({ userData });
			res.cookie('token', newToken, {
				httpOnly: true,
				maxAge: 60 * 60 * 1000,// milli seconds
				sameSite: 'lax',
			});
			res.json({ loggedIn: true, user: userData });
		} catch (err) {
			console.log(`checkLoginState error: ${err}`);
			res.json({ loggedIn: false, error: true});
		}
		return;
	}

	signOut(res: Response) {
		res.clearCookie('token').json({ message: "Signned Out" });
		res.send();
	}
}
