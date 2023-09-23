import { IsNumber, IsPositive, IsString } from "class-validator";

export class InviteGameDto {
    @IsNumber()
    @IsPositive()
    targetUserId: number;

    @IsString()
    game_mode: string;
    //NORMAL or ADVANCED
}
