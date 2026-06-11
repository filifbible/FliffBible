import { Command, CommandHandler } from '../command-bus';
import { ProfileService } from '../../services/profileService';

export class GameWinCommand implements Command {
  readonly type = 'GameWinCommand';
  constructor(public payload: { profileId: string; gameId: string; coinsWon: number }) {}
}

export class GameWinHandler implements CommandHandler<GameWinCommand> {
  async execute(command: GameWinCommand): Promise<void> {
    const { profileId, coinsWon } = command.payload;

    // Concede moedas e pontos de XP ao vencer um jogo
    await ProfileService.addRewards(profileId, coinsWon, coinsWon);
  }
}
