import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

const ora = require('ora');

export default class Logout extends Command {
  public static description = 'Clears user credentials and invalidates local session';

  public static aliases = [Aliases.LOGOUT];

  public async execute(): Promise<void> {
    const spinner = ora().start('Logging out');
    await this.codestore.logout();
    spinner.succeed('Your have been successfully logged out.');
  }
}
