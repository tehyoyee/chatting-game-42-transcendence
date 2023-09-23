import { IsIn, IsInt, IsPositive, IsString } from "class-validator";

export class GroupMessageDto {
    @IsInt()
    @IsPositive()
    channel_id: number;

    @IsString()
    content: string;
}

export class DmDto {
    @IsInt()
    @IsPositive()
    receiver_id: number;

    @IsString()
    content: string;
}

export class PreviousMessageDto {
    @IsInt()
    @IsPositive()
    writerId: number;

    @IsString()
    content: string;
}