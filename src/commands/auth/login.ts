import { blue } from 'chalk';
import ux from 'cli-ux';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class Login extends Command {
  static description = 'Authenticate at code.store platform';

  static aliases = [Aliases.LOGIN];

  static hidden = false;

  static usage = Aliases.LOGIN;

  async execute() {
    this.warn('Login using web');
    ux.action.start(blue('Starting login process'));

    await this.codestore.loginWeb();

    ux.action.stop(blue('Done'));
    this.log(blue('You have been successfully authenticated to code.store.'));
  }
}
