import { IsInt, IsPositive } from "class-validator";

export class RelationDto {
    @IsInt()
    @IsPositive()
    senderId: number;
    
    @IsInt()
    @IsPositive()
    receiverId: number;
}

export class BlockDto {
    @IsInt()
    @IsPositive()
    userId: number;
}

export class FriendDto {
    @IsInt()
    @IsPositive()
    userId: number;
}