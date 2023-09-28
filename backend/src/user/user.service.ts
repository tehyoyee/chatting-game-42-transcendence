import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entity/user.entity';
import { UserStatus } from './enum/user-status.enum';
import { UserAchievement } from './enum/user-achievements.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { GameHistory } from 'src/game/game.history.entity';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

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

  async getRanking() {
    const ranking = await this.userRepository
      .createQueryBuilder('user')
      .select(
        'RANK () OVER (ORDER BY point DESC) as "rank", user.nickname, user.point',
      )
      .getRawMany();
    return ranking;
  }

  async getTwoFactorByUserId(id: number): Promise<boolean> {
    return await this.userRepository.getTwoFactorByUserId(id);
  }

  async getEmailByUserId(id: number): Promise<string> {
    return await this.userRepository.getEmailByUserId(id);
  }

  async updateNickName(id: number, nickName: string): Promise<User> {
    const found = await this.userRepository.getProfileByUserId(id);
    if (!found) throw new HttpException('Unexist UserId', HttpStatus.NOT_FOUND);

    if (nickName && found.nickname !== nickName) {
      const duplicate = await this.getProfileByNickName(nickName);
      if (duplicate)
        throw new HttpException('Duplicate Nickname', HttpStatus.FORBIDDEN);

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
    if (!found) throw new HttpException('Unexist UserId', HttpStatus.NOT_FOUND);
    await this.userRepository.updateAvatar(found, filePath);
  }

  async updateTwoFactor(id: number, twoFactor: boolean): Promise<User> {
    const found = await this.userRepository.getProfileByUserId(id);
    if (!found) throw new HttpException('Unexist UserId', HttpStatus.NOT_FOUND);

    if (found.two_factor !== twoFactor)
      await this.userRepository.updateTwoFactor(found, twoFactor);

    return found;
  }

  async updateStatus(id: number, status: UserStatus): Promise<User> {
    return await this.userRepository.updateStatus(id, status);
  }

  async updateAchievement(
    id: number,
    achievement: UserAchievement,
  ): Promise<User> {
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
      throw new HttpException('Unexist UserId', HttpStatus.NOT_FOUND);
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
