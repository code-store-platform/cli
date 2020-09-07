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
      let welcomeMessage = "You're";
      if (user.firstName) {
        welcomeMessage += `${chalk.cyan(user.firstName)},`;
      }
      if (user.lastName) {
        welcomeMessage += ` officially ${chalk.cyan(user.lastName)}`;
      }
      welcomeMessage += ` using ${chalk.cyan(user.email)} as main email`;
      if (user?.organization?.name) {
        welcomeMessage += ` and working for ${chalk.cyan(user.organization.name)}`;
      }
      welcomeMessage += ". Oh, and you're amazing!";
      this.log(welcomeMessage);
    } catch (error) {
      if (error.message === 'GraphQL error: Bad JWT token.') {
        throw new NotAuthorizedError();
      }

      this.error(error.message);
    }
  }
}
