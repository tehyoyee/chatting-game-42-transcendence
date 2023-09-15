import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
// import { getUser } from './decorator/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation } from '@nestjs/swagger';

const g_debug = true;

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
				if (g_debug)
					console.log('/profile/:id');
				const user = await this.userService.getProfileByUserId(id);
				console.log(`user after update=${JSON.stringify(user)}`);
        return await this.userService.getProfileByUserId(id);
    }

    @ApiOperation({ summary: '내 프로필 편집(nickname, two_factor, avatar)' })
    @Patch('/updateName/:id/:nickName')
    async updateNickName(@Param('id', ParseIntPipe) id: number,
                        @Param('nickName') nickName: string): Promise<void> {
				if (g_debug)
					console.log('/updateName/:id/:nickName');
        await this.userService.updateNickName(id, nickName);
    }
    
    @Patch('/updateAvatar/:id/:avatar')
    async updateAvatar(@Param('id', ParseIntPipe) id: number,
                        @Param('avatar') avatar: string): Promise<void> {
				if (g_debug)
					console.log('/updateAvatar/:id/:avatar');
        await this.userService.updateAvatar(id, avatar);
    }
    
		// NOTE: even if twoFactor is typed to boolean, typeof(twoFactor) is string.
		// it should be typed to string to work properly.
    @Patch('/updateTFA/:id/:twoFactor')
    async updateTwoFactor(@Param('id', ParseIntPipe) id: number,
                       @Param('twoFactor') twoFactor: string): Promise<void> {
				if (g_debug)
					console.log('/updateTFA/:id/:twoFactor');
        await this.userService.updateTwoFactor(id, twoFactor === "true" ? true : false);
    }
    

}
