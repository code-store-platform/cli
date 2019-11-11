import {Command, flags} from '@oclif/command'
import { blue, red} from 'chalk';
import * as inquirer from 'inquirer'

export class Login extends Command {

  async run() {
    const prompt: any = await inquirer.prompt([
      {
        type: 'input',
        message: blue('Code.Store: Please enter your email'),
        name: `login`,
        validate: (input) => {
          return input.length > 0
        }
      },
      {
        type: 'password',
        message: blue('Code.Store: Please enter your password'),
        name: `password`,
        when: async (answers) => answers.login,
        validate: async (input) => input.length > 0
      }
    ]);

    const {password, login} = prompt;

    if(password==='123' && login==='muha2399@gmail.com'){
      this.log(blue('You\'ve successfully logged in'))
    }else{
      this.log(red('Bad credentials'))
    }
  }
}
