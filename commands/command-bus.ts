import { CompleteArtChallengeCommand, CompleteArtChallengeHandler } from './handlers/complete-art-challenge.handler';
import { CompleteVerseChallengeCommand, CompleteVerseChallengeHandler } from './handlers/complete-verse-challenge.handler';
import { AuthenticateCommand, AuthenticateHandler } from './handlers/authenticate.handler';
import { SelectProfileCommand, SelectProfileHandler } from './handlers/select-profile.handler';
import { BuyItemCommand, BuyItemHandler } from './handlers/buy-item.handler';
import { GameWinCommand, GameWinHandler } from './handlers/game-win.handler';
import { LogoutCommand, LogoutHandler } from './handlers/logout.handler';

export interface Command {
  type: string;
  payload?: any;
}

export interface CommandHandler<T extends Command = any, R = any> {
  execute(command: T): Promise<R>;
}

export class CommandBus {
  private static instance: CommandBus;
  private handlers: Map<string, CommandHandler> = new Map();

  private constructor() {
    // Registro automático de todos os handlers do projeto
    this.register('CompleteArtChallengeCommand',   new CompleteArtChallengeHandler());
    this.register('CompleteVerseChallengeCommand', new CompleteVerseChallengeHandler());
    this.register('AuthenticateCommand',           new AuthenticateHandler());
    this.register('SelectProfileCommand',          new SelectProfileHandler());
    this.register('BuyItemCommand',                new BuyItemHandler());
    this.register('GameWinCommand',                new GameWinHandler());
    this.register('LogoutCommand',                 new LogoutHandler());
  }

  public static getInstance(): CommandBus {
    if (!CommandBus.instance) {
      CommandBus.instance = new CommandBus();
    }
    return CommandBus.instance;
  }

  public register(commandType: string, handler: CommandHandler) {
    this.handlers.set(commandType, handler);
  }

  public async execute<R = any>(command: Command): Promise<R> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`Command handler not found for type: ${command.type}`);
    }
    return handler.execute(command);
  }
}

export const commandBus = CommandBus.getInstance();
