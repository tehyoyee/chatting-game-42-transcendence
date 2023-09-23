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

	async updateGameHistory(winId: number, loseId: number, point1: number, point2: number) {
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

		// GameHistory 업데이트
		// winUser.game_histories.push({
		// 	winner_id: winUser.user_id,
		// 	loser_id: loseUser.user_id,
		// 	score1: point1,
		// 	score2: point2,
		// });
		

		await this.userRepository.save(winUser);
		await this.userRepository.save(loseUser);
		// winUser.match_history
	}
}