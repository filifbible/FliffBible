import { Command, CommandHandler } from '../command-bus';
import { ProfileService } from '../../services/profileService';
import { ProfileEntity } from '../../entities/profile.entity';

export class SelectProfileCommand implements Command {
  readonly type = 'SelectProfileCommand';
  constructor(public payload: { profileId: string }) {}
}

export class SelectProfileHandler implements CommandHandler<SelectProfileCommand> {
  async execute(command: SelectProfileCommand): Promise<ProfileEntity | null> {
    // Implementação mockada ou que faria bind ao estado global
    const profiles = await ProfileService.getAllAllProfiles();
    const profile = profiles.find(p => p.id === command.payload.profileId);
    if (!profile) return null;
    
    return new ProfileEntity(profile.id, profile.name, profile.profile_type, profile.points, profile.coins, profile.unlocked_items);
  }
}
