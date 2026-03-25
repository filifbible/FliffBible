export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public subscriptionStatus: 'active' | 'inactive' | 'trial',
    public trialEndDate?: Date
  ) {}

  isActive(): boolean {
    if (this.subscriptionStatus === 'active') return true;
    if (this.subscriptionStatus === 'trial' && this.trialEndDate && new Date() <= this.trialEndDate) return true;
    return false;
  }
}
