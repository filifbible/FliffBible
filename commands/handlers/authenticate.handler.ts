import { Command, CommandHandler } from '../command-bus';
import { AuthService } from '../../services/authService';
import { UserType } from '../../types';

export class AuthenticateCommand implements Command {
  readonly type = 'AuthenticateCommand';
  constructor(public payload: { email: string; password?: string; isRegister?: boolean; userType?: UserType; fullName?: string }) {}
}

export class AuthenticateHandler implements CommandHandler<AuthenticateCommand> {
  async execute(command: AuthenticateCommand): Promise<any> {
    const { email, password, isRegister, userType, fullName } = command.payload;
    if (isRegister && password) {
      return await AuthService.register(email, password, userType || null, fullName);
    } else if (password) {
      return await AuthService.login(email, password);
    }
    throw new Error("Invalid authentication parameters");
  }
}
