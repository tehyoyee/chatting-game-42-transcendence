/// <reference types="multer" />
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { GameHistory } from 'src/game/game.history.entity';
import { StreamableFile } from '@nestjs/common';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getRanking(): Promise<any[]>;
    getGameHistoryByUserId(id: number): Promise<GameHistory[]>;
    getMyProfile(id: number, req: Request): Promise<User>;
    getProfileByUserId(id: number): Promise<User>;
    getFile(res: Response, id: any): Promise<StreamableFile>;
    updateNickName(id: number, nickName: string): Promise<void>;
    updateAvatar(file: Express.Multer.File, id: number): Promise<{
        fileName: string;
        savedPath: string;
        size: number;
    }>;
    updateTwoFactor(id: number, twoFactor: boolean): Promise<void>;
}
