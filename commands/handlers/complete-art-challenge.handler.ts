import { Command, CommandHandler } from '../command-bus';

export class CompleteArtChallengeCommand implements Command {
  readonly type = 'CompleteArtChallengeCommand';
  constructor(public payload: { profileId: string; artDataUrl: string }) {}
}

export class CompleteArtChallengeHandler implements CommandHandler<CompleteArtChallengeCommand> {
  async execute(command: CompleteArtChallengeCommand): Promise<void> {
    // Processamento de submissão de arte
    console.log(`Art challenge completed by ${command.payload.profileId}. Art size: ${command.payload.artDataUrl.length}`);
  }
}
