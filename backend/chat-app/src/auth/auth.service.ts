import { Injectable, UnauthorizedException } from '@nestjs/common';
// import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
// import { userRepository } from 'src/user/user.repository';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService
	) {}

	auth(req) {
		// console.log(req);
		return req;
	}
}

