import inquirer from 'inquirer';
import { flags } from '@oclif/command';
import clear from 'clear';
import { Listr } from 'listr2';
import { yellow } from 'chalk';
import Command from '../../lib/command';

export default class Create extends Command {
  public static description = 'Create a new project';

  public static flags = {
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

  public async execute(): Promise<void> {
    clear();

    const { name, proceed } = await inquirer.prompt([
      { name: 'name', message: 'Name of the project:' },
      { name: 'description', message: 'Description of the project' },
      { name: 'proceed', message: 'Is the entered information correct and would like to proceed', type: 'confirm' },
    ]);

    if (!proceed) {
      this.log('Project has not been created');
      return;
    }

    const tasks = new Listr<{}>([{
      title: `Creating Project ${yellow(name)}`,
      task: async (ctx, task): Promise<void> => {
        const { id, name: projectName } = await this.codestore.Project.create(name);

        // eslint-disable-next-line no-param-reassign
        task.title = `Created project "${yellow(projectName)}", Service ID: "${yellow(id)}"`;
      },
      options: { persistentOutput: true },
    }]);

    await tasks.run();
  }
}
