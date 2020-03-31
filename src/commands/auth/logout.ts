import { Command } from '../../lib/command';

export default class Logout extends Command {
  static description = 'Clears user credentials and invalidates local session';

  static aliases = ['logout'];

  async run() {
    const ora = require('ora');
    const spinner = ora().start('Logging out');
    await this.codestore.logout();
    spinner.succeed('Your have been successfully logged out.');
  }
}
