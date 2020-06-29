import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class Logout extends Command {
  public static description = 'Clears user credentials and invalidates local session';

  public static aliases = [Aliases.LOGOUT];

  public async execute(): Promise<void> {
    await this.codestore.logout();
    this.log('👍  Hasta la vista, baby. I\'ll be back. You\'ve been successfully logged out.');
  }
}
