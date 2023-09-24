import { Bind, Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
// import { getUser } from './decorator/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation } from '@nestjs/swagger';
import { GameHistory } from 'src/game/game.history.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

const g_debug = true;

@Controller()
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(AuthGuard())
    @Get('/profile/game/:id')
    async getGameHistoryByUserId(@Param('id', ParseIntPipe) id: number): Promise<GameHistory[]> {
        return await this.userService.getGameHistoryByUserId(id);
    }

    @UseGuards(AuthGuard())
    @Get('/profile')
    //가드 처리
    async getMyProfile(@Body('user_id') id: number, @Req() req: Request): Promise<User> {
        console.log(req);
        return await this.userService.getMyProfile(id);
    }

    @UseGuards(AuthGuard())
    @Get('/profile/:id')
    async getProfileByUserId(@Param('id', ParseIntPipe) id: number): Promise<User> {
				if (g_debug)
					console.log('/profile/:id');
        return await this.userService.getProfileByUserId(id);
    }

    @UseGuards(AuthGuard())
    @Patch('/updateName/:id/:nickName')
    async updateNickName(@Param('id', ParseIntPipe) id: number,
                        @Param('nickName') nickName: string): Promise<void> {
				if (g_debug)
					console.log('/updateName/:id/:nickName');
        await this.userService.updateNickName(id, nickName);
    }
    

    @Post('/updateAvatar/:id')
    @UseInterceptors(FileInterceptor('file'))
    @Bind(UploadedFile())
    updateAvatar(@UploadedFile() file: Express.Multer.File, @Param('id', ParseIntPipe)id: number, @Res() res: Response) {
        // this.userService.updateAvatar(id, file);
        console.log(file);
    }

    @Patch('/updateTFA/:id/:twoFactor')
    @UseGuards(AuthGuard())
    async updateTwoFactor(@Param('id', ParseIntPipe) id: number,
                       @Param('twoFactor', ParseBoolPipe) twoFactor: boolean): Promise<void> {
				if (g_debug)
					console.log('/updateTFA/:id/:twoFactor');
        await this.userService.updateTwoFactor(id, twoFactor);
    }
    

}
