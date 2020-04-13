import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

const ora = require('ora');

export default class Logout extends Command {
  static description = 'Clears user credentials and invalidates local session';

  static aliases = [Aliases.LOGOUT];

  async execute() {
    const spinner = ora().start('Logging out');
    await this.codestore.logout();
    spinner.succeed('Your have been successfully logged out.');
  }
}
