import {Command, flags} from '@oclif/command'
import {blue, red} from 'chalk';
import {prompt} from 'inquirer'

const organizations: Array<string> = [
  'Organization 1',
  'Organization 2',
  'Organization 3'
];

export class Config extends Command {
  async run() {
    const promptResult = await prompt([
      {
        type: 'list',
        message: blue('Code.Store: Please select action'),
        name: `action`,
        choices: [blue('Change organization')]
      },
      {
        type: 'list',
        message: blue('Code.Store: Please select action'),
        name: `organization`,
        choices: organizations.map(org => blue(org))
      },
    ]);

    this.log(blue(`Yo've successfully changed organization to ${promptResult.organization}`))
  }
}
