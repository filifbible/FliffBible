import { Command, CommandHandler } from '../command-bus';

export class GameWinCommand implements Command {
  readonly type = 'GameWinCommand';
  constructor(public payload: { profileId: string; gameId: string; coinsWon: number }) {}
}

export class GameWinHandler implements CommandHandler<GameWinCommand> {
  async execute(command: GameWinCommand): Promise<void> {
    // Processamento de vitória num minigame
    console.log(`Game ${command.payload.gameId} won by ${command.payload.profileId}. Rewarded: ${command.payload.coinsWon} coins.`);
  }
}
