import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { access } from "fs";
import { Strategy, Profile } from "passport-42";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42'){
	constructor(private userService: UserService) {
		super({
			clientID: 'u-s4t2ud-29fbe15f121d751a4f64c67f481f6d1f86304859b52cd452f4118aa5bbf4649f',
			clientSecret: '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',
			callbackURL: 'http://localhost:3001',
		});
	}
	async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
	): Promise<any> {
		console.log("asdf");
		console.log(accessToken);
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
