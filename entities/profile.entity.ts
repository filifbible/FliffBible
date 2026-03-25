import { ProfileType } from '../types';

export class ProfileEntity {
  constructor(
    public id: string,
    public name: string,
    public type: ProfileType,
    public points: number = 0,
    public coins: number = 0,
    public unlockedItems: string[] = []
  ) {}

  addPoints(amount: number): void {
    this.points += amount;
  }

  addCoins(amount: number): void {
    this.coins += amount;
  }

  spendCoins(amount: number): boolean {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }
  
  hasUnlockedItem(itemId: string): boolean {
    return this.unlockedItems.includes(itemId);
  }
}
