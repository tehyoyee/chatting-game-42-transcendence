import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
// import { getUser } from './decorator/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class UserController {
    constructor(private userService: UserService) {}

    // 없어도 될듯? to jiwkwon
    // @ApiOperation({ summary: '신규계정생성' })
    // @Post()
    // async createUser(@Body('username') username: string): Promise<User> {
    //     const found = await this.userService.getProfileByUserName(username);
    //     if (found)
    //         return found;
        
    //     console.log('username: ', username);
    //     return await this.userService.createUser(username);
    // }

    @ApiOperation({ summary: '내 프로필 보기' })
    @Get('/profile')
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
