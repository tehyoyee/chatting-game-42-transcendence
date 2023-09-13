import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { ChannelType } from "../enum/channel_type.enum";

export class CreateChannelDto {
    @IsNotEmpty()
    @MaxLength(5)
    name: string;

    @IsEnum(ChannelType)
    status: ChannelType;

    @IsOptional()
    password?: string;
}