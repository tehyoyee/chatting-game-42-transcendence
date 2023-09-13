import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
// import { getUser } from './decorator/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class UserController {
    constructor(private userService: UserService) {}

    @ApiOperation({ summary: '내 프로필 보기' })
    @Get('/profile')
    //가드 처리
    async getMyProfile(@Body('user_id') id: number, @Req() req: Request): Promise<User> {
        console.log(req);
        return await this.userService.getMyProfile(id);
    }

    @ApiOperation({ summary: '다른 유저 프로필 보기' })
    @Get('/profile/:id')
    async getProfileByUserId(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return await this.userService.getProfileByUserId(id);
    }

    @ApiOperation({ summary: '내 프로필 편집(nickname, two_factor, avatar)' })
    @Patch('/update/:id')
    async updateProfile(@Param('id', ParseIntPipe) id: number,
                        @Body() updateUserDto: UpdateUserDto): Promise<void> {
        await this.userService.updateProfile(id, updateUserDto);
    }
    

}
