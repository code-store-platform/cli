import Command from '../../lib/command';
import IUser from '../../interfaces/user.interface';
import Aliases from '../../common/constants/aliases';

export default class Whoami extends Command {
  static description = 'Display the currently logged in user';

  static aliases = [Aliases.WHOAMI];

  static usage = Aliases.WHOAMI;

  async execute() {
    const user: IUser = await this.codestore.getMe();
    this.log(user.email);
  }
}
