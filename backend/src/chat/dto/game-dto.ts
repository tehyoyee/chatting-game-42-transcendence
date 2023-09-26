import { IsNumber, IsPositive, IsString } from 'class-validator';

export class InviteGameDto {
  @IsNumber()
  @IsPositive()
  targetUserId: number;

  @IsString()
  gameMode: string;
  //NORMAL or ADVANCED
}

export class AcceptGameDto {
  @IsNumber()
  @IsPositive()
  hostUserId: number;

  @IsString()
  gameMode: string;
  //NORMAL or ADVANCED
}
