import { HttpException, Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { GameRepository } from './game.repository';
import { UserService } from 'src/user/user.service';

// Logistic function
const logisticFunction = (p1: number, p2: number): number => {
	return Math.round(25 - (50/(1 + 10 ** (Math.abs(p1 - p2) / 400))))
}

@Injectable()
export class GameService {
	constructor(
		private userRepository: UserRepository,
		private userService: UserService,
		private gameRepository: GameRepository,
	) {}

	async updateGameHistory(winId: number, loseId: number, point1: number, point2: number) {
		const winUser = await this.userService.getProfileByUserId(winId);
		const loseUser = await this.userService.getProfileByUserId(loseId);

		// 승패 변경
		await this.userService.winGame(winUser.user_id);
		await this.userService.loseGame(loseUser.user_id);

		// 점수 변경
		const surplus = logisticFunction(winUser.point, loseUser.point);
		if (winUser.point > loseUser.point) {
			await this.userService.updateGamePoint(winUser.user_id, (25 - surplus));
			await this.userService.updateGamePoint(loseUser.user_id, -(25 + surplus));
		} else {
			await this.userService.updateGamePoint(winUser.user_id, 25 + surplus);
			await this.userService.updateGamePoint(loseUser.user_id, -(25 + surplus));
		}

		// 게임기록 변경
		let newGameHistory = await this.gameRepository.createGameHistory(winUser, winUser.user_id, loseUser.user_id, point1, point2);
		await this.userService.updateGameHistory(winUser.user_id, newGameHistory);
		newGameHistory = await this.gameRepository.createGameHistory(loseUser, winUser.user_id, loseUser.user_id, point2, point1);
		await this.userService.updateGameHistory(winUser.user_id, newGameHistory);
	}
}