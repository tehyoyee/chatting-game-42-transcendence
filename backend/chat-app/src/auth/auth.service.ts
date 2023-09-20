import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Observable, firstValueFrom } from 'rxjs';
import * as config from 'config';
import { AxiosRequestConfig } from 'axios';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entity/user.entity';
import { MailService } from './mail.service';
import { Res } from '@nestjs/common';
import { compareSync } from 'bcrypt';

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
		private httpService: HttpService,
		private mailService: MailService,
	) {}
	
	async signUp(code: string, res: Response) {
		try {
			// throw new HttpException('message', 400);
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
			console.log(config.jwt.secret);
			const newAccessToken = this.jwtService.sign({ payload });
			const found = await this.userService.getProfileByUserId(user.data.id);

			if (found) {
				const two_factor = await this.userService.getTwoFactorByUserId(payload.id);
				if (two_factor) {	// 2차인증 ON & 2차인증 안한상태 => 메일보내기
					const clientEmail = await this.userService.getEmailByUserId(payload.id);
					const verificationCode = this.mailService.secondAuthentication(clientEmail);
					this.userService.updateTwoFactorCode(payload.id, verificationCode);
					res.send({
						id: payload.id,
						firstLogin: false,
						two_factor: true
					})
				} else {
					res.cookie('token', newAccessToken, { maxAge: 60*60*1000, httpOnly: false, sameSite: 'lax' });
					res.send({
						id: payload.id,
						firstLogin: false,
						two_factor: false
					})
				}
				return ;
			}

			const createUserDto: CreateUserDto = {
				user_id: user.data.id,
				username: user.data.login,
				nickname: await generateRandomString(12),
				email: user.data.email,
				avatar: "Temporary Avator",
			};

			this.userService.createUser(createUserDto);
			res.cookie('token', newAccessToken, { maxAge: 60*60*1000, httpOnly: false, sameSite: 'lax' });
			res.send({
				id: createUserDto.user_id,
				firstLogin: true,
				two_factor: false
			})
			return;
		} catch (err) {
			console.log(`signUp error: ${err}`);
		}
		return ;
	}

	async checkLoginState(req: Request, res: Response) {
			const token = req.cookies['token'];

			if (!token) {
				throw new HttpException('Unauthorized Token', HttpStatus.UNAUTHORIZED);
			}
			try {
				const { payload } = this.jwtService.verify(token);
			} catch (err) {
				throw new HttpException('Unauthorized Token', HttpStatus.UNAUTHORIZED);
			}
			const { payload } = this.jwtService.verify(token);
			const found = await this.userService.getProfileByUserId(payload.id);	// 토큰에 해당하는 유저찾기
			if (!found) { // 유저정보 없음.
				throw new HttpException('Unregistered User', HttpStatus.UNAUTHORIZED);
			}

			const newToken = this.jwtService.sign({ payload });
			res.cookie('token', newToken, {
				httpOnly: false,
				maxAge: 60 * 60 * 1000,// milli seconds
				sameSite: 'lax',
			});
			res.json({ loggedIn: true, user: payload });
		return;
	}

	signOut(res: Response) {
		res.clearCookie('token').json({ message: "Signned Out" });
	}

	async verifyToken(token: string) {
		try {
			const { payload }  = await this.jwtService.verify(token);
			if (payload)
				return payload;
		
			throw new UnauthorizedException('token is not verified');
		} catch (error) {
			throw new HttpException(`Invalid Token: ${error}`, HttpStatus.UNAUTHORIZED)
		}
	}

	async authTwoFactor(body: any, inputCode: any, res: Response) {
		const thisUser = await this.userService.getProfileByUserId(body.id);
		if (thisUser.auth_code === inputCode) {
			const payload = { username: thisUser.username, id: thisUser.user_id };
			const newAccessToken = this.jwtService.sign({ payload });
			res.cookie('token', newAccessToken, { maxAge: 60*60*1000, httpOnly: false, sameSite: 'lax' });
			res.send({state: true});
			return ;
		} else {
			console.log("invalid varification code");
			res.send({state: false});
		}
		return;
	}
}
