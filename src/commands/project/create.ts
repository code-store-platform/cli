import * as inquirer from 'inquirer';
import { flags } from '@oclif/command';
import { bold } from 'chalk';
import { Command } from '../../lib/command';

export default class Create extends Command {
  static description = 'Create a new project';

  static flags = {
    name: flags.string({
      description: 'Name of the project',
    }),
    identifier: flags.string({
      description: 'Unique identifier of the project. Can contain only a-z, _ and - characters',
    }),
    description: flags.string({
      description: 'Description of the project',
    }),
  };

  async execute() {
    const { flags: userFlags } = this.parse(Create);
    let { name, identifier, description } = userFlags;

    if (!name || !userFlags.identifier) {
      const responses: any = await inquirer.prompt([
        {
          name: 'name',
          message: 'Name of the project:',
          type: 'input',
          validate: (input) => {
            if (input.length === 0) {
              return 'Please enter project name';
            }

            return true;
          },
        },
        {
          name: 'identifier',
          message: 'Identifier of the project:',
          type: 'input',
          validate: (input) => {
            const pass = input.match(/^[a-zA-Z0-9]+[a-zA-Z0-9-_]*$/); // identifier cannot begin with - or _
            if (!pass || !(input.length > 0 && input.length <= 255)) {
              return 'Project identifier should be 1-255 characters long and contain alpha-numerical characters, dash and underscores only.';
            }

            return true;
          },
        },
        {
          name: 'description',
          message: 'Description of the project:',
          type: 'input',
        },
      ]);
      name = responses.name;
      identifier = responses.identifier;
      description = responses.description;
    }

    this.log(`Project "${bold(name)}" has successfully been created: https://code.store/project/${identifier}`);
    this.log(`name: ${name}\nidentifier: ${identifier}\ndescription: ${description}`);
  }
}
