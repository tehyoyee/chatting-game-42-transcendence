import { User } from 'src/user/entity/user.entity';
import { BaseEntity } from 'typeorm';
export declare class GameHistory extends BaseEntity {
    game_id: number;
    player: User;
    winner_id: number;
    loser_id: number;
    winner_nickname: string;
    loser_nickname: string;
    score1: number;
    score2: number;
}
