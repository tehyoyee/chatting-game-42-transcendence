import { Controller, Get } from "@nestjs/common";
import { GameService } from './game.service';

@Controller('game')
export class GameController {
	constructor(
		private gameService: GameService
	) {}

	@Get('/ranking')
	async getRanking() {
		return await this.gameService.getRanking();
	}
}