import { Command } from '../../lib/command';

export default class Whoami extends Command {
  static description = 'Display the currently logged in user';

  static aliases = ['whoami'];

  async run() {
    try {
      const user:any = await this.codestore.getMe();
      this.log(user.email);
    } catch (e) {
      this.error(e.message);
    }
  }
}
