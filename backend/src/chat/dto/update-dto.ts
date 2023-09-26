import { IsInt, IsPositive, IsString } from 'class-validator';

export class UpdateUserInfoDto {
  @IsInt()
  @IsPositive()
  targetUserId: number;

  @IsInt()
  @IsPositive()
  channelId;
}

export class UpdatePasswordDto {
  @IsInt()
  @IsPositive()
  channelId;

  @IsString()
  password: string;
}
