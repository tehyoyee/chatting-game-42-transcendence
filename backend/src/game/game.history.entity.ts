import { User } from 'src/user/entity/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GameHistory extends BaseEntity {

	@PrimaryGeneratedColumn()
	game_id: number;

	@ManyToOne(() => User, (user) => user.user_id)
	@JoinColumn()
	player: User;

	@Column()
	winner_id: number;

	@Column()
	loser_id: number;

	@Column()
	winner_nickname: string;

	@Column()
	loser_nickname: string;

	@Column()
	score1: number;

	@Column()
	score2: number;

}