import { ApiProperty } from "@nestjs/swagger";

//nickname, avatar, 프로필 창에서 수정할 수 있는 입력값들에한 dto
export class UpdateUserDto {
    @ApiProperty({
        example: 'bear',
        description: 'nickname',
        required: true,
    })
    nickname: string;
    
    @ApiProperty({
        example: 'true',
        description: '2_factor',
        required: true,
    })
    two_factor: boolean;

    @ApiProperty({
        example: 'notyet',
        description: 'avatar string',
        required: true,
    })
    avatar: string; 

}