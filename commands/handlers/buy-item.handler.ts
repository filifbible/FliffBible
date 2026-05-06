import { Command, CommandHandler } from '../command-bus';
import { ProfileService } from '../../services/profileService';
import { ProfileEntity } from '../../entities/profile.entity';

export class BuyItemCommand implements Command {
  readonly type = 'BuyItemCommand';
  constructor(public payload: { profileId: string; itemId: string; price: number }) {}
}

export class BuyItemHandler implements CommandHandler<BuyItemCommand> {
  async execute(command: BuyItemCommand): Promise<boolean> {
    const { profileId, itemId, price } = command.payload;

    // 1. Busca o perfil atual
    const profileData = await ProfileService.getProfile(profileId);
    if (!profileData) return false;

    // 2. Usa a entidade de domínio para validar e gastar moedas
    const profileEntity = new ProfileEntity(
      profileData.id,
      profileData.name,
      profileData.profile_type,
      profileData.points,
      profileData.coins,
      profileData.unlocked_items
    );

    const canBuy = profileEntity.spendCoins(price);
    if (!canBuy) return false;

    // 3. Persiste: desconta moedas e adiciona item à lista de desbloqueados
    await ProfileService.updateProgress(profileId, undefined, profileEntity.coins);
    await ProfileService.addToArray(profileId, 'unlocked_items', itemId);

    return true;
  }
}
