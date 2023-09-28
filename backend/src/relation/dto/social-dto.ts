import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { RelationType } from '../enum/relation-type.enum';
import { User } from 'src/user/entity/user.entity';
import { UserStatus } from 'src/user/enum/user-status.enum';

// NOTE
export class SocialDto {
  @IsNumber()
  @IsPositive()
  userId: number;

  @IsString()
  userNickName: string;

  @IsBoolean()
  isFriend: boolean;

  @IsBoolean()
  isBlocked: boolean;

  @IsEnum(UserStatus)
  userStatus: UserStatus;
}
