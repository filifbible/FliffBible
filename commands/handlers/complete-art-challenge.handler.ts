import { Command, CommandHandler } from '../command-bus';
import { galleryService } from '../../services/galleryService';
import { ProfileService } from '../../services/profileService';

export class CompleteArtChallengeCommand implements Command {
  readonly type = 'CompleteArtChallengeCommand';
  constructor(public payload: { profileId: string; artDataUrl: string }) {}
}

export class CompleteArtChallengeHandler implements CommandHandler<CompleteArtChallengeCommand> {
  async execute(command: CompleteArtChallengeCommand): Promise<{ path: string }> {
    const { profileId, artDataUrl } = command.payload;

    // 1. Upload para o Storage e registro na tabela gallery_images
    const path = await galleryService.uploadImage(artDataUrl, profileId);

    // 2. Registra conclusão da missão hoje
    await ProfileService.updateLastActivity(profileId, 'art');

    // 4. Recompensa o usuário (50 moedas)
    await ProfileService.addRewards(profileId, 0, 50);

    return { path };
  }
}
