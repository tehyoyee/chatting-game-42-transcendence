import { IsEnum, IsNumber, IsPositive, IsString, isEnum } from "class-validator";
import { UserType } from "../enum/user_type.enum";
import { User } from "src/user/entity/user.entity";

export class BridgeDto {
    @IsNumber()
    @IsPositive()
    userId: number;

    @IsString()
    userNickName: string;

    @IsEnum(UserType)
    userType: UserType;

    isMuted: boolean;
}