import { SubscriptionStatus } from '../enums/subscription-status.enum';

export class SubscriptionEntity {
  constructor(
    public id: string,
    public userId: string,
    public planId: string,
    public status: SubscriptionStatus,
    public nextBillingDate?: Date,
    public trialEnd?: Date
  ) {}

  isTrialActive(): boolean {
    return this.status === SubscriptionStatus.AUTHORIZED && !!this.trialEnd && new Date() <= this.trialEnd;
  }

  isValid(): boolean {
    return this.status === SubscriptionStatus.AUTHORIZED;
  }
}
