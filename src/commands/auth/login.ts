import { flags } from '@oclif/command';
import { blue, red } from 'chalk';
import * as inquirer from 'inquirer';
import { Command } from '../../lib/command';
import { server, emitter, openBrowser } from '../../lib/webAuthHelper';

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

      try {
        const token = await this.codestore.login(login, password);
        this.saveToken(token);
        this.log(blue('You have been successfully authenticated to code.store.'));
      } catch (e) {
        this.error(e);
      }
    } else {
      this.warn('Login using web');

      server.listen(3000);

      await openBrowser();

      await emitter.on('auth', async (result) => {
        const { success, token, error } = result;
        await server.close();
        if (success) {
          this.saveToken(token);
          this.log(blue('You have been successfully authenticated to code.store1.'));
        } else {
          this.error(error);
        }
      });
    }
  }
}
