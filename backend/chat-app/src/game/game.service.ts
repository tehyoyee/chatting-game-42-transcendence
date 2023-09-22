import { HttpException, Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';

// Logistic function
const logisticFunction = (p1: number, p2: number): number => {
	return Math.round(25 - (50/(1 + 10 ** (Math.abs(p1 - p2) / 400))))
}

@Injectable()
export class GameService {
	constructor(
		private userRepository: UserRepository
	) {}

	async updateGameHistory(winId: number, loseId: number) {
		const winUser = await this.userRepository.getProfileByUserId(winId);
		const loseUser = await this.userRepository.getProfileByUserId(loseId);
		
		if (!winUser || !loseUser) {
			throw new HttpException('User not Found', 404);
		}

		winUser.win_count++;
		loseUser.lose_count++;

		// 점수 변경
		const surplus = logisticFunction(winUser.point, loseUser.point);
		console.log(surplus);
		if (winUser.point > loseUser.point) {
			winUser.point += (25 - surplus);
			loseUser.point -= (25 - surplus);
		} else {
			winUser.point += (25 + surplus);
			loseUser.point -= (25 + surplus);
		}
		await this.userRepository.save(winUser);
		await this.userRepository.save(loseUser);
		// User 히스토리에 등록
		// winUser.match_history

	}
}