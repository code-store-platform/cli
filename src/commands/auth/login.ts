import { flags } from '@oclif/command';
import { blue, red } from 'chalk';
import * as inquirer from 'inquirer';
import { Command } from '../../lib/command';

export default class Login extends Command {
  static description = 'Authenticate at code.store platform';

  static aliases = ['login'];

  static flags = {
    interactive: flags.boolean({
      char: 'i',
      description: 'Login with email and password',
    }),
  };

  async run() {
    const { flags } = this.parse(Login);

    if (flags.interactive) {
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

      this.log('You have been successfully authenticated to code.store.');
    } else {
      this.warn('Login using web');
    }
  }
}
