import { ApiProperty } from "@nestjs/swagger";

// 42 
// user_id, username, nickname, email, avatar

export class CreateUserDto {

    @ApiProperty({
        example: '1232',
        description: 'intraid',
        required: true,
    })
    user_id: number;
    
    @ApiProperty({
        example: 'username',
        description: 'username',
        required: true,
    })
    username: string;

    @ApiProperty({
        example: 'notyet',
        description: 'nickname',
        required: true,
    })
    nickname: string; 

    @ApiProperty({
        example: 'email',
        description: 'email',
        required: true,
    })
	email: string;
	
    @ApiProperty({
        example: 'avatar',
        description: 'avatar string',
        required: true,
    })
	avatar: string;

}