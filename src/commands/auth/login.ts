import { flags } from '@oclif/command';
import { blue } from 'chalk';
import * as inquirer from 'inquirer';
import ux from 'cli-ux';
import { Command } from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class Login extends Command {
  static description = 'Authenticate at code.store platform';

  static aliases = [Aliases.LOGIN];

  static flags = {
    interactive: flags.boolean({
      char: 'i',
      description: 'Login with email and password',
    }),
  };

  async run() {
    const { flags: userFlags } = this.parse(Login);

    if (userFlags.interactive) {
      const prompt: any = await inquirer.prompt([
        {
          type: 'input',
          message: 'Enter your email:',
          name: 'email',
          validate: (input) => input.length > 0,
        },
        {
          type: 'password',
          message: 'Enter your password:',
          name: 'password',
          validate: (input) => input.length > 0,
        },
      ]);
      const { login, password } = prompt;
      // in this case we the REST call to api was sent, so token was returned to overwrite .codestore/credentials file.
      try {
        await this.codestore.login(login, password);
        this.log(blue('You have been successfully authenticated to code.store.'));
      } catch (e) {
        this.error(e);
      }
    } else {
      this.warn('Login using web');

      ux.action.start(blue('Starting login process'));

      try {
        await this.codestore.loginWeb();
        ux.action.stop(blue('Done'));
        this.log(blue('You have been successfully authenticated to code.store.'));
      } catch (e) {
        this.error(e);
      }
    }
  }
}
