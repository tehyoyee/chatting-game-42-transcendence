import { IsInt, IsPositive } from "class-validator";

export class BlockDto {
    @IsInt()
    @IsPositive()
    userId: number;
}