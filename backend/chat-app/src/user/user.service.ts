import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entity/user.entity';
import { UpdateDescription } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enum/user-status.enum';
import { UserAchievement } from './enum/user-achievements.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        return await this.userRepository.createUser(createUserDto);
    }

    async getMyProfile(id: number, res: Response): Promise<User> {
        return await this.userRepository.getMyProfile(id);
    }

    async getProfileByUserName(nickname: string): Promise<User> {
        return await this.userRepository.getProfileByUserName(nickname);
    }

    async getProfileByUserId(id: number, res: Response): Promise<User> {
        return await this.userRepository.getProfileByUserId(id);
    }

    async getProfileByNickName(username: string): Promise<User> {
        return await this.userRepository.getProfileByNickName(username);
    }

    async updateProfile(id: number, updateUserDto: UpdateUserDto): Promise<void> {
        const found = await this.userRepository.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);

        if (updateUserDto.two_factor === true || updateUserDto.two_factor === false && found.two_factor !== updateUserDto.two_factor)
            await this.userRepository.updateTwoFactor(found, updateUserDto.two_factor);
        
        if (updateUserDto.avatar && found.avatar !== updateUserDto.avatar)
            await this.userRepository.updateAvatar(found, updateUserDto.avatar);
        
        if (updateUserDto.nickname && found.nickname !== updateUserDto.nickname) {
            const duplicate = await this.getProfileByNickName(updateUserDto.nickname);
            if (duplicate)
                throw new ForbiddenException(`${updateUserDto.nickname} 은/는 이미 있는 닉네임입니다.`);
            else
                await this.userRepository.updateNickName(found, updateUserDto.nickname);
        }
    }

    async updateStatus(id: number, status: UserStatus): Promise<User> {
        return await this.userRepository.updateStatus(id, status);
    }

    async updateAchievement(id: number, achievement: UserAchievement): Promise<User> {
        return await this.userRepository.updateAchievement(id, achievement);
    }

    async winGame(id: number): Promise<User> {
        return await this.userRepository.winGame(id);
    }

    async loseGame(id: number): Promise<User> {
        return await this.userRepository.loseGame(id);
    }

}
