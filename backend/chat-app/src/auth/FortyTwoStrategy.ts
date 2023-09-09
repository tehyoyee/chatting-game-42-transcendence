import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-42";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42'){
	constructor(private userService: UserService) {
		super({
			clientID: 'u-s4t2ud-e365378872dbd555019fb78fe5d6b330ceaea85dfef40a6baefdee45a4803e1a',
			clientSecret: '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',
			callbackURL: 'http://localhost:3000/auth/generate',
		});
	}
	async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
	): Promise<any> {
		console.log("asdf");
		const found = await this.userService.getProfileByUserId(profile._json.id);
		
		if (found) {
			return found;
		}

		// 프론트에서 닉네임 아바타 받아야함.
		const createUserDto: CreateUserDto = {
			user_id: profile._json.id,
			username: profile._json.login,
			nickname: "Arbitrary NickName",
			email: profile._json.email,
			avatar: "Arbitrary Avatar",
		};
		const newUser = this.userService.createUser(createUserDto);

		return newUser;
	}
}
