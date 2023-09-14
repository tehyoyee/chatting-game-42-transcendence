import { DataSource, Not, Repository } from "typeorm";
import { User } from "./entity/user.entity";
import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { NotFoundError } from "rxjs";
import { UserStatus } from "./enum/user-status.enum";
import { UserAchievement } from "./enum/user-achievements.enum";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {

        const newUser = await this.create({
            user_id: createUserDto.user_id,
            username: createUserDto.username,
            nickname: createUserDto.nickname,
            email: createUserDto.email,
            avatar: createUserDto.avatar,
        });
        await this.save(newUser);
        
        return newUser;
    }

    async getMyProfile(id: number): Promise<User> {
        const currentUser = await this.getProfileByUserId(id);
        if (!currentUser)
            throw new NotFoundException(`유저 ${id}는 없습니다.`);   

        return currentUser;
    }

    async getProfileByUserName(username: string): Promise<User> {
        const found = await this.findOne({
            where: {username: username}
        });

        return found;
    }

    async getProfileByUserId(id: number): Promise<User> {
        const found = await this.findOne({
            where: {user_id: id}
        });

        return found;
    }

    async getProfileByNickName(nickname: string): Promise<User> {
        const found = await this.findOne({
            where: {nickname: nickname}
        });

        return found;
    }
    
    async getTwoFactorByUserId(id: number): Promise<boolean> {
        const found = await this.findOne({
            where: {user_id: id}
        })
        return found.two_factor;
    }

    async getEmailByUserId(id: number): Promise<string> {
        const found = await this.findOne({
            where: {user_id: id}
        })
        return found.email;
    }

    async updateTwoFactor(user: User, newTwoFactor: boolean): Promise<void> {
        user.two_factor = newTwoFactor;
        await this.save(user);
    }
    
    async updateAvatar(user: User, newAvatar: string): Promise<void> {
        user.avatar = newAvatar;
        await this.save(user);
    }

    async updateNickName(user: User, newNickname: string): Promise<void> {
        user.nickname = newNickname;
        await this.save(user);
    }

    async updateStatus(id: number, newStatus: UserStatus): Promise<User> {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);

        found.status = newStatus;
        return await this.save(found);
    }

    async updateAchievement(id: number, newAchievement: UserAchievement): Promise<User> {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);

        found.achievement = newAchievement;
        return await this.save(found);
    }

    async winGame(id: number): Promise<User> {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);

        found.win_count++;
        found.point += 100;
        return await this.save(found);
    }

    async loseGame(id: number): Promise<User> {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);

        found.lose_count++;
        found.point -= 100;
        return await this.save(found);
    }

    async updateAuthCodeByUserId(id: number, authCode: string): Promise<void> {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);
        found.auth_code = authCode;
        return;
    }

    async getAuthCodeByUserId(id: number): Promise<string> {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);
        return found.auth_code;
    }

    async updateTwoFactorCode(id: number, newCode: string): Promise<void> {
        const found = await this.getProfileByUserId(id);
        if (!found)
            throw new NotFoundException(`아이디 ${id} 은/는 존재하지 않습니다.`);
        found.auth_code = newCode;
    }
}