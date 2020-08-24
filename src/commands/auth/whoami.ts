import chalk from 'chalk';
import Command from '../../lib/command';
import IUser from '../../interfaces/user.interface';
import Aliases from '../../common/constants/aliases';
import { NotAuthorizedError } from '../../lib/errors';

export default class Whoami extends Command {
  public static description = 'Display the currently logged in user';

  public static aliases = [Aliases.WHOAMI];

  public static usage = Aliases.WHOAMI;

  public async execute(): Promise<void> {
    try {
      const user: IUser = await this.codestore.getMe();
      this.log(`You're ${chalk.cyan(user.firstName)}, officially ${chalk.cyan(user.lastName)} using ${chalk.cyan(user.email)} as main email${user?.organization?.name ? ` and working for ${chalk.cyan(user.organization.name)}` : ''}. Oh, and you're amazing!`);
    } catch (error) {
      if (error.message === 'GraphQL error: Bad JWT token.') {
        throw new NotAuthorizedError();
      }

      this.error(error.message);
    }
  }
}
