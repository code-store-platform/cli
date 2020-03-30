import { flags } from '@oclif/command';
import { blue, red } from 'chalk';
import * as inquirer from 'inquirer';
import ux from 'cli-ux';
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
      // in this case we the REST call to api was sent, so token was returned to overwrite .codestore/credentials file.
      try {
        const token = await this.codestore.login(login, password);
        this.saveToken(token);
        this.log(blue('You have been successfully authenticated to code.store.'));
      } catch (e) {
        this.error(e);
      }
    } else {
      this.warn('Login using web');
      // launching local server to get redirect from authentication service.
      server.listen(10999);
      // opening browser. See openBrowser.ts for change configurations
      await openBrowser();

      ux.action.start(blue('Starting log in process'));
      // waiting for auth event was emitted to set token/show error and close server
      emitter.on('auth', (result) => {
        const { success, token, error } = result;

        if (success) {
          this.saveToken(token);
        } else {
          this.error(error);
        }

        server.close(() => {
          ux.action.stop(blue('You have been successfully authenticated to code.store.'));
        });
      });
    }
  }
}
