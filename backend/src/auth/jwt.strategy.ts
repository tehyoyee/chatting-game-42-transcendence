import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/user/entity/user.entity";
import { UserRepository } from "../user/user.repository";
import * as config from 'config';
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private userService: UserService
    ) {
        super({
            secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate(payload) {
        // const { username, id } = payload;
        // console.log(username, id);
        // const found: User = await this.userService.getProfileByUserId(id);

        // // if(!found) {
        // //     console.log("asdf");
        // //     throw new UnauthorizedException("인증되지않은 사용자");
        // // }
        // return id;
    }
}