import * as inquirer from 'inquirer';
import ux from 'cli-ux';
import { bold } from 'chalk';
import Command from '../../lib/command';

export default class Clear extends Command {
  static description = 'Clear all contexts';

  async execute() {
    const data = [
      { context_type: 'Project ID', value: bold.cyan('prj-d28f33cf') },
      { context_type: 'Service ID', value: bold.cyan('srv-2b00042f') }];

    this.log('List of currently set contexts:\n');
    ux.table(data, { context_type: {}, value: {} }, { 'no-truncate': true });
    this.log('');

    inquirer.prompt([
      {
        name: 'confirm',
        type: 'confirm',
        message: 'You are about to clear currently set contexts, do you wish to proceed?',
        default: true,
      },
    ]).then((answers) => {
      if (answers.confirm) {
        this.log('All contexts have been removed.');
      } else {
        this.log('Aborting.');
      }
    });
  }
}
