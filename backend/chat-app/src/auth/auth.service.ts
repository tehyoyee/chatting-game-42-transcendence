import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
// import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
// import { userRepository } from 'src/user/user.repository';
import { Observable, firstValueFrom } from 'rxjs';
import * as config from 'config';
import { AxiosRequestConfig } from 'axios';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entity/user.entity';

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
			// console.log(user);
			const payload = user.data.login;
			const newAccessToken = this.jwtService.sign({ payload });

			console.log(`uid ${user.data.id}`);
			const found = await this.userService.getProfileByUserId(user.data.id);
			// console.log(found);

			// EDITED
			// for new user to get cookie
			res.cookie('token', newAccessToken, { maxAge: 60*60*1000, httpOnly: true, sameSite: 'lax' });
			if (found) { 
			//	res.cookie('token', newAccessToken, { maxAge: 60*60*1000, httpOnly: true, sameSite: 'lax' });
				res.send("sendCookie");
				return ;
			}
			const createUserDto: CreateUserDto = {
				user_id: user.data.id,
				username: user.data.login,
				nickname: generateRandomString(12).toString(), // await
				email: user.data.email,
				avatar: "Temporary Avator",
			};
			this.userService.createUser(createUserDto);
			res.send();
			return;
		} catch (err) {
			console.log(`signUp error: ${err}`);
		}
		return ;
	}
		// try {
		// 	const accessToken = await firstValueFrom(this.httpService.post(`https://api.intra.42.fr/oauth/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`).pipe());

		// 	const axiosConfig: AxiosRequestConfig = {
		// 		headers: {
		// 		Authorization: `Bearer ${accessToken.data.access_token}`
		// 		},
		// 		withCredentials: true,
		// 	}
		// 	const user = await firstValueFrom(this.httpService.get('https://api.intra.42.fr/v2/me', axiosConfig).pipe());
		// 	const userA = {
		// 		email: user.data.email,
		// 		id: user.data.id,
		// 	} 
		// 	const newAccessToken = this.jwtService.sign({ userA });
		// 	res.cookie('token', newAccessToken,{
		// 		httpOnly: true,
		// 		maxAge: 60 * 60,
		// 		sameSite: 'lax',
		// 	});
		// 	res.send();
		// } catch (err) {
		// 	console.log(`signUp error: ${err}`);
		// 	res.send();
		// }
		// return ;

	checkLoginState(req: Request, res: Response) {
		try {
			// console.log(req);
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
	}

	async verifyToken(token: string): Promise<User> {
		try {
			const verified = await this.jwtService.verify(token);
			if (typeof verified === 'object' && 'id' in verified)
				return verified;
		
			throw new UnauthorizedException('token is not verified');
		} catch (error) {
			throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED)
		}
	}
}
