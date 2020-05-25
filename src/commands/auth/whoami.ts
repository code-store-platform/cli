import Command from '../../lib/command';
import IUser from '../../interfaces/user.interface';
import Aliases from '../../common/constants/aliases';

export default class Whoami extends Command {
  public static description = 'Display the currently logged in user';

  public static aliases = [Aliases.WHOAMI];

  public static usage = Aliases.WHOAMI;

  public async execute(): Promise<void> {
    const user: IUser = await this.codestore.getMe();
    this.log(user.email);
  }
}
