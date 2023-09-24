import { DataSource, Repository } from "typeorm";
import { GameHistory } from "./game.history.entity";
import { Injectable } from '@nestjs/common';
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/user.service";
import { UserRepository } from "src/user/user.repository";
import { GameHistoryDto } from "./dto/game.histroy.dto";

@Injectable()
export class GameRepository extends Repository<GameHistory> {
    constructor(
		dataSource: DataSource,
		private userRepository: UserRepository
	) {
        super(GameHistory, dataSource.createEntityManager())
	}
	async createGameHistory(user: User, winner_id: number, loser_id: number, winner_nickname: string, loser_nickname: string, score1: number, score2: number) {
		const newGameHistory: GameHistoryDto = {
			player: user,
			winner_id: winner_id,
			loser_id: loser_id,
			winner_nickname: winner_nickname,
			loser_nickname: loser_nickname,
			score1: score1,
			score2: score2
		}
		const history = await this.save(newGameHistory);
		return history;
	}
}
