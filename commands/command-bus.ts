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

  private constructor() {}

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
