import { Command, CommandHandler } from '../command-bus';

export class BuyItemCommand implements Command {
  readonly type = 'BuyItemCommand';
  constructor(public payload: { profileId: string; itemId: string; price: number }) {}
}

export class BuyItemHandler implements CommandHandler<BuyItemCommand> {
  async execute(command: BuyItemCommand): Promise<boolean> {
    // Simula validação de compra - em um cenário real chamaria backend
    console.log(`Profile ${command.payload.profileId} buying item ${command.payload.itemId} for ${command.payload.price} coins.`);
    return true;
  }
}
