import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { ChannelType } from "../enum/channel_type.enum";

export class ChannelDto {
    @IsNotEmpty()
    @MaxLength(5)
    name: string;

    @IsNotEmpty()
    type: string;

    @IsOptional()
    password?: string;

    members: any[];

}