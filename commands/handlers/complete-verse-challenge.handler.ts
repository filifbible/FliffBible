import { Command, CommandHandler } from '../command-bus';
import { ProfileService } from '../../services/profileService';

export class CompleteVerseChallengeCommand implements Command {
  readonly type = 'CompleteVerseChallengeCommand';
  constructor(public payload: { profileId: string; challengeId: string; rewardCoins: number }) {}
}

export class CompleteVerseChallengeHandler implements CommandHandler<CompleteVerseChallengeCommand> {
  async execute(command: CompleteVerseChallengeCommand): Promise<void> {
    const { profileId, rewardCoins } = command.payload;

    // 1. Marca a missão de versículo como concluída hoje
    await ProfileService.updateLastActivity(profileId, 'challenge');

    // 2. Concede moedas e pontos de XP proporcionais
    await ProfileService.addRewards(profileId, rewardCoins * 2, rewardCoins);
  }
}
