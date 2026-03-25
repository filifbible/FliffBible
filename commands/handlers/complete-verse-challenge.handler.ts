import { Command, CommandHandler } from '../command-bus';

export class CompleteVerseChallengeCommand implements Command {
  readonly type = 'CompleteVerseChallengeCommand';
  constructor(public payload: { profileId: string; challengeId: string; rewardCoins: number }) {}
}

export class CompleteVerseChallengeHandler implements CommandHandler<CompleteVerseChallengeCommand> {
  async execute(command: CompleteVerseChallengeCommand): Promise<void> {
    // Atualiza estado / banco via ProfileService mock
    console.log(`Verse challenge completed by ${command.payload.profileId}. Rewarded: ${command.payload.rewardCoins} coins.`);
  }
}
