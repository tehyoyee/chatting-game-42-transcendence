import { IsEnum, IsNumber, IsPositive, isEnum } from "class-validator";
import { UserType } from "../enum/user_type.enum";
import { User } from "src/user/entity/user.entity";

export class BridgeDto {
    user: User;

    @IsEnum(UserType)
    userType: UserType;

    isMuted: boolean;
}