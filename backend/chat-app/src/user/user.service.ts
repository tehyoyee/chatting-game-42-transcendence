import { ForbiddenException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entity/user.entity';
import { UpdateDescription } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enum/user-status.enum';
import { UserAchievement } from './enum/user-achievements.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { GameHistory } from 'src/game/game.history.entity';
import * as fs from 'fs';
// import { map } from 'rxjs';
import { memoryStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        // private configService: ConfigService
        ) {}

    private logger = new Logger('UserService');

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        return await this.userRepository.createUser(createUserDto);
    }

    async getMyProfile(id: number): Promise<User> {
        return await this.userRepository.getMyProfile(id);
    }

    async getProfileByUserName(nickname: string): Promise<User> {
        return await this.userRepository.getProfileByUserName(nickname);
    }

    async getProfileByUserId(id: number): Promise<User> {
        return await this.userRepository.getProfileByUserId(id);
    }

    async getProfileByNickName(username: string): Promise<User> {
        return await this.userRepository.getProfileByNickName(username);
    }

    // async updateProfile(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    //     const found = await this.userRepository.getProfileByUserId(id);
    //     if (!found)
    //         throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);

    //     if (updateUserDto.two_factor === true || updateUserDto.two_factor === false && found.two_factor !== updateUserDto.two_factor)
    //         await this.userRepository.updateTwoFactor(found, updateUserDto.two_factor);
        
    //     if (updateUserDto.avatar && found.avatar !== updateUserDto.avatar)
    //         await this.userRepository.updateAvatar(found, updateUserDto.avatar);
        
    //     if (updateUserDto.nickname && found.nickname !== updateUserDto.nickname) {
    //         const duplicate = await this.getProfileByNickName(updateUserDto.nickname);
    //         if (duplicate)
    //             throw new ForbiddenException(`${updateUserDto.nickname} 은/는 이미 있는 닉네임입니다.`);
    //         else
    //             await this.userRepository.updateNickName(found, updateUserDto.nickname);
    //     }
    // }

    async getTwoFactorByUserId(id: number): Promise<Boolean> {
        return await this.userRepository.getTwoFactorByUserId(id);
    }
    
    async getEmailByUserId(id: number): Promise<string> {
        return await this.userRepository.getEmailByUserId(id);
    }
    
    // async updateProfile(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    //     const found = await this.userRepository.getProfileByUserId(id);
    //     if (!found)
    //     throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);
    // }
    
    async updateNickName(id: number, nickName: string): Promise<User> {
        const found = await this.userRepository.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);
        if (nickName && found.nickname !== nickName) {
            const duplicate = await this.getProfileByNickName(nickName);
            if (duplicate)
                throw new ForbiddenException(`${nickName} 은/는 이미 있는 닉네임입니다.`);
            
            await this.userRepository.updateNickName(found, nickName);
        }
        return found;
    }

    async getAvatarByUserId(id: number): Promise<string> {
        return await this.userRepository.getAvatarByUserId(id);
    }

    async getCurrentUserStatusByUserId(userId: number) {
        return await this.userRepository.getCurrentUserStatusByUserId(userId);
    }
    
    async updateAvatar(id: number, filePath: string) {
        const found = await this.userRepository.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);
        await this.userRepository.updateAvatar(found, filePath);
    }
    // async updateAvatar(id: number, file, res) {
    //     const found = await this.userRepository.getProfileByUserId(id);
    //     if (!found)
    //         throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);
    //         //유저별 폴더 생성
    //     const uploadFilePath = 'uploads';
    //     try {
    //         if (!fs.existsSync(uploadFilePath)) {
    //             fs.mkdirSync(uploadFilePath);
    //         }
        
    //         //파일 이름
    //         const fileName = found.user_id;
    //         //파일 업로드 경로
    //         const uploadPath: string = __dirname + `/../../${uploadFilePath + '/' + fileName}`;

    //         //파일 생성
    //         fs.writeFileSync(uploadPath, file);
    //         // this.userRepository.updateAvatar(found, uploadPath);
    //     } catch(err) {
    //         throw new HttpException('파일 업로드 중 에러', 404);
    //     }


    // async uploadFileMemory(user_id: number, file: File): any {
    //     //유저별 폴더 생성
    //     const uploadFilePath = `uploads/${user_id}`;
    
    //     if (!fs.existsSync(uploadFilePath)) {
    //         fs.mkdirSync(uploadFilePath);
    //     }
    
    //     //파일 이름
    //     const fileName = user_id;
    //     //파일 업로드 경로
    //     const uploadPath =
    //     __dirname + `/../../${uploadFilePath + '/' + fileName}`;

    //     //파일 생성
    //     fs.writeFileSync(uploadPath, file);

    //     //업로드 경로 반환
    //     // return uploadFileURL(uploadFilePath + '/' + fileName);
    //     this.userRepository.updateAvatar(found, avatar);

    //     };
    // }


    async updateTwoFactor(id: number, twoFactor: boolean): Promise<User> {
        const found = await this.userRepository.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);

        if (found.two_factor !== twoFactor)
            await this.userRepository.updateTwoFactor(found, twoFactor);

        return found;
    }

    async updateStatus(id: number, status: UserStatus): Promise<User> {
        return await this.userRepository.updateStatus(id, status);
    }

    async updateAchievement(id: number, achievement: UserAchievement): Promise<User> {
        return await this.userRepository.updateAchievement(id, achievement);
    }

    async getGameHistoryByUserId(id: number) {
        return await this.userRepository.getGameHistoryByUserId(id);
    }

    async updateGameHistory(id: number, gameHistory: GameHistory): Promise<void> {
        await this.userRepository.updateGameHistory(id, gameHistory);
    }

    async updateGamePoint(id: number, value: number) {
        await this.userRepository.updateGamePoint(id, value);
    }

    async winGame(id: number): Promise<User> {
        await this.userRepository.winGame(id);

        const user = await this.getProfileByUserId(id);
        if (!user) {
            // //exception handler
            this.logger.debug('UnexistUser');
            throw new HttpException('Unexist User', HttpStatus.UNAUTHORIZED);
        }

        const changed = await this.checkAchievementLevelChanged(user);
        if (changed) {
            await this.updateAchievement(id, changed);
        }

        return user;
    }

    async loseGame(id: number): Promise<User> {
        return await this.userRepository.loseGame(id);
    }

    async checkAchievementLevelChanged(user: User): Promise<UserAchievement> {
        if (user.win_count >= 5 && user.achievement < UserAchievement.A5)
            return UserAchievement.A5;
        else if (user.win_count >= 3 && user.achievement < UserAchievement.A3)
            return UserAchievement.A3;
        else if (user.win_count >= 1 && user.achievement < UserAchievement.A1) 
            return UserAchievement.A1;

        return null;
    }

    async updateAuthCodeByUserId(id: number, authCode: string): Promise<void> {
        return await this.userRepository.updateAuthCodeByUserId(id, authCode);
    }

    async getAuthCodeByUserId(id: number): Promise<string> {
        return await this.userRepository.getAuthCodeByUserId(id);
    }

    async updateTwoFactorCode(id: number, newCode: string): Promise<void> {
        return await this.userRepository.updateTwoFactorCode(id, newCode);
    }
}
