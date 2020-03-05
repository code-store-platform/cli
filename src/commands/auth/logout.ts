import { Command } from '../../lib/command';
import ux from 'cli-ux';

export default class Logout extends Command {
  static description = 'Clears user credentials and invalidates local session';

  static aliases = ['logout'];

  async run() {
    //TODO: add action spinner
    ux.action.start('Logging out');
    await ux.wait(3000);
    ux.action.stop('You have been successfully logged out.');
    // this.log('You have been successfully logged out.');
  }
}
