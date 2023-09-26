import { UserRepository } from 'src/user/user.repository';
import { GameRepository } from './game.repository';
import { UserService } from 'src/user/user.service';
export declare class GameService {
    private readonly userRepository;
    private userService;
    private gameRepository;
    constructor(userRepository: UserRepository, userService: UserService, gameRepository: GameRepository);
    updateGameHistory(winId: number, loseId: number, point1: number, point2: number): Promise<void>;
}
