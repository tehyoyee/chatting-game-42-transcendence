import { DataSource, Repository } from "typeorm";
import { GameHistory } from "./game.history.entity";
import { User } from "src/user/entity/user.entity";
import { UserRepository } from "src/user/user.repository";
import { GameHistoryDto } from "./dto/game.histroy.dto";
export declare class GameRepository extends Repository<GameHistory> {
    private userRepository;
    constructor(dataSource: DataSource, userRepository: UserRepository);
    createGameHistory(user: User, winner_id: number, loser_id: number, winner_nickname: string, loser_nickname: string, score1: number, score2: number): Promise<GameHistoryDto & GameHistory>;
}
