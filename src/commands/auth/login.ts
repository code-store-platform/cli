import { blue } from 'chalk';
import ux from 'cli-ux';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class Login extends Command {
  public static description = 'Authenticate at code.store platform';

  public static aliases = [Aliases.LOGIN];

  public static hidden = false;

  public static usage = Aliases.LOGIN;

  public async execute(): Promise<void> {
    this.warn('Login using web');
    ux.action.start(blue('Starting login process'));

    await this.codestore.loginWeb();

    ux.action.stop(blue('Done'));
    this.log(blue('You have been successfully authenticated to code.store.'));
  }
}
