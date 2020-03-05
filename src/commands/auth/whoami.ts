import { Command } from '../../lib/command';

export default class Whoami extends Command {
  static description = 'Display the currently logged in user';

  static aliases = ['whoami'];

  async run() {
    this.log('example@code.store');
  }
}
