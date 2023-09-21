import { IsInt, IsPositive } from "class-validator";

export class RelationDto {
    @IsInt()
    @IsPositive()
    senderId: number;
    
    @IsInt()
    @IsPositive()
    receiverId: number;
}