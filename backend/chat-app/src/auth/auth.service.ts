import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Observable, firstValueFrom } from 'rxjs';
import * as config from 'config';
import { AxiosRequestConfig } from 'axios';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

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
	
	async signUp(code: string, res: Response) {

		try {
			const generateRandomString = async ( len: number) => {
				const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
				let randomString: string = '';
				for (let i = 0; i < len; i++) {
				const rnum = Math.floor(Math.random() * chars.length);
				randomString += chars.substring(rnum, rnum + 1);
				}
				const checkDuplicate = await this.userService.getProfileByNickName(randomString);
				
				console.log(checkDuplicate);

				if (checkDuplicate) {
					return generateRandomString(len);
				}
				console.log(randomString);
				return randomString;
			}
			const accessToken = await firstValueFrom(this.httpService.post(`https://api.intra.42.fr/oauth/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`).pipe());
			const axiosConfig: AxiosRequestConfig = {
				headers: {
				Authorization: `Bearer ${accessToken.data.access_token}`
				},
				withCredentials: true,
			}
			const user = await firstValueFrom(this.httpService.get('https://api.intra.42.fr/v2/me', axiosConfig).pipe());
			const payload = { username: user.data.login, id: user.data.id };
			const newAccessToken = this.jwtService.sign({ payload });
			const found = await this.userService.getProfileByUserId(user.data.id);

			// EDITED
			// for new user to get cookie
			res.cookie('token', newAccessToken, { maxAge: 60*60*1000, httpOnly: true, sameSite: 'lax' });
			if (found) { 
				res.send("sendCookie");
				return ;
			}
			const createUserDto: CreateUserDto = {
				user_id: user.data.id,
				username: user.data.login,
				nickname: await generateRandomString(12),
				email: user.data.email,
				avatar: "Temporary Avator",
			};
			console.log(createUserDto);
			this.userService.createUser(createUserDto);
			res.send();
			return;
		} catch (err) {
			console.log(`signUp error: ${err}`);
		}
		return ;
	}

	checkLoginState(req: Request, res: Response) {
		try {
			// console.log(req);
			const token = req.cookies['token'];

			if (!token) {
			  res.json({ loggedIn: false });
				return;
			}
			const { payload } = this.jwtService.verify(token);
			const newToken = this.jwtService.sign({ payload });
			res.cookie('token', newToken, {
				httpOnly: true,
				maxAge: 60 * 60 * 1000,// milli seconds
				sameSite: 'lax',
			});
			res.json({ loggedIn: true, user: payload });
		} catch (err) {
			console.log(`checkLoginState error: ${err}`);
			res.json({ loggedIn: false, error: true});
		}
		return;
	}

	signOut(res: Response) {
		res.clearCookie('token').json({ message: "Signned Out" });
	}
}
