import { ProfileEntity } from './profile.entity';
import { User } from './user.entity';

export class Account {
  constructor(
    public user: User,
    public profiles: ProfileEntity[] = []
  ) {}

  canAddProfile(): boolean {
    return this.profiles.length < 4;
  }

  addProfile(profile: ProfileEntity): void {
    if (this.canAddProfile()) {
      this.profiles.push(profile);
    } else {
      throw new Error("Maximum profiles reached for this account.");
    }
  }
}
