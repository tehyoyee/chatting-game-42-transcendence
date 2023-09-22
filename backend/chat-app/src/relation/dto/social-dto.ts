import { IsEnum } from "class-validator";
import { RelationType } from "../enum/relation-type.enum";
import { User } from "src/user/entity/user.entity";
import { UserStatus } from "src/user/enum/user-status.enum";

export class SocialDto {
    user: User;
}