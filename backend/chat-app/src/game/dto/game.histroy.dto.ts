import { User } from "src/user/entity/user.entity";

export class GameHistoryDto {

	player: User;

	winner_id: number;

	loser_id: number;

	score1: number;

	score2: number;

}