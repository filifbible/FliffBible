import { Command, CommandHandler } from '../command-bus';
import { supabase } from '../../services/supabase';

export class LogoutCommand implements Command {
  readonly type = 'LogoutCommand';
  constructor(public payload?: any) {}
}

export class LogoutHandler implements CommandHandler<LogoutCommand> {
  async execute(command: LogoutCommand): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
}
