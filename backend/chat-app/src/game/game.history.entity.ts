import { User } from 'src/user/entity/user.entity';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GameHistory extends BaseEntity {
	@PrimaryGeneratedColumn()
	game_id: number;

	@ManyToOne(type => User)
	user_id: number;

	@Column()
	winner_id: string;

	@Column()
	loser_id: string;

	@Column()
	score1: number;

	@Column()
	score2: number;
}